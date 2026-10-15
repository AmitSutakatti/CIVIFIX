import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('⏰ OpenAI Test with Automatic Wait\n');
console.log('This script will wait 65 seconds, then run the OpenAI test.');
console.log('This ensures you\'re past the rate limit window.\n');

console.log('⏳ Waiting 65 seconds...\n');

// Countdown timer
for (let i = 65; i > 0; i--) {
  process.stdout.write(`\r   ${i} seconds remaining...`);
  await new Promise(resolve => setTimeout(resolve, 1000));
}

process.stdout.write('\r   ✅ Ready! Running test...                    \n\n');

// Run the actual test script
const testScript = path.join(__dirname, 'testOpenAI.js');
const child = spawn('node', [testScript], {
  stdio: 'inherit',
  shell: true,
});

child.on('close', (code) => {
  process.exit(code || 0);
});

