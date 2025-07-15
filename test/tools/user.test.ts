import { test } from 'node:test';
import assert from 'node:assert';
import { testClient, setupTestWorkspace } from '../setup.js';
import { registerUserTools } from '../../src/tools/user.js';
import { testTool, assertHasProperty, assertIsArray, assertIsString, createTestContext } from '../utils.js';

test('User Tools', async (t) => {
  const tools = registerUserTools(testClient);
  let currentUserId: string;
  let testWorkspaceId: string;
  
  await t.test('should register 3 user tools', () => {
    assert.strictEqual(tools.length, 3);
    assert.strictEqual(tools[0].name, 'motion_get_current_user');
    assert.strictEqual(tools[1].name, 'motion_get_user');
    assert.strictEqual(tools[2].name, 'motion_list_users');
  });
  
  await t.test('motion_get_current_user', async (t) => {
    const getCurrentUserTool = tools[0];
    
    await createTestContext('should get current user information', async () => {
      const result = await testTool(getCurrentUserTool, {}, (res) => {
        assertHasProperty(res, 'id');
        assertHasProperty(res, 'name');
        assertHasProperty(res, 'email');
        assertIsString(res.id, 'id');
        assertIsString(res.name, 'name');
        assertIsString(res.email, 'email');
        currentUserId = res.id;
      });
    });
  });
  
  await t.test('motion_get_user', async (t) => {
    const getUserTool = tools[1];
    
    await createTestContext('should validate required userId parameter', async () => {
      await assert.rejects(
        async () => await getUserTool.handler({}),
        {
          name: 'ZodError'
        }
      );
    });
    
    await createTestContext('should validate userId is not empty', async () => {
      await assert.rejects(
        async () => await getUserTool.handler({ userId: '' }),
        {
          name: 'ZodError'
        }
      );
    });
  });
  
  await t.test('motion_list_users', async (t) => {
    const listUsersTool = tools[2];
    
    await createTestContext('should list all users in workspace', async () => {
      if (!testWorkspaceId) {
        testWorkspaceId = await setupTestWorkspace();
      }
      
      const result = await testTool(listUsersTool, { workspaceId: testWorkspaceId }, (res) => {
        assertHasProperty(res, 'users');
        assertHasProperty(res, 'count');
        assertIsArray(res.users, 'users');
        assert(res.count >= 1, 'Should have at least one user');
      });
    });
    
    await createTestContext('should validate required workspaceId', async () => {
      await assert.rejects(
        async () => await listUsersTool.handler({}),
        {
          name: 'ZodError'
        }
      );
    });
  });
});