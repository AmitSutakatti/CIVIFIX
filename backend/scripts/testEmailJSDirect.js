import dotenv from 'dotenv';
import emailjs from '@emailjs/nodejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

console.log('\n🧪 Testing EmailJS Direct Connection\n');
console.log('Service ID:', SERVICE_ID);
console.log('Template ID:', TEMPLATE_ID);
console.log('Public Key:', PUBLIC_KEY ? PUBLIC_KEY.substring(0, 10) + '...' : 'NOT SET');
console.log('Private Key:', PRIVATE_KEY ? PRIVATE_KEY.substring(0, 10) + '...' : 'NOT SET');
console.log('\n');

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
    message: '<p>This is a test email to verify EmailJS connection.</p>',
  };

  console.log('📤 Calling emailjs.send()...\n');

  const response = await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    params,
    {
      publicKey: PUBLIC_KEY,
      privateKey: PRIVATE_KEY,
    }
  );

  console.log('✅ SUCCESS! Email sent!');
  console.log('Response:', response);
} catch (error) {
  console.error('❌ ERROR:', error.message);
  console.error('Error code:', error.code);
  console.error('Error details:', error);
  
  if (error.message.includes('ENOTFOUND')) {
    console.error('\n💡 DNS Error - Possible solutions:');
    console.error('   1. Check internet connection');
    console.error('   2. Check firewall settings');
    console.error('   3. Try using a different DNS server (8.8.8.8)');
    console.error('   4. Check if proxy is blocking the connection');
  }
}

