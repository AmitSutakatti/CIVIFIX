import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendComplaintVerificationEmail } from '../services/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const testEmail = process.argv[2];

console.log('\n🧪 Testing EmailJS Configuration\n');

if (!testEmail) {
  console.error('❌ Error: Email address not provided!\n');
  console.log('Usage: node scripts/testEmailJS.js your-email@example.com\n');
  process.exit(1);
}

console.log(`📧 Test Email: ${testEmail}`);
console.log(`📋 Service ID: ${process.env.EMAILJS_SERVICE_ID ? '✅ SET' : '❌ NOT SET'}`);
console.log(`📋 Template ID: ${process.env.EMAILJS_TEMPLATE_ID ? '✅ SET' : '❌ NOT SET'}`);
console.log(`📋 Public Key: ${process.env.EMAILJS_PUBLIC_KEY ? '✅ SET' : '❌ NOT SET'}`);
console.log(`📋 Private Key: ${process.env.EMAILJS_PRIVATE_KEY ? '✅ SET' : '❌ NOT SET'}\n`);

if (!process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_TEMPLATE_ID || 
    !process.env.EMAILJS_PUBLIC_KEY || !process.env.EMAILJS_PRIVATE_KEY) {
  console.error('❌ EmailJS not fully configured!');
  console.error('Run: node scripts/addEmailJSEnv.js SERVICE_ID TEMPLATE_ID PUBLIC_KEY PRIVATE_KEY\n');
  process.exit(1);
}

console.log('📤 Sending test email...\n');

const testData = {
  userName: 'Test User',
  category: 'Drainage',
  complaintId: 'TEST123',
  municipalOfficeName: 'Belagavi City Corporation (BCC)',
  municipalOfficePhone: '0831-2405316',
};

try {
  const result = await sendComplaintVerificationEmail(testEmail, testData);
  
  if (result.success) {
    console.log('✅ SUCCESS! Email sent successfully!');
    console.log(`   Message ID: ${result.messageId}\n`);
    console.log('📬 Check your inbox (and spam folder) for the test email.\n');
  } else {
    console.error('❌ FAILED! Email not sent.');
    console.error(`   Error: ${result.error}\n`);
    
    if (result.rawError) {
      console.error(`   Raw Error: ${result.rawError}\n`);
    }
    
    console.log('💡 Troubleshooting:');
    console.log('   1. Check all credentials in .env file');
    console.log('   2. Verify Service ID and Template ID in EmailJS dashboard');
    console.log('   3. Make sure email service is connected');
    console.log('   4. Check EmailJS dashboard for error logs\n');
  }
} catch (error) {
  console.error('❌ Exception:', error.message);
  console.error('   Stack:', error.stack);
}

