# 📧 EmailJS Template Configuration

## Template Setup for Complaint Verification Email

### Step 1: Create Template in EmailJS Dashboard

1. Go to **https://www.emailjs.com/**
2. Login to your account
3. Navigate to **Email Templates** → **Create New Template**

---

## Template Configuration

### Template Name
```
Complaint Verification
```

### Subject Line
```
{{subject}}
```

### Email Content (HTML)

Copy and paste this HTML template:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .email-container {
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #2563eb;
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      margin: 0;
    }
    .content {
      padding: 30px;
      background-color: #ffffff;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
    }
    .status-badge {
      display: inline-block;
      background-color: #10b981;
      color: white;
      padding: 8px 20px;
      border-radius: 25px;
      font-weight: bold;
      margin: 15px 0;
      font-size: 14px;
    }
    .complaint-id-box {
      background-color: #f3f4f6;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
      border-left: 4px solid #2563eb;
    }
    .complaint-id-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
    }
    .complaint-id-value {
      font-family: 'Courier New', monospace;
      font-size: 18px;
      font-weight: bold;
      color: #111827;
    }
    .steps-section {
      background-color: #f9fafb;
      padding: 25px;
      border-radius: 6px;
      margin: 25px 0;
      border: 1px solid #e5e7eb;
    }
    .steps-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 15px;
      color: #111827;
    }
    .steps-list {
      margin: 0;
      padding-left: 20px;
      color: #374151;
    }
    .steps-list li {
      margin: 10px 0;
      line-height: 1.8;
    }
    .footer-info {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    .municipal-office {
      font-weight: bold;
      color: #111827;
      margin: 10px 0;
    }
    .phone {
      color: #6b7280;
      margin: 5px 0;
    }
    .email-footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 12px;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
    .category-highlight {
      color: #2563eb;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <div class="logo">🏛️ CIVICFIX</div>
    </div>
    
    <!-- Content -->
    <div class="content">
      <div class="greeting">
        Dear {{user_name}},
      </div>
      
      <p>
        Your <span class="category-highlight">{{category}}</span> complaint has been <strong>VERIFIED</strong> by {{municipal_office}}.
      </p>
      
      <div class="status-badge">✅ Status: Verified</div>
      
      <div class="complaint-id-box">
        <div class="complaint-id-label">Complaint ID</div>
        <div class="complaint-id-value">{{complaint_id}}</div>
      </div>
      
      <div class="steps-section">
        <div class="steps-title">📝 Next Steps:</div>
        <ul class="steps-list">
          <li>Your complaint is now under review</li>
          <li>A contractor will be assigned shortly</li>
          <li>You will receive updates on the progress</li>
          <li>Expected resolution within 7-10 working days</li>
        </ul>
      </div>
      
      <p style="margin-top: 25px;">
        Thank you for helping us serve you better!
      </p>
      
      <div class="footer-info">
        <div class="municipal-office">- {{municipal_office}}</div>
        <div class="phone">📞 {{municipal_office_phone}}</div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="email-footer">
      <p style="margin: 5px 0;">
        <strong>CivicFix</strong> - Public Issue Reporting System
      </p>
      <p style="margin: 5px 0;">
        This is an automated email. Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
```

---

## Template Variables

The template uses these variables (EmailJS will automatically replace them):

| Variable | Description | Example |
|----------|-------------|---------|
| `{{subject}}` | Email subject line | "🏛️ CIVICFIX - Your Drainage Complaint Has Been Verified" |
| `{{user_name}}` | User's name | "Amit" |
| `{{category}}` | Complaint category | "Drainage" |
| `{{complaint_id}}` | Complaint ID (last 6 chars) | "c579d3" |
| `{{municipal_office}}` | Municipal office name | "Belagavi City Corporation (BCC)" |
| `{{municipal_office_phone}}` | Municipal office phone | "0831-2405316 / 24" |
| `{{message}}` | Full HTML message (alternative) | (if using simple template) |

---

## Alternative: Simple Text Template

If you prefer a simpler template, use this:

### Subject:
```
{{subject}}
```

### Content:
```
{{message}}
```

The code will send the full HTML in the `{{message}}` variable.

---

## Step 2: Save Template

1. **Paste the HTML** into the template editor
2. **Click "Save"**
3. **Copy the Template ID** (e.g., `template_xxxxxxx`)

---

## Step 3: Test Template

After saving, you can test it:
1. Click **"Test"** button in EmailJS dashboard
2. Fill in test values:
   - `user_name`: "Test User"
   - `category`: "Drainage"
   - `complaint_id`: "TEST123"
   - `municipal_office`: "Test Office"
   - `municipal_office_phone`: "123-456-7890"
3. Click **"Send Test Email"**
4. Check your inbox!

---

## Template Preview

The email will look like this:

```
┌─────────────────────────────────┐
│   🏛️ CIVICFIX                   │  (Blue Header)
├─────────────────────────────────┤
│                                 │
│  Dear Amit,                     │
│                                 │
│  Your Drainage complaint has    │
│  been VERIFIED by...            │
│                                 │
│  ✅ Status: Verified            │  (Green Badge)
│                                 │
│  ┌─────────────────────────┐   │
│  │ Complaint ID            │   │
│  │ c579d3                  │   │
│  └─────────────────────────┘   │
│                                 │
│  📝 Next Steps:                 │
│  • Your complaint is now...     │
│  • A contractor will be...      │
│  • You will receive updates...   │
│  • Expected resolution...       │
│                                 │
│  Thank you for helping...       │
│                                 │
│  - Belagavi City Corporation    │
│  📞 0831-2405316 / 24           │
│                                 │
├─────────────────────────────────┤
│  CivicFix - Public Issue...     │  (Footer)
│  This is an automated email...  │
└─────────────────────────────────┘
```

---

## Important Notes

1. **Template Variables**: Make sure all variables match exactly (case-sensitive)
2. **HTML Support**: EmailJS supports full HTML, so the template will render beautifully
3. **Responsive**: The template is mobile-friendly
4. **Branding**: Includes CivicFix logo and professional styling

---

## Quick Setup Checklist

- [ ] Create template in EmailJS dashboard
- [ ] Paste HTML template
- [ ] Set subject to `{{subject}}`
- [ ] Save template
- [ ] Copy Template ID
- [ ] Add Template ID to `.env` file
- [ ] Test template with test email
- [ ] Verify email looks good

---

**That's it! Your email template is ready!** 🎉

