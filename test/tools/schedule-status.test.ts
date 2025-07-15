import { test } from 'node:test';
import assert from 'node:assert';
import { testClient, setupTestWorkspace } from '../setup.js';
import { registerScheduleTools } from '../../src/tools/schedule.js';
import { registerStatusTools } from '../../src/tools/status.js';
import { testTool, assertHasProperty, assertIsArray, createTestContext } from '../utils.js';

test('Schedule and Status Tools', async (t) => {
  let testWorkspaceId: string;
  
  await t.beforeEach(async () => {
    if (!testWorkspaceId) {
      testWorkspaceId = await setupTestWorkspace();
    }
  });
  
  await t.test('Schedule Tools', async (t) => {
    const tools = registerScheduleTools(testClient);
    
    await t.test('should register 2 schedule tools', () => {
      assert.strictEqual(tools.length, 2);
      assert.strictEqual(tools[0].name, 'motion_get_scheduled_tasks');
      assert.strictEqual(tools[1].name, 'motion_get_work_schedules');
    });
    
    await t.test('motion_get_scheduled_tasks', async () => {
      const getTool = tools[0];
      
      await createTestContext('should get scheduled tasks', async () => {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        
        const result = await testTool(getTool, {
          startDate: today,
          endDate: tomorrow
        }, (res) => {
          assertHasProperty(res, 'schedules');
          assertHasProperty(res, 'count');
          assertIsArray(res.schedules, 'schedules');
        });
      });
    });
    
    await t.test('motion_get_work_schedules', async () => {
      const getTool = tools[1];
      
      await createTestContext('should get work schedules', async () => {
        const result = await testTool(getTool, {}, (res) => {
          assertHasProperty(res, 'workSchedules');
          assertHasProperty(res, 'count');
          assertIsArray(res.workSchedules, 'workSchedules');
        });
      });
    });
  });
  
  await t.test('Status Tools', async (t) => {
    const tools = registerStatusTools(testClient);
    
    await t.test('should register 1 status tool', () => {
      assert.strictEqual(tools.length, 1);
      assert.strictEqual(tools[0].name, 'motion_list_statuses');
    });
    
    await t.test('motion_list_statuses', async () => {
      const listTool = tools[0];
      
      await createTestContext('should list all statuses', async () => {
        const result = await testTool(listTool, {}, (res) => {
          assertHasProperty(res, 'statuses');
          assertHasProperty(res, 'count');
          assertIsArray(res.statuses, 'statuses');
          assert(res.count >= 1, 'Should have at least one status');
        });
      });
      
      await createTestContext('should filter statuses by workspace', async () => {
        const result = await testTool(listTool, { workspaceId: testWorkspaceId }, (res) => {
          assertHasProperty(res, 'statuses');
          assertIsArray(res.statuses, 'statuses');
        });
      });
    });
  });
});