import dotenv from 'dotenv';
import dns from 'dns';
import { promisify } from 'util';

dotenv.config({ path: '.env' });

const lookup = promisify(dns.lookup);

console.log('\n🔍 Testing EmailJS Connection\n');

// Test DNS resolution
try {
  console.log('1. Testing DNS resolution for api.emailjs.com...');
  const addresses = await lookup('api.emailjs.com');
  console.log('   ✅ DNS resolved:', addresses.address);
} catch (error) {
  console.error('   ❌ DNS resolution failed:', error.message);
  console.error('   💡 This might be a network/firewall issue');
}

// Test credentials
console.log('\n2. Checking EmailJS credentials...');
const serviceId = process.env.EMAILJS_SERVICE_ID;
const templateId = process.env.EMAILJS_TEMPLATE_ID;
const publicKey = process.env.EMAILJS_PUBLIC_KEY;
const privateKey = process.env.EMAILJS_PRIVATE_KEY;

console.log('   SERVICE_ID:', serviceId ? `${serviceId.substring(0, 15)}...` : '❌ NOT SET');
console.log('   TEMPLATE_ID:', templateId || '❌ NOT SET');
console.log('   PUBLIC_KEY:', publicKey ? `${publicKey.substring(0, 10)}...` : '❌ NOT SET');
console.log('   PRIVATE_KEY:', privateKey ? `${privateKey.substring(0, 10)}...` : '❌ NOT SET');

if (serviceId && templateId && publicKey && privateKey) {
  console.log('\n   ✅ All credentials are set!');
} else {
  console.log('\n   ❌ Missing credentials!');
}

console.log('\n');

