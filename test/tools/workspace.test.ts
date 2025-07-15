import { test } from 'node:test';
import assert from 'node:assert';
import { testClient, setupTestWorkspace, TEST_WORKSPACE_NAME } from '../setup.js';
import { registerWorkspaceTools } from '../../src/tools/workspace.js';
import { testTool, assertHasProperty, assertIsArray, assertIsString, createTestContext } from '../utils.js';

test('Workspace Tools', async (t) => {
  const tools = registerWorkspaceTools(testClient);
  let testWorkspaceId: string;
  
  await t.test('should register 2 workspace tools', () => {
    assert.strictEqual(tools.length, 2);
    assert.strictEqual(tools[0].name, 'motion_list_workspaces');
    assert.strictEqual(tools[1].name, 'motion_get_workspace');
  });
  
  await t.test('motion_list_workspaces', async (t) => {
    const listTool = tools[0];
    
    await createTestContext('should list all workspaces', async () => {
      const result = await testTool(listTool, {}, (res) => {
        assertHasProperty(res, 'workspaces');
        assertHasProperty(res, 'count');
        assertIsArray(res.workspaces, 'workspaces');
        assert(res.count >= 1, 'Should have at least one workspace');
        
        const testWorkspace = res.workspaces.find((w: any) => w.name === TEST_WORKSPACE_NAME);
        assert(testWorkspace, `Should find the "${TEST_WORKSPACE_NAME}" workspace`);
        testWorkspaceId = testWorkspace.id;
      });
    });
    
    await createTestContext('should handle pagination cursor', async () => {
      const result = await testTool(listTool, { cursor: 'test-cursor' }, (res) => {
        assertHasProperty(res, 'workspaces');
        assertHasProperty(res, 'meta');
        assertIsArray(res.workspaces, 'workspaces');
      });
    });
  });
  
  await t.test('motion_get_workspace', async (t) => {
    const getTool = tools[1];
    
    await createTestContext('should validate required workspaceId parameter', async () => {
      await assert.rejects(
        async () => await getTool.handler({}),
        {
          name: 'ZodError'
        }
      );
    });
    
    await createTestContext('should validate workspaceId is not empty', async () => {
      await assert.rejects(
        async () => await getTool.handler({ workspaceId: '' }),
        {
          name: 'ZodError'
        }
      );
    });
    
    await createTestContext('should get workspace details', async () => {
      if (!testWorkspaceId) {
        testWorkspaceId = await setupTestWorkspace();
      }
      
      const result = await testTool(getTool, { workspaceId: testWorkspaceId }, (res) => {
        assertHasProperty(res, 'id');
        assertHasProperty(res, 'name');
        assertHasProperty(res, 'teamId');
        assertHasProperty(res, 'taskStatuses');
        assertHasProperty(res, 'labels');
        
        assert.strictEqual(res.id, testWorkspaceId);
        assert.strictEqual(res.name, TEST_WORKSPACE_NAME);
        assertIsArray(res.taskStatuses, 'taskStatuses');
        assertIsArray(res.labels, 'labels');
      });
    });
  });
});