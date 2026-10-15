import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env');
const apiKey = process.argv[2];

if (!apiKey) {
  console.log('\n❌ Error: API key not provided!\n');
  console.log('Usage: node scripts/addTextLocalEnv.js YOUR_API_KEY\n');
  console.log('Get your API key from: https://www.textlocal.in/\n');
  process.exit(1);
}

// Read .env file
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Remove existing TextLocal config if present
const lines = envContent.split('\n');
const filteredLines = lines.filter(line => 
  !line.trim().startsWith('SMS_PROVIDER=') &&
  !line.trim().startsWith('TEXTLOCAL_API_KEY=') &&
  !line.trim().startsWith('TEXTLOCAL_SENDER=')
);

// Add TextLocal configuration
let newContent = filteredLines.join('\n');
if (!newContent.endsWith('\n') && newContent.length > 0) {
  newContent += '\n';
}

newContent += '\n# TextLocal SMS Configuration (FREE & Easy for India)\n';
newContent += 'SMS_PROVIDER=textlocal\n';
newContent += `TEXTLOCAL_API_KEY=${apiKey}\n`;
newContent += 'TEXTLOCAL_SENDER=TXTLCL\n';

// Write back to file
fs.writeFileSync(envPath, newContent, 'utf8');

console.log('\n✅ TextLocal SMS configuration added to .env file!');
console.log(`   API Key: ${apiKey.substring(0, 8)}...`);
console.log('\n⚠️  IMPORTANT: Restart your server for changes to take effect!');
console.log('   Run: npm run dev:municipal\n');

