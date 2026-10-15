# 🔧 Fix: MSG91 "IP is not whitelisted" Error

## ❌ Problem
Error 418: "IP is not whitelisted" in MSG91 dashboard

## ✅ Solution: Whitelist Your IP in MSG91

### Step 1: Get Your Server's IP Address
Your server's IP address needs to be whitelisted in MSG91.

**From the error log:**
- IPv6: `2401:4900:1c06:16e3:5d68:55c2:f7ad:b717`
- You also need IPv4: Check using the command or website

### Step 2: Whitelist IP in MSG91 Dashboard

1. **Go to MSG91 Dashboard**
   - Login at: https://msg91.com/
   
2. **Navigate to IP Whitelisting**
   - Go to: **Settings** → **IP Whitelisting**
   - Or: **API Settings** → **IP Whitelisting**
   - Or: **Security** → **IP Whitelisting**

3. **Add Your IP Address**
   - Click **"Add IP"** or **"Whitelist IP"**
   - Enter your server's IP address:
     - **IPv4**: `122.177.130.139` (your public IP)
     - **IPv6**: `2401:4900:1c06:16e3:5d68:55c2:f7ad:b717` (if needed)
   - Click **"Save"** or **"Add"**

4. **Alternative: Disable IP Whitelisting (Not Recommended)**
   - If you can't find IP whitelisting, look for:
     - **"IP Security"** → Turn OFF
     - **"Require IP Whitelisting"** → Disable
   - ⚠️ **Warning**: This reduces security

### Step 3: Wait for Activation
- IP whitelisting usually takes effect immediately
- Sometimes it takes 1-2 minutes

### Step 4: Test Again
- Restart your server
- Verify a complaint
- Check MSG91 dashboard for success

---

## 🔍 How to Find Your Server IP

### Option 1: From Error Log
- Check the "User IP" field in MSG91 failed logs
- IPv6: `2401:4900:1c06:16e3:5d68:55c2:f7ad:b717`
- IPv4: Check using command below

### Option 2: Using Command
```bash
# Get IPv4
curl https://api.ipify.org

# Or in PowerShell
powershell -Command "(Invoke-WebRequest -Uri 'https://api.ipify.org' -UseBasicParsing).Content"
```

### Option 3: From Website
- Visit: https://whatismyipaddress.com/
- Copy your public IP address

---

## 📋 Quick Checklist

- [ ] Login to MSG91 dashboard
- [ ] Go to IP Whitelisting section
- [ ] Add IPv4: `122.177.130.139`
- [ ] Add IPv6: `2401:4900:1c06:16e3:5d68:55c2:f7ad:b717` (if required)
- [ ] Save changes
- [ ] Wait 1-2 minutes
- [ ] Test SMS again
- [ ] Check MSG91 dashboard for success

---

## 🆘 If You Can't Find IP Whitelisting

1. **Contact MSG91 Support**
   - Email: support@msg91.com
   - Live Chat: Available on MSG91 website
   - Ask: "How to whitelist IP address for API access"

2. **Check Account Type**
   - Free tier might have IP restrictions
   - Paid accounts usually have IP whitelisting option

3. **Alternative: Use Different Route**
   - Some routes don't require IP whitelisting
   - Check MSG91 documentation for route options

---

## ✅ After Whitelisting

Once IP is whitelisted:
- SMS should send successfully
- Check MSG91 dashboard → Reports → SMS Reports
- Status should show "Delivered" instead of "Failed"

