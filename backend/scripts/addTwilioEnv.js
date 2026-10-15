import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env');

// Read existing .env file
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
} else {
  console.log('⚠️  .env file not found. Creating new one...');
}

// Check if Twilio variables already exist
const hasTwilioAccountSid = envContent.includes('TWILIO_ACCOUNT_SID=');
const hasTwilioAuthToken = envContent.includes('TWILIO_AUTH_TOKEN=');
const hasTwilioFromNumber = envContent.includes('TWILIO_FROM_NUMBER=');

console.log('\n📋 Current Twilio Variables Status:');
console.log(`   TWILIO_ACCOUNT_SID: ${hasTwilioAccountSid ? '✅ EXISTS' : '❌ MISSING'}`);
console.log(`   TWILIO_AUTH_TOKEN: ${hasTwilioAuthToken ? '✅ EXISTS' : '❌ MISSING'}`);
console.log(`   TWILIO_FROM_NUMBER: ${hasTwilioFromNumber ? '✅ EXISTS' : '❌ MISSING'}`);

if (hasTwilioAccountSid && hasTwilioAuthToken && hasTwilioFromNumber) {
  console.log('\n✅ All Twilio variables already exist in .env file!');
  console.log('If they are still not loading, check for:');
  console.log('   - Extra spaces around the = sign');
  console.log('   - Quotes around values (should be no quotes)');
  console.log('   - Comments (#) before the variables');
  console.log('   - Typos in variable names');
} else {
  console.log('\n📝 Adding missing Twilio variables to .env file...');
  
  // Remove existing Twilio variables if they exist (to avoid duplicates)
  const lines = envContent.split('\n');
  const filteredLines = lines.filter(line => 
    !line.trim().startsWith('TWILIO_ACCOUNT_SID=') &&
    !line.trim().startsWith('TWILIO_AUTH_TOKEN=') &&
    !line.trim().startsWith('TWILIO_FROM_NUMBER=')
  );
  
  // Add new Twilio variables
  let newContent = filteredLines.join('\n');
  if (!newContent.endsWith('\n') && newContent.length > 0) {
    newContent += '\n';
  }
  
  newContent += '\n# Twilio SMS Configuration\n';
  if (!hasTwilioAccountSid) {
    newContent += 'TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n';
  }
  if (!hasTwilioAuthToken) {
    newContent += 'TWILIO_AUTH_TOKEN=your_auth_token_here\n';
  }
  if (!hasTwilioFromNumber) {
    newContent += 'TWILIO_FROM_NUMBER=+15005550006\n';
  }
  
  // Write back to file
  fs.writeFileSync(envPath, newContent, 'utf8');
  
  console.log('✅ Added Twilio variables to .env file!');
  console.log('\n⚠️  IMPORTANT: Please update these values with your actual Twilio credentials:');
  console.log('   1. TWILIO_ACCOUNT_SID - Get from Twilio Console Dashboard');
  console.log('   2. TWILIO_AUTH_TOKEN - Get from Twilio Console Dashboard');
  console.log('   3. TWILIO_FROM_NUMBER - Your Twilio phone number (e.g., +15005550006)');
  console.log('\n📝 Edit backend/.env file and replace the placeholder values.');
}

console.log('\n');

