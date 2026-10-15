# MSG91 SMS Setup Guide (FREE Alternative)

## ✅ Why MSG91?

- **FREE tier**: 100 SMS per day (perfect for testing)
- **Perfect for Indian numbers**: No verification needed
- **Easy setup**: Just need an Auth Key (no phone number purchase)
- **No credit card required** for free tier
- **Reliable**: Widely used in India

---

## 📝 Quick Setup Steps

### Step 1: Get FREE Auth Key

1. Go to **https://msg91.com/**
2. Click **"Sign Up"** or **"Get Started"**
3. Fill in your details:
   - Name, Email, Mobile Number
   - Company Name (can be "CivicFix" or "Test Business")
4. **Verify your email and mobile number** (check inbox/SMS)
5. **Login** to your account
6. Go to: **Dashboard → API → Auth Key**
7. **Copy your Auth Key**

### Step 2: Add to .env File

**Option A: Using Script (Recommended)**
```bash
cd backend
node scripts/addMSG91Env.js YOUR_AUTH_KEY_HERE
```

**Option B: Manual**
1. Open `backend/.env` file
2. Add these lines:
   ```env
   SMS_PROVIDER=msg91
   MSG91_AUTH_KEY=your_auth_key_here
   MSG91_SENDER_ID=CIVICF
   ```

**Note:** Sender ID must be max 6 characters (alphanumeric). Default is "CIVICF".

### Step 3: Restart Server

```bash
npm run dev:municipal
```

---

## 🎯 That's It!

SMS will now work automatically when officers verify complaints!

---

## 📊 MSG91 Free Tier Limits

- **100 SMS per day**
- **Works with Indian numbers** (+91)
- **No credit card required**
- **Perfect for testing and small projects**

---

## 🔄 Switching Providers

If you want to use Twilio instead, change in `.env`:
```env
SMS_PROVIDER=twilio
```

---

## ❓ Troubleshooting

**SMS not sending?**
1. Check Auth Key is correct in `.env`
2. Check phone number format (should be 10 digits for India)
3. Check MSG91 dashboard for balance/errors
4. Restart server after changing `.env`
5. Check Sender ID is max 6 characters

**Common Errors:**
- **"Invalid Auth Key"**: Check your Auth Key in MSG91 dashboard
- **"Invalid Sender ID"**: Sender ID must be max 6 characters, alphanumeric
- **"Insufficient Balance"**: Free tier allows 100 SMS/day

**Need help?**
- MSG91 Support: https://msg91.com/support
- Check server logs for detailed error messages

---

## 📚 MSG91 API Documentation

- Official Docs: https://docs.msg91.com/
- Free Tier Info: https://msg91.com/pricing

