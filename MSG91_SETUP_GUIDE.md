# MSG91 WhatsApp OTP Integration Guide

This guide will help you set up MSG91 for WhatsApp OTP authentication in your application.

## Required Credentials

You'll need to provide these 5 credentials:

1. **MSG91_AUTHKEY** - Your authentication key
2. **MSG91_INTEGRATED_NUMBER** - Your WhatsApp Business Number
3. **MSG91_TEMPLATE_NAME** - Your approved OTP template name
4. **MSG91_TEMPLATE_NAMESPACE** - Your template namespace ID
5. **MSG91_TEMPLATE_LANGUAGE** - Language code (usually `en` or `en_US`)

---

## Step-by-Step Setup Process

### Step 1: Create MSG91 Account

1. Go to https://msg91.com
2. Sign up for a new account
3. **Complete KYC verification** (required for WhatsApp services)
4. Add wallet balance for WhatsApp messaging

### Step 2: Get Your AuthKey

1. Log in to MSG91 dashboard
2. Click **"Authkey"** from the top menu (or username dropdown)
3. Click **"Create New"** under Configure section
4. Copy and save the generated authkey securely
5. *(Optional)* Whitelist your server IP addresses for extra security

**Where to find it:**
- Top menu → Authkey
- Or click on your username dropdown → Authkey

### Step 3: Connect WhatsApp Business Number

1. In MSG91 dashboard, go to **"WhatsApp"** section
2. Click to connect your WhatsApp Business Number
3. You'll need to verify it through **Facebook Business Manager**
4. Once verified, note down your integrated number
   - Format: `919999999999` (country code + number without + or spaces)

### Step 4: Create WhatsApp OTP Template

1. Go to the **WhatsApp templates** section in MSG91 dashboard
2. Create a new authentication/OTP template
3. Example template text:
   ```
   Your OTP for login is {{1}}. Valid for 5 minutes.
   Do not share this code with anyone.
   ```
4. **Submit for approval and wait for WhatsApp approval**
   - Usually takes 24-48 hours
   - You cannot send messages until template is approved
5. After approval, note down:
   - **Template name** (e.g., `otp_authentication`)
   - **Template namespace** (e.g., `abc123_xyz456`)
   - **Language code** (e.g., `en`)

### Step 5: Provide Credentials

Once you have all the above, provide these credentials:

```
MSG91_AUTHKEY=<your_authkey>
MSG91_INTEGRATED_NUMBER=<your_whatsapp_number>
MSG91_TEMPLATE_NAME=<your_template_name>
MSG91_TEMPLATE_NAMESPACE=<your_namespace>
MSG91_TEMPLATE_LANGUAGE=en
```

---

## What Will Be Implemented

Once you provide the credentials, the following will be added to your application:

1. **MSG91 Service File** - Handle WhatsApp OTP operations
2. **API Endpoints:**
   - `POST /api/send-otp` - Send OTP via WhatsApp
   - `POST /api/verify-otp` - Verify the OTP entered by user
3. **Environment Variables** - Credentials stored in `.env` file
4. **Testing** - Full integration testing

---

## API Endpoints That Will Be Available

### Send OTP
```
POST /api/send-otp
Body: {
  "phoneNumber": "919999999999"
}

Response: {
  "success": true,
  "message": "OTP sent successfully"
}
```

### Verify OTP
```
POST /api/verify-otp
Body: {
  "phoneNumber": "919999999999",
  "otp": "123456"
}

Response: {
  "success": true,
  "message": "OTP verified successfully"
}
```

---

## Important Notes

- ✅ **WhatsApp OTP templates cost ~1/3 of regular WhatsApp messages**
- ✅ **Template approval is mandatory** - you can't send messages without it
- ✅ **Keep your authkey secure** - don't share it publicly
- ⏱️ **Template approval takes 24-48 hours** - plan accordingly
- 💰 **Ensure wallet has balance** before testing
- 🔐 **OTP validation happens on backend** - never trust client-side validation
- ⏰ **Set reasonable expiry time** - 3-10 minutes recommended

---

## Pricing

- WhatsApp OTP messages are significantly cheaper than regular WhatsApp messages
- Charges are deducted from your MSG91 wallet balance
- Check current pricing at https://msg91.com/pricing

---

## Documentation Links

- Official Docs: https://docs.msg91.com
- WhatsApp OTP Guide: https://msg91.com/help/whatsapp/whatsapp-otp
- Template Creation: https://msg91.com/help/whatsapp/how-to-create-a-template-for-whatsapp
- API Documentation: https://api.msg91.com/apidoc

---

## Troubleshooting

**OTP not received:**
- Check wallet balance
- Verify template is approved
- Ensure phone number format is correct (country code + number)
- Check MSG91 dashboard logs

**Template not approved:**
- Ensure template follows WhatsApp guidelines
- Avoid promotional content in OTP templates
- Keep template simple and clear

**Authentication errors:**
- Verify authkey is correct
- Check if IP whitelisting is enabled and your IP is added

---

## Ready to Integrate?

Once you complete all steps and have your 5 credentials ready, share them and the integration will be completed!
