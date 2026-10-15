import fetch from 'node-fetch';

console.log('\n🌐 Getting Your Current IP Addresses\n');

try {
  // Get IPv4
  const ipv4Response = await fetch('https://api.ipify.org?format=json');
  const ipv4Data = await ipv4Response.json();
  console.log(`✅ IPv4 Address: ${ipv4Data.ip}`);
  
  // Get IPv6 (if available)
  try {
    const ipv6Response = await fetch('https://api64.ipify.org?format=json');
    const ipv6Data = await ipv6Response.json();
    if (ipv6Data.ip && ipv6Data.ip.includes(':')) {
      console.log(`✅ IPv6 Address: ${ipv6Data.ip}`);
    }
  } catch (e) {
    console.log('ℹ️  IPv6 not available');
  }
  
  console.log('\n📋 To whitelist this IP in MSG91:');
  console.log('1. Go to: https://msg91.com/ → Settings → IP Whitelisting');
  console.log(`2. Add IP: ${ipv4Data.ip}`);
  console.log('3. Save and wait 1-2 minutes\n');
  
} catch (error) {
  console.error('❌ Error getting IP:', error.message);
}

