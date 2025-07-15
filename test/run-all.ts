import { spawn } from 'child_process';
import { join } from 'path';

const testFiles = [
  'test/tools/workspace.test.ts',
  'test/tools/user.test.ts',
  'test/tools/task.test.ts',
  'test/tools/project.test.ts',
  'test/tools/schedule-status.test.ts',
];

async function runTest(file: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running: ${file}`);
    console.log(`${'='.repeat(60)}\n`);
    
    const proc = spawn('npx', ['tsx', '--test', file], {
      stdio: 'inherit',
      shell: true,
    });
    
    proc.on('close', (code) => {
      if (code !== 0) {
        console.error(`\n❌ Test failed: ${file}`);
      } else {
        console.log(`\n✅ Test passed: ${file}`);
      }
      resolve();
    });
    
    proc.on('error', (err) => {
      console.error(`Failed to run test: ${file}`, err);
      resolve();
    });
  });
}

async function runAllTests() {
  console.log('🧪 Running all Motion MCP tests...\n');
  console.log('⚠️  Note: Tests use real API calls with rate limiting');
  console.log('⏱️  Tests will pause between API calls to respect limits\n');
  
  for (const file of testFiles) {
    await runTest(file);
    // Wait between test files to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('✨ All tests completed!');
  console.log(`${'='.repeat(60)}`);
}

runAllTests().catch(console.error);