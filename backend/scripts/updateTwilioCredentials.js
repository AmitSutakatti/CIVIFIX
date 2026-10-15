import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');

console.log('Twilio credentials must live in backend/.env only.');
console.log('Do not hardcode Account SID or Auth Token in source files.\n');

if (!fs.existsSync(envPath)) {
  console.error(`Missing ${envPath}`);
  console.error('Create backend/.env and add:');
  console.error('  TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  console.error('  TWILIO_AUTH_TOKEN=your_auth_token_here');
  console.error('  TWILIO_FROM_NUMBER=+15005550006');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const hasSid = /^TWILIO_ACCOUNT_SID=.+/m.test(envContent);
const hasToken = /^TWILIO_AUTH_TOKEN=.+/m.test(envContent);
const hasFrom = /^TWILIO_FROM_NUMBER=.+/m.test(envContent);

console.log(`TWILIO_ACCOUNT_SID: ${hasSid ? 'set' : 'missing'}`);
console.log(`TWILIO_AUTH_TOKEN: ${hasToken ? 'set' : 'missing'}`);
console.log(`TWILIO_FROM_NUMBER: ${hasFrom ? 'set' : 'missing'}`);

if (!hasSid || !hasToken || !hasFrom) {
  console.error('\nAdd the missing keys in backend/.env, then restart the server.');
  process.exit(1);
}

console.log('\n.env already has Twilio keys. Restart the server if you just changed them.');
