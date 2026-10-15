# TextLocal SMS Setup Guide (FREE Alternative to Twilio)

## ✅ Why TextLocal?

- **FREE tier**: 100 SMS per day (perfect for testing)
- **Perfect for Indian numbers**: No verification needed
- **Easy setup**: Just need an API key (no phone number purchase)
- **No credit card required** for free tier

---

## 📝 Quick Setup Steps

### Step 1: Get FREE API Key

1. Go to **https://www.textlocal.in/**
2. Click **"Sign Up"** (top right corner)
3. Fill in your details:
   - Name, Email, Mobile Number
   - Company Name (can be "Test Business" or "CivicFix")
4. **Verify your email** (check inbox)
5. **Login** to your account
6. Go to: **API → API Details**
7. **Copy your API Key**

### Step 2: Add to .env File

**Option A: Manual**
1. Open `backend/.env` file
2. Add these lines:
   ```env
   SMS_PROVIDER=textlocal
   TEXTLOCAL_API_KEY=your_api_key_here
   TEXTLOCAL_SENDER=TXTLCL
   ```

**Option B: Using Script**
```bash
cd backend
node scripts/addTextLocalEnv.js YOUR_API_KEY_HERE
```

### Step 3: Restart Server

```bash
npm run dev:municipal
```

---

## 🎯 That's It!

SMS will now work automatically when officers verify complaints!

---

## 📊 TextLocal Free Tier Limits

- **100 SMS per day**
- **Works with Indian numbers** (+91)
- **No credit card required**
- **Perfect for testing and small projects**

---

## 🔄 Switching Back to Twilio

If you want to use Twilio instead, change in `.env`:
```env
SMS_PROVIDER=twilio
```

---

## ❓ Troubleshooting

**SMS not sending?**
1. Check API key is correct in `.env`
2. Check phone number format (should be 10 digits for India)
3. Check TextLocal dashboard for balance/errors
4. Restart server after changing `.env`

**Need help?**
- TextLocal Support: https://www.textlocal.in/support
- Check server logs for error messages

