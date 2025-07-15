import { test } from 'node:test';
import assert from 'node:assert';
import { testClient, setupTestWorkspace, generateTestId } from '../setup.js';
import { registerTaskTools } from '../../src/tools/task.js';
import { testTool, assertHasProperty, assertIsArray, assertIsString, createTestContext, waitForApiLimit } from '../utils.js';

test('Task Tools', async (t) => {
  const tools = registerTaskTools(testClient);
  let testWorkspaceId: string;
  let testTaskId: string;
  const testPrefix = generateTestId();
  
  await t.beforeEach(async () => {
    if (!testWorkspaceId) {
      testWorkspaceId = await setupTestWorkspace();
    }
  });
  
  await t.test('should register 9 task tools', () => {
    assert.strictEqual(tools.length, 9);
    const expectedTools = [
      'motion_list_tasks',
      'motion_get_task', 
      'motion_create_task',
      'motion_update_task',
      'motion_delete_task',
      'motion_move_task',
      'motion_unassign_task',
      'motion_complete_task',
      'motion_uncomplete_task'
    ];
    expectedTools.forEach((name, index) => {
      assert.strictEqual(tools[index].name, name);
    });
  });
  
  await t.test('motion_list_tasks', async (t) => {
    const listTool = tools[0];
    
    await createTestContext('should list all tasks', async () => {
      const result = await testTool(listTool, {}, (res) => {
        assertHasProperty(res, 'tasks');
        assertHasProperty(res, 'count');
        assertIsArray(res.tasks, 'tasks');
      });
    });
    
    await createTestContext('should filter tasks by workspace', async () => {
      const result = await testTool(listTool, { workspaceId: testWorkspaceId }, (res) => {
        assertHasProperty(res, 'tasks');
        assertIsArray(res.tasks, 'tasks');
      });
    });
  });
  
  await t.test('motion_create_task', async (t) => {
    const createTool = tools[2];
    
    await createTestContext('should create a simple task', async () => {
      const taskName = `${testPrefix}-simple-task`;
      
      const result = await testTool(createTool, {
        name: taskName,
        workspaceId: testWorkspaceId,
        duration: 30,
        description: 'Test task created by automated tests'
      }, (res) => {
        assertHasProperty(res, 'id');
        assertHasProperty(res, 'name');
        assertHasProperty(res, 'workspaceId');
        assert.strictEqual(res.name, taskName);
        assert.strictEqual(res.workspaceId, testWorkspaceId);
        testTaskId = res.id;
      });
      
      await waitForApiLimit();
    });
    
    await createTestContext('should validate required fields', async () => {
      await assert.rejects(
        async () => await createTool.handler({}),
        {
          name: 'ZodError'
        }
      );
    });
  });
  
  await t.test('motion_get_task', async (t) => {
    const getTool = tools[1];
    
    await createTestContext('should get task details', async () => {
      assert(testTaskId, 'Test task should be created first');
      
      const result = await testTool(getTool, { taskId: testTaskId }, (res) => {
        assertHasProperty(res, 'id');
        assertHasProperty(res, 'name');
        assertHasProperty(res, 'workspaceId');
        assertHasProperty(res, 'status');
        assert.strictEqual(res.id, testTaskId);
      });
    });
  });
  
  await t.test('motion_update_task', async (t) => {
    const updateTool = tools[3];
    
    await createTestContext('should update task properties', async () => {
      assert(testTaskId, 'Test task should be created first');
      
      const newName = `${testPrefix}-updated-task`;
      const result = await testTool(updateTool, {
        taskId: testTaskId,
        name: newName,
        priority: 'HIGH',
        description: 'Updated by automated tests'
      }, (res) => {
        assertHasProperty(res, 'id');
        assert.strictEqual(res.name, newName);
        assert.strictEqual(res.priority, 'HIGH');
      });
      
      await waitForApiLimit();
    });
  });
  
  await t.test('motion_complete_task', async (t) => {
    const completeTool = tools[7];
    
    await createTestContext('should mark task as completed', async () => {
      assert(testTaskId, 'Test task should be created first');
      
      const result = await testTool(completeTool, { taskId: testTaskId }, (res) => {
        assertHasProperty(res, 'id');
        assertHasProperty(res, 'completed');
        assert.strictEqual(res.completed, true);
      });
      
      await waitForApiLimit();
    });
  });
  
  await t.test('motion_uncomplete_task', async (t) => {
    const uncompleteTool = tools[8];
    
    await createTestContext('should mark task as not completed', async () => {
      assert(testTaskId, 'Test task should be created first');
      
      const result = await testTool(uncompleteTool, { taskId: testTaskId }, (res) => {
        assertHasProperty(res, 'id');
        assertHasProperty(res, 'completed');
        assert.strictEqual(res.completed, false);
      });
      
      await waitForApiLimit();
    });
  });
  
  await t.test('motion_delete_task', async (t) => {
    const deleteTool = tools[4];
    
    await createTestContext('should delete task', async () => {
      assert(testTaskId, 'Test task should be created first');
      
      const result = await testTool(deleteTool, { taskId: testTaskId }, (res) => {
        assertHasProperty(res, 'success');
        assertHasProperty(res, 'message');
        assert.strictEqual(res.success, true);
      });
      
      await waitForApiLimit();
    });
  });
  
  await t.afterEach(async () => {
    if (testTaskId) {
      try {
        await testClient.deleteTask(testTaskId);
      } catch (error) {
        // Task might already be deleted
      }
    }
  });
});