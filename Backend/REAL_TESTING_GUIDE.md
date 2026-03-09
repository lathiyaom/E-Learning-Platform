# Real Environment Testing Guide - Forget Password Feature

## 🎯 Complete Testing Walkthrough

---

## PHASE 1: Setup Real Email Service

### Option A: Gmail SMTP (Easiest - Recommended)

#### Step 1: Enable 2-Factor Authentication in Gmail
1. Go to myaccount.google.com
2. Click "Security" in left panel
3. Enable "2-Step Verification"
4. Complete verification process

#### Step 2: Generate Gmail App Password
1. Go back to myaccount.google.com → Security
2. Scroll down to "App passwords"
3. Select: App = Mail, Device = Windows/Mac/Linux
4. Google generates a 16-character password
5. Copy this password

#### Step 3: Update Your .env File
```env
# Email Configuration - Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=krzz hqcb rczr qfek
EMAIL_FROM=noreply@your-email.com
NODE_ENV=production

# Frontend URLs
FRONTEND_URL_DEV=http://localhost:3000
FRONTEND_URL_PROD=http://localhost:3000
```

#### Step 4: Restart Your Backend
```bash
# In Terminal: node
cd .\Backend\
npm start
# OR use nodemon for auto-reload
npm run dev
```

---

### Option B: SendGrid (For Production)

#### Step 1: Create SendGrid Account
1. Sign up at sendgrid.com
2. Verify email
3. Go to Settings → API Keys
4. Create new API key

#### Step 2: Update .env
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-full-api-key
EMAIL_FROM=noreply@yourdomain.com
NODE_ENV=production
```

#### Step 3: Restart Backend
```bash
cd .\Backend\
npm run dev
```

---

### Option C: Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
EMAIL_FROM=noreply@yourdomain.com
```

---

## PHASE 2: Create Real Test Accounts

### Step 1: Add Test Users to Database

#### Using MongoDB Shell
```bash
# Connect to your MongoDB
mongo "mongodb+srv://username:password@cluster.mongodb.net/dbname"

# Create test student
db.users.insertOne({
  tenant_id: ObjectId("...existing_tenant_id..."),
  organizations: [],
  userType: "student",
  firstName: "Test",
  lastName: "Student",
  email: "teststudent@gmail.com",
  password: "$2a$10$...", // bcrypt hashed password
  status: "active",
  agreeTerms: true,
  timestamps: new Date()
})

# Create test teacher
db.users.insertOne({
  tenant_id: ObjectId("..."),
  organizations: [],
  userType: "teacher",
  firstName: "Test",
  lastName: "Teacher",
  email: "testteacher@gmail.com",
  password: "$2a$10$...",
  status: "active",
  agreeTerms: true,
  timestamps: new Date()
})
```

#### OR Using MongoDB Compass (GUI)
1. Connect to your MongoDB database
2. Navigate to your database → users collection
3. Click "Insert Document"
4. Add test user record
5. Repeat for multiple user types

---

## PHASE 3: Test Complete Forgot Password Flow

### Step 1: Test Forgot Password Request

#### Using Postman
1. **New Request**
   - Method: `POST`
   - URL: `http://localhost:5000/Auth/forgot-password`
   - Body (raw JSON):
   ```json
   {
     "email": "teststudent@gmail.com"
   }
   ```

2. **Send Request**
   - Expected Status: `200 OK`
   - Expected Response:
   ```json
   {
     "success": true,
     "message": "If an account exists with this email, you will receive password reset instructions."
   }
   ```

3. **Check Your Email**
   - Open the email account you specified
   - Look for email from `noreply@...`
   - Subject: "Password Reset Request - E-Learning Platform"
   - Check if reset link is present with token

#### Using cURL
```bash
curl -X POST http://localhost:5000/Auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"teststudent@gmail.com"}'
```

---

### Step 2: Copy Reset Token from Email

1. **Open the email** you received
2. **Find the reset link** - should look like:
   ```
   https://localhost:3000/reset-password?token=abc123xyz...&email=teststudent@gmail.com
   ```
3. **Extract the token** - everything after `token=` and before `&email`
   - Example: `abc123xyz789def...`

---

### Step 3: Verify Token is Valid

#### Using Postman
1. **New Request**
   - Method: `POST`
   - URL: `http://localhost:5000/Auth/verify-reset-token`
   - Body (raw JSON):
   ```json
   {
     "email": "teststudent@gmail.com",
     "token": "your-token-from-email"
   }
   ```

2. **Send Request**
   - Expected Status: `200 OK`
   - Expected Response:
   ```json
   {
     "success": true,
     "message": "Token is valid",
     "accountType": "user"
   }
   ```

#### Using cURL
```bash
curl -X POST http://localhost:5000/Auth/verify-reset-token \
  -H "Content-Type: application/json" \
  -d '{
    "email":"teststudent@gmail.com",
    "token":"your-token-from-email"
  }'
```

