# Quick Test Commands - Real Environment

## 🚀 Quick Start (5 minutes)

### Step 1: Update .env with Real Email
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
EMAIL_FROM=noreply@your-email.com
FRONTEND_URL_DEV=http://localhost:3000
NODE_ENV=production
```

### Step 2: Restart Backend
```bash
# Terminal: node (in Backend directory)
npm run dev
```

---

## 📧 Test Commands with Real Email

### Command 1: Request Password Reset
```bash
curl -X POST http://localhost:5000/Auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"yourtestuser@gmail.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "If an account exists with this email, you will receive password reset instructions."
}
```

**Action:** Check your email for reset link with token

---

### Command 2: Extract Token from Email
Email will contain link like:
```
https://.../reset-password?token=abc123xyz789...&email=yourtestuser@gmail.com
```

Copy the token (everything after `token=` and before `&email`)

---

### Command 3: Verify Token
```bash
curl -X POST http://localhost:5000/Auth/verify-reset-token \
  -H "Content-Type: application/json" \
  -d '{
    "email":"yourtestuser@gmail.com",
    "token":"YOUR-TOKEN-HERE"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "accountType": "user"
}
```

---

### Command 4: Check Token (GET)
```bash
curl -X GET "http://localhost:5000/Auth/check-reset-token?email=yourtestuser@gmail.com&token=YOUR-TOKEN-HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "valid": true,
  "message": "Token is valid"
}
```

---

### Command 5: Reset Password
```bash
curl -X POST http://localhost:5000/Auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email":"yourtestuser@gmail.com",
    "token":"YOUR-TOKEN-HERE",
    "newPassword":"NewTest123",
    "confirmPassword":"NewTest123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

**Action:** Check email for confirmation email

---

### Command 6: Login with New Password
```bash
curl -X POST http://localhost:5000/Auth/Login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"yourtestuser@gmail.com",
    "password":"NewTest123"
  }'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "yourtestuser@gmail.com",
      "userType": "student",
      "firstName": "Test",
      "lastName": "User"
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

✅ **SUCCESS!** Password reset works!

---

## 🧪 Postman Collection

### Request 1: Forgot Password
```
Method: POST
URL: http://localhost:5000/Auth/forgot-password
Body (JSON):
{
  "email": "yourtestuser@gmail.com"
}
```

### Request 2: Verify Token
```
Method: POST
URL: http://localhost:5000/Auth/verify-reset-token
Body (JSON):
{
  "email": "yourtestuser@gmail.com",
  "token": "copy-from-email"
}
```

### Request 3: Check Token
```
Method: GET
URL: http://localhost:5000/Auth/check-reset-token?email=yourtestuser@gmail.com&token=copy-from-email
```

### Request 4: Reset Password
```
Method: POST
URL: http://localhost:5000/Auth/reset-password
Body (JSON):
{
  "email": "yourtestuser@gmail.com",
  "token": "copy-from-email",
  "newPassword": "NewTest123",
  "confirmPassword": "NewTest123"
}
```

### Request 5: Login
```
Method: POST
URL: http://localhost:5000/Auth/Login
Body (JSON):
{
  "email": "yourtestuser@gmail.com",
  "password": "NewTest123"
}
```

---

## 📋 Real Testing Checklist

```
SETUP
☐ Gmail app password created
☐ .env updated
☐ Backend restarted
☐ Test user created in database

TEST SEQUENCE
☐ Run Command 1 (Forgot Password)
☐ Check email inbox
☐ Copy token from email
☐ Run Command 3 (Verify Token)
☐ Run Command 4 (Check Token GET)
☐ Run Command 5 (Reset Password)
☐ Check email for confirmation
☐ Run Command 6 (Login)

VERIFICATION
☐ All API responses are 200 OK
☐ All responses have "success": true
☐ Email received with reset link
☐ Token verification successful
☐ Password reset successful
☐ Login with new password successful
☐ Confirmation email received
```

---

## 🔐 Security Verification

Before deploying to production, verify:

```
Security Checks
☐ Password is hashed (not plain text in DB)
☐ Token is hashed (not plain text in email)
☐ Sessions cleared after reset
☐ Old password doesn't work
☐ New password works
☐ Token expires after 1 hour
☐ Token can't be reused
☐ Email validation works
☐ Generic error messages shown
☐ All activities logged
```

---

## 📊 Test Results Template

```
Date: ___________
Test User: ___________
Email Provider: ___________

Results:
☐ Forgot password request sent
☐ Email received (Time: ___)
☐ Token verified successfully
☐ Token check passed
☐ Password reset successful
☐ Confirmation email received
☐ Login with new password successful

Issues Found:
_________________________________

Notes:
_________________________________
```

---

## 🆘 Quick Troubleshooting

**Email not received?**
- Check SMTP credentials
- Check spam folder
- Check backend logs

**Token invalid?**
- Verify token copied correctly
- Check it hasn't expired (1 hour max)
- Request new token if expired

**Password reset fails?**
- Verify password is 6+ characters
- Ensure passwords match
- Check user exists in database

**Login fails after reset?**
- Verify new password is correct
- Clear browser cache/cookies
- Check user status is "active"

---

## 📈 Next Steps

1. ✅ Complete these quick tests
2. ✅ Test all user types (student, teacher, admin, org admin, superadmin)
3. ✅ Test error scenarios
4. ✅ Customize email templates
5. ✅ Set up production email service
6. ✅ Deploy to staging
7. ✅ Deploy to production

---

**See REAL_TESTING_GUIDE.md for complete testing documentation**