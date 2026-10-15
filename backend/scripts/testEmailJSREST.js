import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

console.log('\n🧪 Testing EmailJS REST API Directly\n');

if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY || !PRIVATE_KEY) {
  console.error('❌ Missing credentials!');
  process.exit(1);
}

const testEmail = process.argv[2] || 'amit270006@gmail.com';

console.log(`📧 Sending test email to: ${testEmail}\n`);

try {
  const params = {
    to_email: testEmail,
    subject: 'Test Email from CivicFix',
    message: '<p>This is a test email to verify EmailJS REST API connection.</p>',
  };

  const emailjsUrl = `https://api.emailjs.com/api/v1.0/email/send`;
  
  console.log('📤 Calling EmailJS REST API...\n');

  const response = await fetch(emailjsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id: PUBLIC_KEY,
      template_params: params,
      accessToken: PRIVATE_KEY,
    }),
  });

  const result = await response.json();
  
  console.log(`Response Status: ${response.status}`);
  console.log(`Response Body:`, result);

  if (response.ok) {
    console.log('\n✅ SUCCESS! Email sent via REST API!');
  } else {
    console.error('\n❌ FAILED:', result.message || result.error);
    
    if (result.message && result.message.includes('disabled')) {
      console.error('\n💡 EmailJS has disabled server-side API calls.');
      console.error('   Solution: Enable API access in EmailJS dashboard:');
      console.error('   1. Go to EmailJS Dashboard');
      console.error('   2. Account → Settings → API Access');
      console.error('   3. Enable "Allow server-side API calls"');
    }
  }
} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  console.error('Stack:', error.stack);
}