---

### Step 4: Check Token With GET Request

#### Using Postman
1. **New Request**
   - Method: `GET`
   - URL: `http://localhost:5000/Auth/check-reset-token?email=teststudent@gmail.com&token=your-token-from-email`
   - No body needed

2. **Send Request**
   - Expected Status: `200 OK`
   - Expected Response:
   ```json
   {
     "success": true,
     "valid": true,
     "message": "Token is valid"
   }
   ```

#### Using cURL
```bash
curl -X GET "http://localhost:5000/Auth/check-reset-token?email=teststudent@gmail.com&token=your-token-from-email"
```

---

### Step 5: Reset Password

#### Using Postman
1. **New Request**
   - Method: `POST`
   - URL: `http://localhost:5000/Auth/reset-password`
   - Body (raw JSON):
   ```json
   {
     "email": "teststudent@gmail.com",
     "token": "your-token-from-email",
     "newPassword": "TestPassword123",
     "confirmPassword": "TestPassword123"
   }
   ```

2. **Send Request**
   - Expected Status: `200 OK`
   - Expected Response:
   ```json
   {
     "success": true,
     "message": "Password has been reset successfully. You can now log in with your new password."
   }
   ```

3. **Check Email Again**
   - Should receive confirmation email
   - Subject: "Your Password Has Been Reset - E-Learning Platform"

#### Using cURL
```bash
curl -X POST http://localhost:5000/Auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email":"teststudent@gmail.com",
    "token":"your-token-from-email",
    "newPassword":"TestPassword123",
    "confirmPassword":"TestPassword123"
  }'
```

---

### Step 6: Login With New Password

#### Using Postman
1. **New Request**
   - Method: `POST`
   - URL: `http://localhost:5000/Auth/Login`
   - Body (raw JSON):
   ```json
   {
     "email": "teststudent@gmail.com",
     "password": "TestPassword123"
   }
   ```

2. **Send Request**
   - Expected Status: `200 OK`
   - Expected Response:
   ```json
   {
     "message": "Login successful",
     "success": true,
     "data": {
       "user": {
         "id": "...",
         "email": "teststudent@gmail.com",
         "userType": "student",
         "firstName": "Test",
         "lastName": "Student"
       },
       "accessToken": "...",
       "refreshToken": "..."
     }
   }
   ```

✅ **SUCCESS! Password reset works!**

---

## PHASE 4: Test All User Types

Test with each user type to ensure it works for everyone:

### Test User 1: Student
```json
{
  "email": "teststudent@gmail.com",
  "userType": "student"
}
```

### Test User 2: Teacher
```json
{
  "email": "testteacher@gmail.com",
  "userType": "teacher"
}
```

### Test User 3: Admin (User Level)
```json
{
  "email": "testadmin@gmail.com",
  "userType": "admin"
}
```

### Test User 4: Organization Admin (Tenant)
```json
{
  "email": "orgadmin@example.com",
  "userType": "admin" // In Tenant model
}
```

### Test User 5: Superadmin
```json
{
  "email": "superadmin@gmail.com",
  "userType": "superadmin" // In Tenant model
}
```

**For each user:**
1. Run forgot-password → check email
2. Copy token from email
3. Verify token
4. Reset password
5. Login with new password

✅ All should work!

---

## PHASE 5: Test Error Scenarios

### Error Test 1: Invalid Email
```bash
POST /Auth/forgot-password
{
  "email": "nonexistent@gmail.com"
}
```
Expected: `200 OK` with generic message (privacy feature)

### Error Test 2: Expired Token
```bash
# Wait 1 hour, then try to reset
POST /Auth/reset-password
{
  "email": "teststudent@gmail.com",
  "token": "expired-token",
  "newPassword": "NewPass123",
  "confirmPassword": "NewPass123"
}
```
Expected: `400 Bad Request` - "Invalid or expired reset token"

### Error Test 3: Wrong Token
```bash
POST /Auth/reset-password
{
  "email": "teststudent@gmail.com",
  "token": "wrong-token-abc123",
  "newPassword": "NewPass123",
  "confirmPassword": "NewPass123"
}
```
Expected: `400 Bad Request` - "Invalid or expired reset token"

### Error Test 4: Passwords Don't Match
```bash
POST /Auth/reset-password
{
  "email": "teststudent@gmail.com",
  "token": "valid-token",
  "newPassword": "Pass123",
  "confirmPassword": "DifferentPass123"
}
```
Expected: `400 Bad Request` - "Passwords do not match"

### Error Test 5: Weak Password
```bash
POST /Auth/reset-password
{
  "email": "teststudent@gmail.com",
  "token": "valid-token",
  "newPassword": "123",
  "confirmPassword": "123"
}
```
Expected: `400 Bad Request` - "Password must be at least 6 characters long"

### Error Test 6: Missing Fields
```bash
POST /Auth/forgot-password
{
  "email": ""
}
```
Expected: `400 Bad Request` - "Email is required"

