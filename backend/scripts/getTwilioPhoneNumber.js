import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

console.log('\n📞 Twilio Phone Number Setup\n');
console.log('The error shows that +15005550006 is not a valid Twilio number.');
console.log('You need to use YOUR actual Twilio phone number.\n');

console.log('🔍 How to get your Twilio phone number:');
console.log('   1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming');
console.log('   2. Look for "Active numbers" section');
console.log('   3. You should see a phone number (e.g., +1XXXXXXXXXX)');
console.log('   4. Copy that number\n');

console.log('📝 Current TWILIO_FROM_NUMBER in .env:', process.env.TWILIO_FROM_NUMBER || 'NOT SET');
console.log('\n⚠️  If you don\'t have a phone number yet:');
console.log('   1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/search');
console.log('   2. Click "Buy a number"');
console.log('   3. Select a number with SMS capability');
console.log('   4. Purchase it (trial accounts can get free numbers)\n');

console.log('💡 After you get your number, update backend/.env:');
console.log('   TWILIO_FROM_NUMBER=+1XXXXXXXXXX\n');

