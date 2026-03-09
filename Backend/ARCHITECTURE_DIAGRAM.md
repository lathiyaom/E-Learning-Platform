# Password Reset Feature - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND APPLICATION                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │ Forgot Password  │  │ Reset Password   │  │ Check Token      │       │
│  │     Page         │  │     Page         │  │    Status        │       │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘       │
│           │                     │                      │                  │
│           │ POST /Auth/         │ POST /Auth/          │ GET /Auth/       │
│           │ forgot-password     │ reset-password       │ check-reset-token│
└───────────┼─────────────────────┼──────────────────────┼─────────────────┘
            │                     │                      │
            ▼                     ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      BACKEND - EXPRESS SERVER                            │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                  AUTH ROUTES (authRoutes.js)                   │    │
│  │  ┌─────────────────────────────────────────────────────────┐   │    │
│  │  │  POST /forgot-password ──► requestPasswordReset()      │   │    │
│  │  │  POST /verify-reset-token ──► verifyResetToken()       │   │    │
│  │  │  GET /check-reset-token ──► checkTokenValidity()       │   │    │
│  │  │  POST /reset-password ──► resetPassword()              │   │    │
│  │  └─────────────────────────────────────────────────────────┘   │    │
│  └────────────┬──────────────────────────────┬───────────────────┘    │
│               │                              │                         │
│               ▼                              ▼                         │
│  ┌───────────────────────────┐   ┌───────────────────────────┐        │
│  │  PASSWORD RESET CONTROLLER │   │  PASSWORD RESET SERVICE   │        │
│  │  (passwordReset            │   │  (passwordResetService.js)│        │
│  │   Controller.js)           │   │                           │        │
│  │                            │   │  • Generate tokens       │        │
│  │  • Validate input          │   │  • Verify tokens         │        │
│  │  • Handle requests         │   │  • Hash passwords        │        │
│  │  • Format responses        │   │  • Clear sessions        │        │
│  │  • Error handling          │   │  • Check expiry          │        │
│  │  • Logging                 │   │  • Find accounts         │        │
│  └─────────────┬──────────────┘   └────────────┬─────────────┘        │
│                │                               │                      │
│                └───────────────┬───────────────┘                      │
│                                │                                      │
│                                ▼                                      │
│                ┌───────────────────────────────────┐                  │
│                │   EMAIL SERVICE (emailService.js) │                  │
│                │                                   │                  │
│                │  ┌─────────────────────────────┐ │                  │
│                │  │ HTML Email Templates:       │ │                  │
│                │  │ • Password Reset Email      │ │                  │
│                │  │ • Confirmation Email        │ │                  │
│                │  │ • Expiry Notification       │ │                  │
│                │  └─────────────────────────────┘ │                  │
│                │                                   │                  │
│                │  ┌─────────────────────────────┐ │                  │
│                │  │ Nodemailer Transport:       │ │                  │
│                │  │ • SMTP Configuration        │ │                  │
│                │  │ • Template Rendering        │ │                  │
│                │  │ • Attachment Support        │ │                  │
│                │  └─────────────────────────────┘ │                  │
│                └───────────────┬───────────────────┘                  │
│                                │                                      │
│                ┌───────────────┴───────────────┐                      │
│                │   DATABASE ACCESS LAYER       │                      │
│                │                               │                      │
│                ▼                               ▼                      │
│  ┌──────────────────────────┐   ┌──────────────────────────┐         │
│  │    USER MODEL UPDATE     │   │   TENANT MODEL UPDATE    │         │
│  │  (User.mongoose.js)      │   │  (Tenant.mongoose.js)    │         │
│  │                          │   │                          │         │
│  │  For each User:          │   │  For each Tenant:        │         │
│  │  • passwordResetToken    │   │  • passwordResetToken    │         │
│  │  • passwordResetExpiry   │   │  • passwordResetExpiry   │         │
│  │                          │   │                          │         │
│  │  Support types:          │   │  Support types:          │         │
│  │  • Student               │   │  • Admin                 │         │
│  │  • Teacher               │   │  • Superadmin            │         │
│  │  • Admin                 │   │                          │         │
│  └──────────────┬───────────┘   └────────────┬─────────────┘         │
│                 │                            │                       │
│                 └────────────┬────────────────┘                       │
│                              │                                       │
│                              ▼                                       │
│                    ┌──────────────────────┐                          │
│                    │   MONGODB DATABASE   │                          │
│                    │  (MONGO_URI)         │                          │
│                    └──────────────────────┘                          │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
            │
            │ User email
            │ Reset link
            │ Token embedded
            ▼
