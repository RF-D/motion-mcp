import { test } from 'node:test';
import assert from 'node:assert';
import { testClient, setupTestWorkspace, generateTestId } from '../setup.js';
import { registerProjectTools } from '../../src/tools/project.js';
import { testTool, assertHasProperty, assertIsArray, assertIsString, createTestContext, waitForApiLimit } from '../utils.js';

test('Project Tools', async (t) => {
  const tools = registerProjectTools(testClient);
  let testWorkspaceId: string;
  let testProjectId: string;
  const testPrefix = generateTestId();
  const createdProjectIds: string[] = [];
  
  await t.beforeEach(async () => {
    if (!testWorkspaceId) {
      testWorkspaceId = await setupTestWorkspace();
    }
  });
  
  await t.test('should register 5 project tools', () => {
    assert.strictEqual(tools.length, 5);
    const expectedTools = [
      'motion_list_projects',
      'motion_get_project',
      'motion_create_project',
      'motion_update_project',
      'motion_delete_project'
    ];
    expectedTools.forEach((name, index) => {
      assert.strictEqual(tools[index].name, name);
    });
  });
  
  await t.test('motion_list_projects', async (t) => {
    const listTool = tools[0];
    
    await createTestContext('should list all projects in workspace', async () => {
      const result = await testTool(listTool, { workspaceId: testWorkspaceId }, (res) => {
        assertHasProperty(res, 'projects');
        assertHasProperty(res, 'count');
        assertIsArray(res.projects, 'projects');
      });
    });
    
    await createTestContext('should validate required workspaceId', async () => {
      await assert.rejects(
        async () => await listTool.handler({}),
        {
          name: 'ZodError'
        }
      );
    });
  });
  
  await t.test('motion_create_project', async (t) => {
    const createTool = tools[2];
    
    await createTestContext('should create a project', async () => {
      const projectName = `${testPrefix}-test-project`;
      
      const result = await testTool(createTool, {
        name: projectName,
        workspaceId: testWorkspaceId,
        description: 'Test project created by automated tests'
      }, (res) => {
        assertHasProperty(res, 'id');
        assertHasProperty(res, 'name');
        assertHasProperty(res, 'workspaceId');
        assert.strictEqual(res.name, projectName);
        assert.strictEqual(res.workspaceId, testWorkspaceId);
        testProjectId = res.id;
        createdProjectIds.push(res.id);
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
      
      await assert.rejects(
        async () => await createTool.handler({ name: 'test' }),
        {
          name: 'ZodError'
        }
      );
    });
  });
  
  await t.test('motion_get_project', async (t) => {
    const getTool = tools[1];
    
    await createTestContext('should get project details', async () => {
      assert(testProjectId, 'Test project should be created first');
      
      const result = await testTool(getTool, { projectId: testProjectId }, (res) => {
        assertHasProperty(res, 'id');
        assertHasProperty(res, 'name');
        assertHasProperty(res, 'workspaceId');
        assert.strictEqual(res.id, testProjectId);
      });
    });
    
    await createTestContext('should validate required projectId', async () => {
      await assert.rejects(
        async () => await getTool.handler({}),
        {
          name: 'ZodError'
        }
      );
    });
  });
  
  await t.test('motion_update_project', async (t) => {
    const updateTool = tools[3];
    
    await createTestContext('should update project properties', async () => {
      assert(testProjectId, 'Test project should be created first');
      
      const newName = `${testPrefix}-updated-project`;
      const newDescription = 'Updated by automated tests';
      
      const result = await testTool(updateTool, {
        projectId: testProjectId,
        name: newName,
        description: newDescription
      }, (res) => {
        assertHasProperty(res, 'id');
        assert.strictEqual(res.name, newName);
        assert.strictEqual(res.description, newDescription);
      });
      
      await waitForApiLimit();
    });
    
    await createTestContext('should validate required projectId', async () => {
      await assert.rejects(
        async () => await updateTool.handler({}),
        {
          name: 'ZodError'
        }
      );
    });
  });
  
  await t.test('motion_delete_project', async (t) => {
    const deleteTool = tools[4];
    
    await createTestContext('should delete project', async () => {
      assert(testProjectId, 'Test project should be created first');
      
      const result = await testTool(deleteTool, { projectId: testProjectId }, (res) => {
        assertHasProperty(res, 'success');
        assertHasProperty(res, 'message');
        assert.strictEqual(res.success, true);
      });
      
      await waitForApiLimit();
    });
    
    await createTestContext('should validate required projectId', async () => {
      await assert.rejects(
        async () => await deleteTool.handler({}),
        {
          name: 'ZodError'
        }
      );
    });
  });
  
  await t.after(async () => {
    // Clean up all created projects at the end
    for (const projectId of createdProjectIds) {
      try {
        await testClient.deleteProject(projectId);
        await waitForApiLimit(2000);
      } catch (error) {
        // Project might already be deleted
      }
    }
  });
});