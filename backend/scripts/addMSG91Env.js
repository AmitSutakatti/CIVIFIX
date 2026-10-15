import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env');
const authKey = process.argv[2];
const senderId = process.argv[3] || 'CIVICF';

if (!authKey) {
  console.log('\n❌ Error: Auth Key not provided!\n');
  console.log('Usage: node scripts/addMSG91Env.js YOUR_AUTH_KEY [SENDER_ID]\n');
  console.log('Get your Auth Key from: https://msg91.com/\n');
  console.log('Example:');
  console.log('  node scripts/addMSG91Env.js 1234567890abcdef CIVICF\n');
  process.exit(1);
}

// Validate sender ID (max 6 characters)
if (senderId.length > 6) {
  console.log('\n⚠️  Warning: Sender ID should be max 6 characters. Using first 6 characters.\n');
  senderId = senderId.substring(0, 6);
}

// Read .env file
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Remove existing MSG91 config if present
const lines = envContent.split('\n');
const filteredLines = lines.filter(line => 
  !line.trim().startsWith('SMS_PROVIDER=') &&
  !line.trim().startsWith('MSG91_AUTH_KEY=') &&
  !line.trim().startsWith('MSG91_SENDER_ID=') &&
  !line.trim().startsWith('MSG91_TEMPLATE_ID=')
);

// Add MSG91 configuration
let newContent = filteredLines.join('\n');
if (!newContent.endsWith('\n') && newContent.length > 0) {
  newContent += '\n';
}

newContent += '\n# MSG91 SMS Configuration (FREE & Easy for India)\n';
newContent += 'SMS_PROVIDER=msg91\n';
newContent += `MSG91_AUTH_KEY=${authKey}\n`;
newContent += `MSG91_SENDER_ID=${senderId}\n`;
newContent += '# MSG91_TEMPLATE_ID= (Optional: for template-based SMS)\n';

// Write back to file
fs.writeFileSync(envPath, newContent, 'utf8');

console.log('\n✅ MSG91 SMS configuration added to .env file!');
console.log(`   Auth Key: ${authKey.substring(0, 8)}...`);
console.log(`   Sender ID: ${senderId}`);
console.log('\n⚠️  IMPORTANT: Restart your server for changes to take effect!');
console.log('   Run: npm run dev:municipal\n');