┌────────────────────────────────────┐
│  USER'S EMAIL INBOX                │
│  ┌──────────────────────────────┐  │
│  │ From: noreply@eduverse.com   │  │
│  │ Subject: Password Reset...   │  │
│  │                              │  │
│  │ Click here to reset:         │  │
│  │ https://yourdomain.com/      │  │
│  │ reset-password?              │  │
│  │ token=xxxxx&                 │  │
│  │ email=user@example.com       │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

## Data Flow Sequence

```
┌─────────────┐
│ USER        │
└─────┬───────┘
      │ 1. REQUEST PASSWORD RESET
      │ POST /Auth/forgot-password
      │ { email: "user@example.com" }
      ▼
┌──────────────────────┐
│ PASSWORD             │
│ RESET                │
│ CONTROLLER           │
└─────┬────────────────┘
      │ 2. VALIDATE & DELEGATE
      ▼
┌──────────────────────┐
│ PASSWORD             │
│ RESET                │
│ SERVICE              │
└─────┬────────────────┘
      │ 3. FIND ACCOUNT
      ├───────────────────────────┐
      │                           │
      ▼                           ▼
┌──────────────────┐    ┌──────────────────┐
│ CHECK TENANT     │    │ CHECK USER       │
│ (Admin/Superadmin)   │ (Student/Teacher)│
└──────────────────┘    └──────────────────┘
      │                           │
      └───────────┬───────────────┘
                  │ 4. FOUND ACCOUNT
                  ▼
         ┌────────────────────┐
         │ GENERATE TOKEN:    │
         │ • Random bytes     │
         │ • SHA256 hash      │
         │ • Store in DB      │
         │ • Set 1h expiry    │
         └─────────┬──────────┘
                   │ 5. SEND EMAIL
                   ▼
         ┌────────────────────┐
         │ EMAIL SERVICE      │
         │ • Render template  │
         │ • Replace vars     │
         │ • Send via SMTP    │
         │ • Log activity     │
         └─────────┬──────────┘
                   │ 6. EMAIL SENT
                   ▼
         ┌────────────────────┐
         │ USER INBOX         │
         │ Password reset     │
         │ link with token    │
         └────────┬───────────┘
                  │ 7. USER CLICKS LINK
                  │ Redirected to frontend
                  │ with token & email
                  ▼
         ┌────────────────────┐
         │ FRONTEND:          │
         │ Reset Password     │
         │ Page               │
         └─────────┬──────────┘
                   │ 8. VERIFY TOKEN (OPTIONAL)
                   │ GET /Auth/check-reset-token
                   ▼
         ┌────────────────────┐
         │ Backend verifies:  │
         │ • Token valid      │
         │ • Not expired      │
         │ • Matches hash     │
         └─────────┬──────────┘
                   │ 9. USER ENTERS NEW PASSWORD
                   │ & SUBMITS FORM
                   ▼
         ┌────────────────────┐
         │ POST                   │
         │ /Auth/reset-password   │
         │ {                      │
         │   email,               │
         │   token,               │
         │   newPassword,         │
         │   confirmPassword      │
         │ }                      │
         └─────────┬──────────────┘
                   │ 10. VALIDATE & RESET
                   ▼
         ┌────────────────────────┐
         │ • Verify token         │
         │ • Check expiry         │
         │ • Validate password    │
         │ • Check match          │
         │ • Hash new password    │
         │ • Clear sessions       │
         │ • Update in DB         │
         │ • Send confirmation    │
         └─────────┬──────────────┘
                   │ 11. SUCCESS RESPONSE
                   ▼
         ┌────────────────────┐
         │ FRONTEND:          │
         │ Redirect to        │
         │ Login page         │
         └─────────┬──────────┘
                   │ 12. USER LOGS IN
                   │ With new password
                   ▼
         ┌────────────────────┐
         │ LOGIN & ACCESS     │
         │ SYSTEM ✓           │
         └────────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────┐
│           TECHNOLOGY LAYERS              │
├─────────────────────────────────────────┤
│                                         │
│  FRONTEND                               │
│  • React/Vue.js                         │
│  • Form Handling                        │
│  • URL Parameter Parsing                │
│                                         │
│  ┌─────────────────────────────────────┤
│                                         │
│  BACKEND                                │
│  • Express.js                           │
│  • Node.js                              │
│  • Middleware Stack                     │
│                                         │
│  ┌─────────────────────────────────────┤
│                                         │
│  SERVICES                               │
│  • Nodemailer (Email)                   │
│  • Bcryptjs (Password Hashing)          │
│  • Crypto (Token Generation)            │
│  • JWT (Token Management)               │
│                                         │
│  ┌─────────────────────────────────────┤
│                                         │
│  DATABASE                               │
│  • MongoDB                              │
│  • Mongoose ODM                         │
│  • Indexing & Querying                  │
│                                         │
│  ┌─────────────────────────────────────┤
│                                         │
│  INFRASTRUCTURE                         │
│  • SMTP Server (Gmail, Custom)          │
│  • Environment Variables                │
│  • Error Handling & Logging             │
│                                         │
└─────────────────────────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│              SECURITY ARCHITECTURE                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  TOKEN SECURITY                                        │
│  ├─ SHA256 Hashing                                    │
│  ├─ One-time Use                                      │
│  ├─ 1-Hour Expiry                                     │
│  └─ Unique Per Request                                │
│                                                         │
│  PASSWORD SECURITY                                     │
│  ├─ Bcrypt with Salt                                  │
│  ├─ Minimum 6 Characters                              │
│  ├─ Confirmation Validation                           │
│  └─ No Plain Text Storage                             │
│                                                         │
│  ACCOUNT SECURITY                                      │
│  ├─ Suspension Checks                                 │
│  ├─ Session Clearing                                  │
│  ├─ Force Re-login                                    │
│  └─ Concurrent Session Prevention                     │
│                                                         │
│  PRIVACY & AUDIT                                       │
│  ├─ Generic Success Messages                          │
│  ├─ Comprehensive Logging                             │
│  ├─ IP Address Tracking                               │
│  └─ Failed Attempt Recording                          │
│                                                         │
│  INPUT VALIDATION                                      │
│  ├─ Email Format Check                                │
│  ├─ Token Existence Check                             │
│  ├─ Password Strength Check                           │
│  └─ Field Requirement Check                           │
│                                                         │
│  ERROR HANDLING                                        │
│  ├─ No Info Leakage                                   │
│  ├─ Graceful Failures                                 │
│  ├─ User-Friendly Messages                            │
│  └─ Detailed Internal Logging                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Database Schema Changes

```
USER COLLECTION (MongoDB)
┌─────────────────────────────────────────┐
│ User Document                           │
├─────────────────────────────────────────┤
│ _id: ObjectId                           │
│ email: String (unique)                  │
│ password: String (hashed)               │
│ firstName: String                       │
│ lastName: String                        │
│ userType: String (student/teacher/admin)│
│ status: String (active/inactive)        │
│ ...existing fields...                   │
│                                         │
│ ✨ NEW FIELDS:                          │
│ passwordResetToken: String (nullable)   │
│ passwordResetTokenExpiry: Date (nullable)│
│ ...                                     │
└─────────────────────────────────────────┘

