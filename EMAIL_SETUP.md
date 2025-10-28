# 📧 EMAIL CONFIRMATION SETUP GUIDE

## 🏆 **EmailJS Setup (FREE - 200 emails/month)**

### **Step 1: Create EmailJS Account**
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click **"Sign Up"** (FREE account)
3. Verify your email

### **Step 2: Connect Your Email**
1. In EmailJS dashboard, go to **"Email Services"**
2. Click **"Add New Service"**
3. Choose **Gmail** (easiest) or your email provider
4. Follow the connection steps
5. **Copy the Service ID** (e.g., `service_abc123`)

### **Step 3: Create Email Template**
1. Go to **"Email Templates"**
2. Click **"Create New Template"**
3. Use this template:

```html
Subject: 🎉 Registration Confirmed - {{event_name}}

Dear {{to_name}},

Thank you for registering for {{event_name}}!

📋 REGISTRATION DETAILS:
• Name: {{full_name}}
• Email: {{email}}
• Phone: {{phone}}
• Age: {{age}}

⛪ CHURCH DETAILS:
• GRM Member: {{is_grm_member}}
• GRM Branch: {{grm_branch}}
• Church: {{church_name}}

🎪 EXHIBITION:
• Wants to Exhibit: {{wants_to_exhibit}}
• Description: {{exhibition_description}}

📅 EVENT DETAILS:
• Date: {{event_date}}
• Time: {{event_time}}
• Venue: {{event_venue}}

{{custom_message}}

For questions, contact: {{contact_info}}

Blessings,
{{from_name}} Team

---
This is an automated confirmation email.
```

4. **Save** and copy the **Template ID** (e.g., `template_xyz789`)

### **Step 4: Get Public Key**
1. Go to **"Account"** → **"General"**
2. Copy your **Public Key** (e.g., `user_abc123def456`)

### **Step 5: Update Environment Variables**
Add to your `.env` file:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=user_abc123def456
```

### **Step 6: Test Email**
1. Register someone with an email
2. Check if confirmation email arrives
3. If not, check browser console for errors

## 🎯 **What Happens Now:**

### **✅ With Email:**
```
User registers → Saves to database → Sends confirmation email → Success message
```

### **❌ Without Email:**
```
User registers → Saves to database → No email sent → Success message
```

### **🔄 If Email Fails:**
```
User registers → Saves to database → Email fails → Still shows success (registration saved)
```

## 📱 **Email Content Includes:**
- ✅ Personal registration details
- ✅ Church/GRM information  
- ✅ Exhibition status
- ✅ Event details (you can customize)
- ✅ Custom message based on registration type

## 💰 **Cost:**
- **FREE** up to 200 emails/month
- **$20/month** for 1,000 emails
- **Perfect** for church events

## 🚨 **Troubleshooting:**

**Email not sending?**
1. Check browser console for errors
2. Verify environment variables are set
3. Test EmailJS template in their dashboard
4. Make sure Gmail/email service is connected

**Gmail blocked?**
1. Use "App Password" instead of regular password
2. Enable 2-factor authentication first
3. Generate app password in Gmail settings

## 🎉 **You're Done!**
Your registration system now sends beautiful confirmation emails automatically! 📧✨
