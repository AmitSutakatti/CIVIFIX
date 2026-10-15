// Note: dotenv is already loaded by server-municipal.js
// We rely on process.env being populated by the main server file

// SMS Provider: Can be 'twilio', 'textlocal', or 'msg91'
const SMS_PROVIDER = process.env.SMS_PROVIDER || 'msg91';

let twilioClient = null;

// Lazy-load Twilio only if credentials are present
const getTwilioClient = async () => {
  // Get credentials directly from process.env and trim whitespace
  let TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID?.trim();
  let TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN?.trim();
  
  // Remove quotes if present
  if (TWILIO_ACCOUNT_SID) {
    TWILIO_ACCOUNT_SID = TWILIO_ACCOUNT_SID.replace(/^["']|["']$/g, '');
  }
  if (TWILIO_AUTH_TOKEN) {
    TWILIO_AUTH_TOKEN = TWILIO_AUTH_TOKEN.replace(/^["']|["']$/g, '');
  }
  
  // Validate Account SID format (should start with AC and be 34 chars)
  if (TWILIO_ACCOUNT_SID && (!TWILIO_ACCOUNT_SID.startsWith('AC') || TWILIO_ACCOUNT_SID.length !== 34)) {
    return null;
  }
  
  // Validate Auth Token format (should be 32 chars)
  if (TWILIO_AUTH_TOKEN && TWILIO_AUTH_TOKEN.length !== 32) {
    return null;
  }
  
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    return null;
  }
  
  if (!twilioClient) {
    try {
      // Dynamic import for ES modules
      const twilioModule = await import('twilio');
      const twilio = twilioModule.default || twilioModule;
      twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    } catch (error) {
      return null;
    }
  }
  return twilioClient;
};

/**
 * Format phone number for Indian SMS providers (10 digits)
 * @param {string} phone - Phone number in any format
 * @returns {string|null} - Formatted phone number (10 digits) or null if invalid
 */
const formatPhoneForIndia = (phone) => {
  if (!phone) return null;
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Remove country code if present (91 for India)
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }
  
  // Remove leading 0 if present
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Should be 10 digits for Indian numbers
  if (cleaned.length === 10) {
    return cleaned;
  }
  
  console.warn(`[SMS] Invalid phone number format: ${phone}`);
  return null;
};

/**
 * Format phone number to E.164 format required by Twilio
 * @param {string} phone - Phone number in any format
 * @returns {string|null} - Formatted phone number in E.164 format or null if invalid
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it already starts with +, return as is (assuming it's already E.164)
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // If it starts with 0, remove it (common in Indian numbers)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // If it's 10 digits, assume it's an Indian number and add +91
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  
  // If it's 12 digits and starts with 91, add +
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }
  
  // If it doesn't match any pattern, try to return with +
  if (cleaned.length >= 10) {
    return `+${cleaned}`;
  }
  
  console.warn(`[SMS] Invalid phone number format: ${phone}`);
  return null;
};

/**
 * Send SMS via MSG91 API (FREE & Easy for India)
 * @param {string} to - Destination phone number (10 digits for India)
 * @param {string} body - Message body
 */
const sendViaMSG91 = async (to, body) => {
  const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY?.trim();
  const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'CIVICF';
  
  if (!MSG91_AUTH_KEY) {
    console.error('[SMS] ❌ MSG91 Auth Key not configured');
    console.error('[SMS] Add MSG91_AUTH_KEY to backend/.env');
    console.error('[SMS] Get free Auth Key from: https://msg91.com/');
    console.error('[SMS] Current SMS_PROVIDER:', SMS_PROVIDER);
    return { success: false, error: 'MSG91 Auth Key not configured' };
  }
  
  console.log(`[SMS] MSG91 Auth Key found: ${MSG91_AUTH_KEY.substring(0, 8)}...`);
  console.log(`[SMS] MSG91 Sender ID: ${MSG91_SENDER_ID}`);
  
  const formattedPhone = formatPhoneForIndia(to);
  if (!formattedPhone) {
    return { success: false, error: 'Invalid phone number format' };
  }
  
  try {
    console.log(`[SMS] 📤 Sending SMS via MSG91...`);
    console.log(`[SMS] To: ${formattedPhone}`);
    console.log(`[SMS] Sender ID: ${MSG91_SENDER_ID}`);
    
    // Use MSG91 simple HTTP API (works with free tier)
    const url = 'https://control.msg91.com/api/sendhttp.php';
    const params = new URLSearchParams({
      authkey: MSG91_AUTH_KEY,
      mobiles: `91${formattedPhone}`, // MSG91 requires 91 prefix
      message: encodeURIComponent(body), // URL encode message
      sender: MSG91_SENDER_ID,
      route: '4', // Route 4 = Transactional SMS
      country: '91', // India country code
    });
    
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
    });
    
    const result = await response.text();
    const resultTrimmed = result.trim();
    
    console.log(`[SMS] MSG91 API Response: ${resultTrimmed}`);
    console.log(`[SMS] Response Status: ${response.status}`);
    
    // MSG91 returns message ID on success (can be numeric or hex-encoded)
    // Success: Returns a message ID (numeric or hex string starting with number)
    // Error: Returns error description (text)
    
    // Try to parse as number first
    let resultNum = parseInt(resultTrimmed);
    
    // If parsing fails, check if it's hex-encoded (MSG91 sometimes returns hex)
    if (isNaN(resultNum) || resultNum <= 0) {
      // Check if it's a hex string that starts with a number
      // Example: "356c6c766773475a6a647678" -> extract leading number "356"
      const hexMatch = resultTrimmed.match(/^(\d+)/);
      if (hexMatch) {
        resultNum = parseInt(hexMatch[1]);
      }
    }
    
    // Check if result looks like success (starts with number)
    // Note: MSG91 returns success even if SMS is queued/pending, not necessarily delivered
    if (!isNaN(resultNum) && resultNum > 0) {
      console.log(`[SMS] ✅ SMS accepted by MSG91 (Message ID: ${resultNum})`);
      console.log(`[SMS] ⚠️  Note: This means MSG91 accepted the request, but delivery may take time or fail`);
      console.log(`[SMS] ⚠️  Check MSG91 dashboard for actual delivery status`);
      return { success: true, provider: 'msg91', messageId: resultNum, note: 'Accepted by MSG91, check dashboard for delivery status' };
    } else {
      // Check for common MSG91 error codes
      let errorMsg = resultTrimmed;
      const lowerResult = resultTrimmed.toLowerCase();
      
      if (lowerResult.includes('invalid key') || lowerResult.includes('authentication failed')) {
        errorMsg = 'Invalid MSG91 Auth Key. Please check your credentials.';
      } else if (lowerResult.includes('insufficient balance') || lowerResult.includes('low balance')) {
        errorMsg = 'Insufficient MSG91 balance. Please recharge your account.';
      } else if (lowerResult.includes('invalid sender') || lowerResult.includes('sender id')) {
        errorMsg = 'Invalid Sender ID. Sender ID must be 6 characters and approved by MSG91.';
      } else if (lowerResult.includes('invalid mobile') || lowerResult.includes('mobile number')) {
        errorMsg = 'Invalid mobile number format.';
      } else if (lowerResult.includes('dnd') || lowerResult.includes('do not disturb')) {
        errorMsg = 'Phone number is on DND (Do Not Disturb) list.';
      }
      
      console.error(`[SMS] ❌ MSG91 API error: ${errorMsg}`);
      console.error(`[SMS] Full response: ${resultTrimmed}`);
      return { success: false, error: errorMsg, provider: 'msg91', rawResponse: resultTrimmed };
    }
  } catch (error) {
    console.error('[SMS] ❌ Failed to send SMS via MSG91:', error.message);
    return { success: false, error: error.message, provider: 'msg91' };
  }
};

