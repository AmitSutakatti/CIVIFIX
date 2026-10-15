# 📱 Complete Guide: How to Get MSG91 Auth Key

## Step-by-Step Instructions

### Step 1: Visit MSG91 Website
1. Open your web browser
2. Go to: **https://msg91.com/**
3. You'll see the homepage with "Get Started" or "Sign Up" button

### Step 2: Sign Up for Free Account
1. Click **"Sign Up"** or **"Get Started"** button (usually top right corner)
2. You'll see a registration form
3. Fill in the following details:
   - **Full Name**: Your name (e.g., "John Doe")
   - **Email Address**: Your email (e.g., "yourname@email.com")
   - **Mobile Number**: Your mobile number (e.g., "9876543210")
   - **Company Name**: Can be "CivicFix" or "Test Business" or your actual company name
   - **Password**: Create a strong password
   - **Confirm Password**: Re-enter your password
4. Accept the Terms & Conditions checkbox
5. Click **"Sign Up"** or **"Create Account"** button

### Step 3: Verify Your Email
1. Check your email inbox (and spam folder)
2. Look for an email from MSG91
3. Click the **verification link** in the email
4. Your email will be verified

### Step 4: Verify Your Mobile Number
1. You'll receive an SMS with a verification code
2. Enter the **OTP code** in the verification page
3. Click **"Verify"** or **"Submit"**
4. Your mobile number will be verified

### Step 5: Login to Your Account
1. Go back to: **https://msg91.com/**
2. Click **"Login"** button (top right)
3. Enter your **Email** and **Password**
4. Click **"Login"** or **"Sign In"**

### Step 6: Navigate to API Section
After logging in, you'll see the MSG91 Dashboard. Now:

**Option A: From Dashboard**
1. Look for **"API"** or **"API Settings"** in the left sidebar menu
2. Click on it
3. You'll see **"Auth Key"** or **"API Key"** section

**Option B: Direct Navigation**
1. Look for menu items like:
   - **"Settings"** → **"API"**
   - **"Developers"** → **"API Keys"**
   - **"Integration"** → **"API"**
2. Click on the appropriate menu

### Step 7: Find Your Auth Key
1. In the API section, you'll see:
   - **"Auth Key"** or **"API Key"** or **"Authentication Key"**
   - It will be a long string (usually 20-40 characters)
   - Example format: `1234567890abcdef1234567890abcdef` or similar
2. You might see options like:
   - **"Show"** / **"Hide"** button to reveal the key
   - **"Copy"** button to copy it
   - **"Generate New Key"** (don't click this unless you need a new one)

### Step 8: Copy Your Auth Key
1. Click **"Show"** if the key is hidden
2. Click **"Copy"** button (if available) OR
3. Manually select and copy the entire Auth Key string
4. **Important**: Copy the complete key (it's usually quite long)

---

## 📋 What Your Auth Key Looks Like

Your MSG91 Auth Key will look something like:
- `1234567890abcdef1234567890abcdef` (32 characters)
- `ABCD1234EFGH5678IJKL9012MNOP3456` (32 characters)
- Or similar alphanumeric string

**Note**: The exact format may vary, but it's typically 20-40 alphanumeric characters.

---

## ✅ After Getting Your Auth Key

Once you have your Auth Key, add it to your project:

### Method 1: Using Script (Easiest)
```bash
cd backend
node scripts/addMSG91Env.js YOUR_AUTH_KEY_HERE
```

### Method 2: Manual
1. Open `backend/.env` file
2. Add these lines:
   ```env
   SMS_PROVIDER=msg91
   MSG91_AUTH_KEY=your_auth_key_here
   MSG91_SENDER_ID=CIVICF
   ```
3. Replace `your_auth_key_here` with your actual Auth Key

### Then Restart Server
```bash
npm run dev:municipal
```

---

## 🆘 Troubleshooting

### "I can't find the Auth Key"
- Look for menu items: **Settings**, **API**, **Developers**, **Integration**
- Some accounts show it in **Dashboard** → **API Settings**
- Try: **Profile** → **API Keys**

### "I don't see Sign Up button"
- Try: **https://msg91.com/signup** directly
- Or: **https://msg91.com/register**

### "Email verification not received"
- Check spam/junk folder
- Wait 2-3 minutes
- Click "Resend" if available
- Make sure email is correct

### "Mobile OTP not received"
- Wait 1-2 minutes
- Check if number is correct
- Click "Resend OTP" if available
- Make sure you're using Indian number format

### "Auth Key is not working"
- Make sure you copied the **complete** key (no spaces, no extra characters)
- Check if there are any quotes around it in `.env` file (remove them)
- Verify the key in MSG91 dashboard again
- Make sure `SMS_PROVIDER=msg91` is set in `.env`

---

## 📞 Need More Help?

- **MSG91 Support**: https://msg91.com/support
- **MSG91 Documentation**: https://docs.msg91.com/
- **Live Chat**: Available on MSG91 website (usually bottom right)

---

## 🎯 Quick Checklist

- [ ] Signed up at msg91.com
- [ ] Verified email
- [ ] Verified mobile number
- [ ] Logged into dashboard
- [ ] Found Auth Key in API section
- [ ] Copied Auth Key
- [ ] Added to `.env` file
- [ ] Restarted server

---

**That's it! Your SMS service is now ready to use!** 🚀

