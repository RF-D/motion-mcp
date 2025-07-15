import { config } from 'dotenv';
import { MotionApiClient } from '../src/api/client.js';

config();

if (!process.env.MOTION_API_KEY) {
  throw new Error('MOTION_API_KEY is required for tests');
}

export const testClient = new MotionApiClient({
  apiKey: process.env.MOTION_API_KEY,
  baseUrl: 'https://api.usemotion.com/v1',
  rateLimitPerMinute: 10, // Use conservative limit for tests
});

export const TEST_WORKSPACE_NAME = 'Test';

export interface TestContext {
  client: MotionApiClient;
  workspaceId?: string;
}

export async function setupTestWorkspace(): Promise<string> {
  const workspaces = await testClient.listWorkspaces();
  const testWorkspace = workspaces.workspaces.find(w => w.name === TEST_WORKSPACE_NAME);
  
  if (!testWorkspace) {
    throw new Error(`Test workspace "${TEST_WORKSPACE_NAME}" not found. Please create it in Motion.`);
  }
  
  return testWorkspace.id;
}

export async function cleanupTestData(pattern: string): Promise<void> {
  const tasks = await testClient.listTasks({ name: pattern });
  
  for (const task of tasks.tasks || []) {
    if (task.name.includes(pattern)) {
      await testClient.deleteTask(task.id);
    }
  }
}

export function generateTestId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}