/**
 * Send an SMS message using configured provider (TextLocal or Twilio)
 * Falls back to console.log when credentials are missing.
 * @param {string} to - Destination phone number
 * @param {string} body - Message body
 */
export const sendSMS = async (to, body) => {
  console.log(`[SMS] Attempting to send SMS to: ${to} (Provider: ${SMS_PROVIDER})`);
  
  if (!to) {
    console.warn('[SMS] ❌ SMS not sent: missing destination phone number');
    return { success: false, error: 'Missing phone number' };
  }

  // Use MSG91 for Indian numbers (easier setup, free tier available)
  if (SMS_PROVIDER === 'msg91') {
    return await sendViaMSG91(to, body);
  }
  
  // Legacy TextLocal support (deprecated - shutting down Oct 2025)
  if (SMS_PROVIDER === 'textlocal') {
    console.warn('[SMS] ⚠️  TextLocal is shutting down. Please switch to MSG91.');
    // Keep old TextLocal code for backward compatibility
    const TEXTLOCAL_API_KEY = process.env.TEXTLOCAL_API_KEY?.trim();
    if (TEXTLOCAL_API_KEY) {
      // Old TextLocal implementation would go here
      return { success: false, error: 'TextLocal is no longer available. Please use MSG91.' };
    }
  }

  // Fallback to Twilio if TextLocal not configured
  const formattedPhone = formatPhoneNumber(to);
  if (!formattedPhone) {
    console.error(`[SMS] ❌ Invalid phone number format: ${to}`);
    return { success: false, error: 'Invalid phone number format' };
  }

  console.log(`[SMS] Formatted phone number: ${formattedPhone}`);

  const { TWILIO_FROM_NUMBER } = process.env;
  const client = await getTwilioClient();

  if (!client) {
    console.log(
      '[SMS] ⚠️  [FALLBACK MODE] SMS would be sent to:',
      formattedPhone,
      '\nMessage:',
      body.substring(0, 50) + '...',
      '\n(Configure SMS provider in .env: SMS_PROVIDER=msg91 and MSG91_AUTH_KEY=your_key)'
    );
    return { success: false, error: 'SMS provider not configured', fallback: true };
  }

  if (!TWILIO_FROM_NUMBER) {
    return { success: false, error: 'TWILIO_FROM_NUMBER not configured' };
  }

  try {
    const message = await client.messages.create({
      body,
      from: TWILIO_FROM_NUMBER,
      to: formattedPhone,
    });

    return { success: true, messageSid: message.sid, status: message.status };
  } catch (error) {
    return { success: false, error: error.message, code: error.code };
  }
};

export default sendSMS;

