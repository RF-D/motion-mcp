import { test } from 'node:test';
import assert from 'node:assert';
import { Tool } from '../src/types/tool.js';

export async function testTool(
  tool: Tool,
  args: any,
  validate?: (result: any) => void
): Promise<any> {
  try {
    const result = await tool.handler(args);
    
    if (validate) {
      validate(result);
    } else {
      assert(result !== undefined, 'Tool should return a result');
    }
    
    return result;
  } catch (error) {
    console.error(`Tool ${tool.name} failed:`, error);
    throw error;
  }
}

export function assertHasProperty(obj: any, property: string): void {
  assert(property in obj, `Object should have property "${property}"`);
}

export function assertIsArray(value: any, propertyName: string): void {
  assert(Array.isArray(value), `${propertyName} should be an array`);
}

export function assertIsString(value: any, propertyName: string): void {
  assert(typeof value === 'string', `${propertyName} should be a string`);
}

export function assertIsNumber(value: any, propertyName: string): void {
  assert(typeof value === 'number', `${propertyName} should be a number`);
}

export function assertIsBoolean(value: any, propertyName: string): void {
  assert(typeof value === 'boolean', `${propertyName} should be a boolean`);
}

export function assertIsObject(value: any, propertyName: string): void {
  assert(typeof value === 'object' && value !== null, `${propertyName} should be an object`);
}

export async function waitForApiLimit(ms: number = 5000): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}

export function createTestContext(description: string, fn: () => void | Promise<void>) {
  return test(description, async () => {
    console.log(`\n🧪 Running: ${description}`);
    try {
      await fn();
      console.log(`✅ Passed: ${description}`);
    } catch (error) {
      console.log(`❌ Failed: ${description}`);
      throw error;
    }
  });
}