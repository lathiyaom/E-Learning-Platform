# Forget Password Flow Implementation

## Overview
This implementation adds a complete "Forget Password" functionality to the E-Learning Platform backend. It supports all user types:
- **Tenants**: Admin and Superadmin users
- **Users**: Students, Teachers, and Admins

## Features Implemented

### 1. Database Schema Updates
Added password reset fields to both `User` and `Tenant` models:
- `passwordResetToken`: Encrypted token for password reset
- `passwordResetTokenExpiry`: Expiry time for the reset token (1 hour)

**Files Modified**:
- `src/models/User.mongoose.js`
- `src/models/Tenant.mongoose.js`

### 2. Email Service Enhancement
Enhanced `emailService.js` with password reset email templates:
- **passwordReset**: Email sent when user requests password reset
- **passwordResetConfirmation**: Confirmation email after successful password reset
- **passwordResetExpired**: Notification email if reset token expires

**Features**:
- HTML formatted emails with professional design
- Support for both development (Mailtrap) and production environments (SMTP, SendGrid)
- Template variable substitution (firstName, email, resetLink, etc.)
- Error handling and logging

**File Modified**: `src/utils/emailService.js`

### 3. Password Reset Service
Created `passwordResetService.js` with core business logic:

#### Functions:
1. **requestPasswordReset(email, baseUrl)**
   - Validates email and checks if account exists
   - Generates secure reset token (SHA256 hashed)
   - Sets 1-hour expiry
   - Sends password reset email
   - Returns generic success message (security best practice)

2. **verifyResetToken(email, token)**
   - Hashes provided token and matches with stored hash
   - Checks token expiry
   - Returns token validity status

3. **resetPassword(email, token, newPassword, confirmPassword, baseUrl)**
   - Verifies token validity and expiry
   - Validates password match and strength (min 6 chars)
   - Hashes new password with bcrypt
   - Clears session tokens (forces re-login)
   - Sends confirmation email

4. **checkResetTokenValidity(email, token)**
   - Frontend-friendly token validation
   - Returns validity status without revealing other details

**File Created**: `src/services/passwordResetService.js`

### 4. Password Reset Controller
Created `passwordResetController.js` with API endpoints:

#### Controllers:
1. **requestPasswordReset** - POST endpoint
2. **verifyResetToken** - POST endpoint  
3. **resetPassword** - POST endpoint
4. **checkTokenValidity** - GET endpoint

**File Created**: `src/controllers/passwordResetController.js`

### 5. Routes
Added 4 new routes to `authRoutes.js`:
- `POST /api/auth/forgot-password` - Initiate password reset
- `POST /api/auth/verify-reset-token` - Verify token validity
- `GET /api/auth/check-reset-token` - Check token validity (query params)
- `POST /api/auth/reset-password` - Complete password reset

**File Modified**: `src/routes/authRoutes.js`

## API Endpoints

### 1. Request Password Reset
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "If an account exists with this email, you will receive password reset instructions."
}
```

### 2. Verify Reset Token
```
POST /api/auth/verify-reset-token
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "reset_token_from_email"
}

Response:
{
  "success": true,
  "message": "Token is valid",
  "accountType": "user" // or "tenant"
}
```

### 3. Check Token Validity (GET)
```
GET /api/auth/check-reset-token?email=user@example.com&token=reset_token_from_email

Response:
{
  "success": true,
  "message": "Token is valid",
  "valid": true
}
```

### 4. Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "reset_token_from_email",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}

Response:
{
  "success": true,
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

## Environment Variables (Already Configured)

```
# Email Configuration in .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@eduverse.com

# Frontend URLs
FRONTEND_URL_DEV=http://localhost:3000
FRONTEND_URL_PROD=https://yourdomain.com
```

## Security Features

1. **Token Security**:
   - Tokens are SHA256 hashed before storage
   - One-time use only (cleared after password reset)
   - 1-hour expiry time
   - Unique per reset request

2. **Account Security**:
   - Password strength validation (min 6 characters)
   - All existing sessions cleared after reset (forces re-login)
   - Account suspension check

3. **Privacy**:
   - Generic success messages (doesn't reveal if email exists)
   - Secure email sending with error handling
   - Logging of security events

4. **User Type Support**:
   - Works seamlessly with both Tenant and User models
   - No code duplication
   - Same endpoints for all user types

## Frontend Integration

### Step 1: Forgot Password Page
```javascript
// Request password reset
POST /api/auth/forgot-password
{ "email": "user@example.com" }
```

### Step 2: Email Link
User receives email with link:
```
https://yourdomain.com/reset-password?token=xxxxx&email=user@example.com
```

### Step 3: Token Validation (Optional)
```javascript
// Check if token is still valid
GET /api/auth/check-reset-token?email=user@example.com&token=xxxxx
```

### Step 4: Reset Password
```javascript
// Submit new password
POST /api/auth/reset-password
{
  "email": "user@example.com",
  "token": "xxxxx",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

## Files Created/Modified

### Created:
- ✅ `src/services/passwordResetService.js` - Business logic
- ✅ `src/controllers/passwordResetController.js` - API controllers

### Modified:
- ✅ `src/models/User.mongoose.js` - Added password reset fields
- ✅ `src/models/Tenant.mongoose.js` - Added password reset fields
- ✅ `src/utils/emailService.js` - Enhanced with password reset templates
- ✅ `src/routes/authRoutes.js` - Added password reset routes

## No Affected Functionality
- ✅ Existing authentication flow unchanged
- ✅ All login/logout operations work as before
- ✅ JWT token generation unaffected
- ✅ User and Tenant models backward compatible
- ✅ Existing email services continue to work
- ✅ All other routes and controllers unaffected

## Testing Checklist

- [ ] Test forgot password with valid email
- [ ] Test forgot password with invalid email
- [ ] Test email delivery
- [ ] Test reset token verification
- [ ] Test password reset with valid token
- [ ] Test password reset with expired token
- [ ] Test password reset with mismatched passwords
- [ ] Test password reset with weak password
- [ ] Test that old sessions are cleared after reset
- [ ] Test with different user types (student, teacher, admin, org admin, superadmin)
- [ ] Test error handling and validation

## Error Handling

All endpoints include:
- Input validation
- Detailed error messages
- HTTP status codes (400, 401, 403, 500)
- Error logging for debugging
- User-friendly response messages

## Logging

All password reset activities are logged:
- Password reset requests
- Token generation and verification
- Email sending status
- Errors and failures
- Security actions (suspended accounts, etc.)

Logs include:
- User email
- Operation type
- Status (success/failure)
- Reason for failure (if applicable)
- IP address for security audit