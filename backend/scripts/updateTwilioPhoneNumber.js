import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env');

// Get phone number from command line argument
const newPhoneNumber = process.argv[2];

if (!newPhoneNumber) {
  console.log('\n❌ Error: Phone number not provided!\n');
  console.log('Usage: node scripts/updateTwilioPhoneNumber.js +1XXXXXXXXXX\n');
  console.log('Example: node scripts/updateTwilioPhoneNumber.js +14155551234\n');
  process.exit(1);
}

// Validate phone number format (should start with +)
if (!newPhoneNumber.startsWith('+')) {
  console.log('\n❌ Error: Phone number must start with + (E.164 format)');
  console.log(`   You provided: ${newPhoneNumber}`);
  console.log(`   Expected format: +1XXXXXXXXXX\n`);
  process.exit(1);
}

// Read .env file
let envContent = fs.readFileSync(envPath, 'utf8');

// Replace TWILIO_FROM_NUMBER
envContent = envContent.replace(
  /TWILIO_FROM_NUMBER=.*/g,
  `TWILIO_FROM_NUMBER=${newPhoneNumber}`
);

// Write back to file
fs.writeFileSync(envPath, envContent, 'utf8');

console.log('\n✅ Updated TWILIO_FROM_NUMBER in .env file!');
console.log(`   New number: ${newPhoneNumber}`);
console.log('\n⚠️  IMPORTANT: Restart your server for changes to take effect!');
console.log('   Run: npm run dev:municipal\n');