---

## PHASE 6: Monitor Logs

### Check Backend Logs

#### Logs Location
```
Backend/logs/
```

#### View Real-Time Logs
```bash
# In Terminal: node (in Backend directory)
tail -f logs/*.log

# Or on Windows
Get-Content .\logs\*.log -Wait
```

#### Look for These Log Entries
```
✅ Password reset email sent
✅ Reset token generated
✅ Token verified successfully
✅ Password reset successful
✅ Email sent successfully
```

#### Check for Errors
```
❌ Email send error
❌ Token verification failed
❌ Password reset failed
```

---

## PHASE 7: Verify Email Headers

### Check Email Details

1. **Open the email** you received
2. **Check email headers** (varies by provider):
   - **Gmail**: Click dropdown → Show original
   - **Outlook**: File → Info → Properties
3. **Verify these details:**
   - From: `noreply@your-email.com`
   - To: Your test email
   - Subject: "Password Reset Request..."
   - HTML formatted with your template

---

## PHASE 8: Test Frontend Integration

### Step 1: Create Forgot Password Page
```jsx
// Frontend: pages/ForgotPassword.jsx
import { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/Auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Reset Password'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
```

### Step 2: Create Reset Password Page
```jsx
// Frontend: pages/ResetPassword.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/Auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token,
          newPassword: password,
          confirmPassword
        })
      });
      
      const data = await response.json();
      setMessage(data.message);
      
      if (data.success) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New Password"
        required
      />
      <input 
        type="password" 
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
```

---

## PHASE 9: Full End-to-End Test

### Complete Flow Test
```
1. Frontend: User clicks "Forgot Password"
   ↓
2. Frontend: User enters email
   ↓
3. Backend: /Auth/forgot-password endpoint
   ↓
4. Backend: Email sent with reset link
   ↓
5. User: Receives email & clicks reset link
   ↓
6. Frontend: Reset password page loads
   ↓
7. Frontend: User enters new password
   ↓
8. Backend: /Auth/reset-password endpoint
   ↓
9. Backend: Password updated & sessions cleared
   ↓
10. Backend: Confirmation email sent
    ↓
11. Frontend: Redirect to login
    ↓
12. Frontend: User logs in with new password
    ↓
13. Backend: Login successful ✅
```

---

## TESTING CHECKLIST

```
ENVIRONMENT SETUP
☐ Gmail app password created or SendGrid key generated
☐ .env file updated with SMTP credentials
☐ Backend restarted
☐ Database connected and populated with test users

BASIC FUNCTIONALITY
☐ Forgot password email received
☐ Token extracted from email
☐ Token verification successful
☐ Password reset successful
☐ Login with new password works
☐ Confirmation email received

USER TYPES
☐ Student account tested
☐ Teacher account tested
☐ Admin (User) account tested
☐ Admin (Tenant) account tested
☐ Superadmin account tested

ERROR SCENARIOS
☐ Invalid email handled
☐ Expired token handled
☐ Wrong token handled
☐ Password mismatch handled
☐ Weak password handled
☐ Missing fields handled

SECURITY
☐ Sessions cleared after reset
☐ Old password doesn't work
☐ New password works
☐ Token can't be reused
☐ Generic error messages shown

FRONTEND
☐ Forgot Password page displays
☐ Reset Password page displays
☐ Form validation works
☐ Redirect to login after success
☐ Error messages display

LOGGING & MONITORING
☐ Logs show password reset activity
☐ Email sending logged
☐ Errors logged with details
☐ No sensitive data in logs
```

---

## Troubleshooting Real Testing

### Problem: Email not received
**Solution:**
1. Check SMTP credentials are correct
2. Check email provider allows third-party access
3. Check spam/junk folder
4. Review backend logs for email errors
5. Test SMTP connection manually

### Problem: Token invalid after reset
**Solution:**
1. Ensure token copied correctly from email
2. Token expires after 1 hour
3. Token can only be used once
4. Request new reset if token expired

### Problem: Password reset fails
**Solution:**
1. Verify password is 6+ characters
2. Ensure passwords match exactly
3. Check token is still valid
4. Verify email matches user email in database

### Problem: Can't login after reset
**Solution:**
1. Verify new password is correct
2. Ensure old sessions were cleared
3. Try clearing browser cache/cookies
4. Check user status is "active"

### Problem: Email format looks wrong
**Solution:**
1. Edit email templates in `emailService.js`
2. Update HTML/styling
3. Add company logo
4. Customize text and links
5. Restart backend

---

## Next Steps After Successful Testing

1. ✅ Customize email templates with your branding
2. ✅ Set up production email service
3. ✅ Deploy to staging environment
4. ✅ Test with real users on staging
5. ✅ Deploy to production
6. ✅ Monitor logs in production
7. ✅ Gather user feedback

---

**Your forget password feature is now ready for real-world testing!** 🚀