TENANT COLLECTION (MongoDB)
┌─────────────────────────────────────────┐
│ Tenant Document                         │
├─────────────────────────────────────────┤
│ _id: ObjectId                           │
│ email: String (unique)                  │
│ password: String (hashed)               │
│ name: String                            │
│ userType: String (admin/superadmin)     │
│ status: String (active/inactive)        │
│ ...existing fields...                   │
│                                         │
│ ✨ NEW FIELDS:                          │
│ passwordResetToken: String (nullable)   │
│ passwordResetTokenExpiry: Date (nullable)│
│                                         │
└─────────────────────────────────────────┘
```

## Error Handling Flow

```
REQUEST
  │
  ├─► VALIDATION CHECK
  │   ├─ Email exists?
  │   ├─ Token format?
  │   ├─ Passwords match?
  │   └─ Password strong enough?
  │
  ├─► DATABASE CHECK
  │   ├─ Account found?
  │   ├─ Account suspended?
  │   ├─ Token valid?
  │   └─ Token expired?
  │
  ├─► OPERATION
  │   ├─ Generate token
  │   ├─ Update database
  │   └─ Send email
  │
  └─► RESPONSE
      ├─ Success (200)
      ├─ Bad Request (400)
      ├─ Unauthorized (401)
      ├─ Forbidden (403)
      └─ Server Error (500)
```

---

This completes the comprehensive password reset feature implementation!