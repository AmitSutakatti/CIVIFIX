# 🔧 Fix EmailJS DNS Error

## ❌ Problem

Error: `getaddrinfo ENOTFOUND api.emailjs.com`

**Root Cause:** Your `.env` file has **placeholder values** instead of real EmailJS credentials!

Current values in `.env`:
- `EMAILJS_SERVICE_ID=YOUR_SERVICE_ID` ❌ (Placeholder)
- `EMAILJS_PUBLIC_KEY=YOUR_PUBLIC_KEY` ❌ (Placeholder)
- `EMAILJS_PRIVATE_KEY=YOUR_PRIVATE_KEY` ❌ (Placeholder)
- `EMAILJS_TEMPLATE_ID=template_4fjtvwa` ✅ (Real value)

---

## ✅ Solution: Get Real Credentials

### Step 1: Get Service ID

1. Go to: **https://www.emailjs.com/**
2. Login to your account
3. Click **"Email Services"** (left sidebar)
4. Find your service (Gmail/Outlook/etc.)
5. **Copy the Service ID** (looks like: `service_xxxxxxx`)

### Step 2: Get Public & Private Keys

1. In EmailJS Dashboard
2. Click **"Account"** (top right)
3. Click **"General"** or **"API Keys"**
4. Find **"API Keys"** section
5. **Copy both:**
   - **Public Key** (long string of letters/numbers)
   - **Private Key** (long string of letters/numbers)

### Step 3: Update .env File

**Option A: Using Script (Recommended)**
```bash
node scripts/addEmailJSEnv.js YOUR_REAL_SERVICE_ID template_4fjtvwa YOUR_REAL_PUBLIC_KEY YOUR_REAL_PRIVATE_KEY
```

**Option B: Manual Edit**
1. Open `backend/.env` file
2. Find these lines:
   ```env
   EMAILJS_SERVICE_ID=YOUR_SERVICE_ID
   EMAILJS_PUBLIC_KEY=YOUR_PUBLIC_KEY
   EMAILJS_PRIVATE_KEY=YOUR_PRIVATE_KEY
   ```
3. Replace with real values:
   ```env
   EMAILJS_SERVICE_ID=service_abc123xyz
   EMAILJS_PUBLIC_KEY=your_actual_public_key_here
   EMAILJS_PRIVATE_KEY=your_actual_private_key_here
   ```

### Step 4: Restart Server

```bash
npm run dev:municipal
```

---

## 🎯 Quick Checklist

- [ ] Login to EmailJS dashboard
- [ ] Get Service ID from "Email Services"
- [ ] Get Public Key from "Account → General → API Keys"
- [ ] Get Private Key from "Account → General → API Keys"
- [ ] Replace placeholder values in `.env` file
- [ ] Restart server
- [ ] Test email sending

---

## 📝 Example

**Before (Placeholders):**
```env
EMAILJS_SERVICE_ID=YOUR_SERVICE_ID
EMAILJS_PUBLIC_KEY=YOUR_PUBLIC_KEY
EMAILJS_PRIVATE_KEY=YOUR_PRIVATE_KEY
```

**After (Real Values):**
```env
EMAILJS_SERVICE_ID=service_abc123xyz
EMAILJS_PUBLIC_KEY=xYz789AbC123
EMAILJS_PRIVATE_KEY=pR1vAt3K3y456
```

---

**Once you replace the placeholder values with real credentials, the DNS error will be fixed!**

