import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env');
const serviceId = process.argv[2];
const templateId = process.argv[3];
const publicKey = process.argv[4];
const privateKey = process.argv[5];

if (!serviceId || !templateId || !publicKey || !privateKey) {
  console.log('\n❌ Error: Missing required parameters!\n');
  console.log('Usage: node scripts/addEmailJSEnv.js SERVICE_ID TEMPLATE_ID PUBLIC_KEY PRIVATE_KEY\n');
  console.log('Example:');
  console.log('  node scripts/addEmailJSEnv.js service_abc123 template_xyz789 pub_123 priv_456\n');
  console.log('Get these from: https://www.emailjs.com/\n');
  process.exit(1);
}

// Read .env file
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Remove existing EmailJS config if present
const lines = envContent.split('\n');
const filteredLines = lines.filter(line => 
  !line.trim().startsWith('EMAILJS_SERVICE_ID=') &&
  !line.trim().startsWith('EMAILJS_TEMPLATE_ID=') &&
  !line.trim().startsWith('EMAILJS_PUBLIC_KEY=') &&
  !line.trim().startsWith('EMAILJS_PRIVATE_KEY=')
);

// Add EmailJS configuration
let newContent = filteredLines.join('\n');
if (!newContent.endsWith('\n') && newContent.length > 0) {
  newContent += '\n';
}

newContent += '\n# EmailJS Configuration (Email Notifications)\n';
newContent += `EMAILJS_SERVICE_ID=${serviceId}\n`;
newContent += `EMAILJS_TEMPLATE_ID=${templateId}\n`;
newContent += `EMAILJS_PUBLIC_KEY=${publicKey}\n`;
newContent += `EMAILJS_PRIVATE_KEY=${privateKey}\n`;

// Write back to file
fs.writeFileSync(envPath, newContent, 'utf8');

console.log('\n✅ EmailJS configuration added to .env file!');
console.log(`   Service ID: ${serviceId}`);
console.log(`   Template ID: ${templateId}`);
console.log(`   Public Key: ${publicKey.substring(0, 8)}...`);
console.log(`   Private Key: ${privateKey.substring(0, 8)}...`);
console.log('\n⚠️  IMPORTANT: Restart your server for changes to take effect!');
console.log('   Run: npm run dev:municipal\n');

