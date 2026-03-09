# Frontend Integration - Step by Step

## 🎯 After API Testing is Complete

Once you've verified all API endpoints work with real emails, follow this guide to integrate with your frontend.

---

## STEP 1: Create Forgot Password Page Component

### File: `Frontend/src/pages/ForgotPassword.jsx`

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/Auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setMessage('✅ Password reset email sent! Check your inbox.');
        setEmail('');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setMessage('❌ ' + (data.message || 'Error sending reset email'));
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <h1>Forgot Password?</h1>
        <p>Enter your email and we'll send you a link to reset your password.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your-email@example.com"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || success}
            className={success ? 'success' : ''}
          >
            {loading ? 'Sending...' : success ? '✓ Email Sent' : 'Send Reset Link'}
          </button>
        </form>

        {message && (
          <div className={`message ${success ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <p className="signup-link">
          Remember your password? <a href="/login">Return to login</a>
        </p>
      </div>
    </div>
  );
}
```

### File: `Frontend/src/pages/ForgotPassword.css`

```css
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.forgot-password-box {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

.forgot-password-box h1 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.8rem;
}

.forgot-password-box p {
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

button {
  width: 100%;
  padding: 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

button:hover:not(:disabled) {
  background: #764ba2;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button.success {
  background: #4caf50;
}

.message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 5px;
  text-align: center;
  font-size: 0.9rem;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.signup-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
  font-size: 0.9rem;
}

.signup-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.signup-link a:hover {
  text-decoration: underline;
}
```

---

## STEP 2: Create Reset Password Page Component

### File: `Frontend/src/pages/ResetPassword.jsx`

```jsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './ResetPassword.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Validate token when component mounts
  useEffect(() => {
    if (!token || !email) {
      setMessage('❌ Invalid reset link. Missing token or email.');
      setValidating(false);
      return;
    }

    validateToken();
  }, [token, email]);

  const validateToken = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/Auth/check-reset-token?email=${email}&token=${token}`);
      const data = await response.json();

      if (data.valid) {
        setTokenValid(true);
        setMessage('');
      } else {
        setMessage(`❌ ${data.message || 'Invalid or expired reset link'}`);
      }
      setValidating(false);
    } catch (error) {
      setMessage('❌ Error validating reset token: ' + error.message);
      setValidating(false);
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 6) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 12;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 13;
    return Math.min(strength, 100);
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setPasswordStrength(calculatePasswordStrength(pwd));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!password) {
      setMessage('❌ Password is required');
      return;
    }

    if (password.length < 6) {
      setMessage('❌ Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('❌ Passwords do not match');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/Auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token,
          newPassword: password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setMessage('✅ ' + data.message);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setMessage('❌ ' + (data.message || 'Error resetting password'));
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength < 30) return '#e74c3c';
    if (passwordStrength < 60) return '#f39c12';
    return '#27ae60';
  };

  if (validating) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-box">
          <p className="loading">⏳ Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-box">
          <h1>Invalid Reset Link</h1>
          <p className="error-message">{message}</p>
          <p>The reset link may have expired or is invalid.</p>
          <a href="/forgot-password" className="button">Request New Link</a>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-box">
        <h1>Reset Your Password</h1>
        <p>Enter a new password for your account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
              required
              disabled={loading}
            />
            {password && (
              <div className="password-strength">
                <div 
                  className="strength-bar" 
                  style={{
                    width: `${passwordStrength}%`,
                    backgroundColor: getStrengthColor()
                  }}
                ></div>
              </div>
            )}
            <small className="password-requirements">
              ✓ At least 6 characters
              {password && password.length >= 6 ? ' ✓' : ''}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
              disabled={loading}
            />
            {confirmPassword && password !== confirmPassword && (
              <small className="error-text">⚠ Passwords don't match</small>
            )}
            {confirmPassword && password === confirmPassword && (
              <small className="success-text">✓ Passwords match</small>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading || !tokenValid}
            className={success ? 'success' : ''}
          >
            {loading ? 'Resetting...' : success ? '✓ Password Reset' : 'Reset Password'}
          </button>
        </form>

        {message && (
          <div className={`message ${success ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {success && (
          <p className="redirect-message">Redirecting to login in 3 seconds...</p>
        )}
      </div>
    </div>
  );
}
```

### File: `Frontend/src/pages/ResetPassword.css`

```css
.reset-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.reset-password-box {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

.reset-password-box h1 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.8rem;
}

.reset-password-box p {
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.loading {
  text-align: center;
  color: #667eea;
  font-size: 1rem;
}

.error-message {
  color: #e74c3c;
  font-weight: 600;
  margin: 1rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
  font-size: 0.95rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.password-strength {
  margin-top: 0.5rem;
  height: 4px;
  background: #eee;
  border-radius: 2px;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  transition: width 0.3s, background-color 0.3s;
}

.password-requirements {
  display: inline-block;
  margin-top: 0.3rem;
  color: #666;
  font-size: 0.8rem;
}

.error-text {
  color: #e74c3c;
  font-size: 0.8rem;
}

.success-text {
  color: #27ae60;
  font-size: 0.8rem;
}

button {
  width: 100%;
  padding: 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
}

button:hover:not(:disabled) {
  background: #764ba2;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button.success {
  background: #27ae60;
}

.message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 5px;
  text-align: center;
  font-size: 0.9rem;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.redirect-message {
  text-align: center;
  margin-top: 1rem;
  color: #27ae60;
  font-size: 0.9rem;
}

.button {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  text-align: center;
  transition: all 0.3s;
}

.button:hover {
  background: #764ba2;
}
```

---

## STEP 3: Add Routes to Your App

### File: `Frontend/src/App.jsx`

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
// ... other imports

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* ... other routes */}
      </Routes>
    </Router>
  );
}

export default App;
```

---

## STEP 4: Add "Forgot Password" Link to Login Page

### Update: `Frontend/src/pages/Login.jsx`

```jsx
// Add this link in your login form
<div className="forgot-password-link">
  <a href="/forgot-password">Forgot your password?</a>
</div>

// CSS
.forgot-password-link {
  text-align: right;
  margin-top: 1rem;
}

.forgot-password-link a {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.forgot-password-link a:hover {
  text-decoration: underline;
}
```

---

## STEP 5: Environment Configuration

### File: `Frontend/.env`

```env
REACT_APP_API_URL=http://localhost:5000
```

### File: `Frontend/.env.production`

```env
REACT_APP_API_URL=https://your-production-api.com
```

---

## STEP 6: Test Frontend Integration

### Complete Flow Test

1. **Start frontend**
   ```bash
   cd Frontend
   npm run dev
   ```

2. **Navigate to login page**
   - Open: http://localhost:3000/login

3. **Click "Forgot Password"**
   - Should navigate to: http://localhost:3000/forgot-password

4. **Enter test email**
   - Submit form
   - Check email for reset link

5. **Click reset link in email**
   - Should navigate to: http://localhost:3000/reset-password?token=...&email=...
   - Token should validate automatically

6. **Enter new password**
   - Fill in new password
   - Confirm password
   - Click "Reset Password"

7. **Redirect to login**
   - Should redirect automatically to: http://localhost:3000/login
   - Or manually navigate

8. **Login with new password**
   - Enter email and new password
   - Should login successfully ✅

---

## STEP 7: Environment Variables for Frontend

Make sure these are set correctly:

```
Development: http://localhost:5000
Staging: https://staging-api.com
Production: https://your-api.com
```

---

## Testing Checklist

```
Frontend Integration
☐ Forgot Password page displays
☐ Email input validates
☐ Loading state shows while sending
☐ Success message displays
☐ Redirects to login after success
☐ Error messages display
☐ Reset Password page displays
☐ Token validates automatically
☐ Password strength indicator works
☐ Confirm password validation works
☐ Password reset succeeds
☐ Confirmation message displays
☐ Redirects to login after reset
☐ Login works with new password
☐ Forgot Password link visible on login page
☐ All routes work correctly
☐ Responsive design on mobile
```

---

## Next Steps

1. ✅ Copy component code to your Frontend
2. ✅ Update routes in App.jsx
3. ✅ Add environment variables
4. ✅ Test complete flow
5. ✅ Customize styling to match your design
6. ✅ Deploy to staging
7. ✅ Final testing
8. ✅ Deploy to production

---

**Your forget password feature is now complete! 🚀**