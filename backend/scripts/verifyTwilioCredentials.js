import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');

dotenv.config({ path: envPath });

const mask = (value, visible = 4) => {
  if (!value) return 'NOT FOUND';
  if (value.length <= visible * 2) return '********';
  return `${value.slice(0, visible)}...${value.slice(-visible)}`;
};

const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
const fromNumber = process.env.TWILIO_FROM_NUMBER?.trim();

console.log('\nVerifying Twilio credentials from backend/.env\n');
console.log('Account SID:', mask(accountSid));
console.log('Auth Token: ', mask(authToken));
console.log('From Number:', fromNumber || 'NOT FOUND');
console.log('');

let ok = true;
if (!accountSid || !accountSid.startsWith('AC') || accountSid.length !== 34) {
  console.log('Account SID looks invalid (expect AC + 32 hex chars).');
  ok = false;
}
if (!authToken || authToken.length < 16) {
  console.log('Auth Token looks missing or too short.');
  ok = false;
}
if (!fromNumber) {
  console.log('From Number is missing.');
  ok = false;
}

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const twilioLines = envContent.split('\n').filter((line) =>
    line.includes('TWILIO_ACCOUNT_SID') ||
    line.includes('TWILIO_AUTH_TOKEN') ||
    line.includes('TWILIO_FROM_NUMBER')
  );
  console.log('Twilio lines in .env (values hidden):');
  twilioLines.forEach((line, index) => {
    const [key] = line.split('=');
    console.log(`  ${index + 1}. ${key}=********`);
    if (line.includes('"') || line.includes("'")) {
      console.log('     Warning: contains quotes — remove them');
    }
    if (line.includes(' = ') || line.includes('= ')) {
      console.log('     Warning: spaces around = — remove them');
    }
    if (line.trim().startsWith('#')) {
      console.log('     Warning: line is commented out');
    }
  });
}

if (ok) {
  console.log('\nTwilio env vars are present and look well-formed.');
} else {
  console.log('\nFix backend/.env, then restart the server.');
  process.exit(1);
}
