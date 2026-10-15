import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY?.trim();
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'CIVICF';

console.log('\n🧪 Testing MSG91 SMS Configuration\n');
console.log(`Auth Key: ${MSG91_AUTH_KEY ? MSG91_AUTH_KEY.substring(0, 8) + '...' : 'NOT SET'}`);
console.log(`Sender ID: ${MSG91_SENDER_ID}`);
console.log(`Provider: ${process.env.SMS_PROVIDER || 'msg91'}\n`);

if (!MSG91_AUTH_KEY) {
  console.error('❌ MSG91_AUTH_KEY not found in .env file!');
  process.exit(1);
}

// Test phone number (use your own for testing)
const testPhone = process.argv[2] || '9353906607'; // Default test number
const testMessage = 'Test SMS from CivicFix - MSG91 Integration';

console.log(`📱 Testing SMS to: ${testPhone}`);
console.log(`📝 Message: ${testMessage}\n`);

// Format phone number (10 digits for India)
let formattedPhone = testPhone.replace(/\D/g, '');
if (formattedPhone.startsWith('91') && formattedPhone.length === 12) {
  formattedPhone = formattedPhone.substring(2);
}
if (formattedPhone.startsWith('0')) {
  formattedPhone = formattedPhone.substring(1);
}

if (formattedPhone.length !== 10) {
  console.error(`❌ Invalid phone number format: ${testPhone} (should be 10 digits)`);
  process.exit(1);
}

console.log(`✅ Formatted phone: ${formattedPhone}\n`);

// Test MSG91 API
const url = 'https://control.msg91.com/api/sendhttp.php';
const params = new URLSearchParams({
  authkey: MSG91_AUTH_KEY,
  mobiles: `91${formattedPhone}`,
  message: encodeURIComponent(testMessage),
  sender: MSG91_SENDER_ID,
  route: '4', // Transactional route
  country: '91', // India
});

console.log('📤 Sending request to MSG91...');
console.log(`URL: ${url}`);
console.log(`Params: authkey=***, mobiles=91${formattedPhone}, sender=${MSG91_SENDER_ID}, route=4\n`);

try {
  const response = await fetch(`${url}?${params.toString()}`, {
    method: 'GET',
  });
  
  const result = await response.text();
  const resultTrimmed = result.trim();
  
  console.log(`📥 Response Status: ${response.status}`);
  console.log(`📥 Response Body: ${resultTrimmed}\n`);
  
  const resultNum = parseInt(resultTrimmed);
  
  if (!isNaN(resultNum) && resultNum > 0) {
    console.log('✅ SUCCESS! SMS sent successfully!');
    console.log(`   Message ID: ${resultNum}\n`);
  } else {
    console.error('❌ FAILED! SMS not sent.');
    console.error(`   Error: ${resultTrimmed}\n`);
    
    // Common error messages
    if (resultTrimmed.includes('Invalid key') || resultTrimmed.includes('invalid key')) {
      console.error('💡 Solution: Check your MSG91 Auth Key in the dashboard');
    } else if (resultTrimmed.includes('Insufficient balance')) {
      console.error('💡 Solution: Recharge your MSG91 account');
    } else if (resultTrimmed.includes('Invalid sender') || resultTrimmed.includes('sender')) {
      console.error('💡 Solution: Sender ID needs to be approved by MSG91');
      console.error('   - Go to MSG91 Dashboard → Sender ID');
      console.error('   - Request approval for: ' + MSG91_SENDER_ID);
      console.error('   - Or use default sender ID: TXTLCL');
    } else if (resultTrimmed.includes('Invalid mobile')) {
      console.error('💡 Solution: Check phone number format');
    } else {
      console.error('💡 Check MSG91 dashboard for more details');
    }
  }
} catch (error) {
  console.error('❌ Network Error:', error.message);
  console.error('   Stack:', error.stack);
}

