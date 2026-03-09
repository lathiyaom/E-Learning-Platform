import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import API from "../../utils/axiosintence";
import { ErrorToster, SuccessToster } from "../../components/toster";
import { getApiErrorMessage } from "../../utils/apiError";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const decodedEmail = useMemo(() => email, [email]);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const tokenRegex = /^[a-fA-F0-9]{64}$/;

  const getPasswordError = () => {
    if (!newPasswordTouched) return "";
    if (!newPassword) return "New password is required";
    if (newPassword.length < 6) return "Password must be at least 6 characters";
    if (newPassword.length > 64) return "Password cannot exceed 64 characters";
    return "";
  };

  const getConfirmPasswordError = () => {
    if (!confirmPasswordTouched) return "";
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== newPassword) return "Passwords do not match";
    return "";
  };

  const passwordError = getPasswordError();
  const confirmPasswordError = getConfirmPasswordError();
  const isFormValid = !passwordError && !confirmPasswordError && !!newPassword && !!confirmPassword;

  useEffect(() => {
    const validateToken = async () => {
      if (!token || !decodedEmail) {
        setStatusMessage("Invalid reset link. Please request a new password reset email.");
        setIsTokenValid(false);
        setIsCheckingToken(false);
        return;
      }

      if (!emailRegex.test(decodedEmail)) {
        setStatusMessage("Invalid email in reset link. Please request a new reset email.");
        setIsTokenValid(false);
        setIsCheckingToken(false);
        return;
      }

      if (!tokenRegex.test(token)) {
        setStatusMessage("Invalid token in reset link. Please request a new reset email.");
        setIsTokenValid(false);
        setIsCheckingToken(false);
        return;
      }

      try {
        setIsCheckingToken(true);
        const { data } = await API.get("/Auth/check-reset-token", {
          params: { email: decodedEmail, token },
        });

        if (data?.valid) {
          setIsTokenValid(true);
          setStatusMessage("");
        } else {
          setIsTokenValid(false);
          setStatusMessage(data?.message || "This reset link is invalid or expired.");
        }
      } catch (error) {
        setIsTokenValid(false);
        setStatusMessage(getApiErrorMessage(error, "Unable to verify reset link."));
      } finally {
        setIsCheckingToken(false);
      }
    };

    validateToken();
  }, [token, decodedEmail]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setNewPasswordTouched(true);
    setConfirmPasswordTouched(true);

    if (!newPassword || !confirmPassword) {
      ErrorToster("Please fill all password fields", 3000, "top-right");
      return;
    }

    if (newPassword !== confirmPassword) {
      ErrorToster("Passwords do not match", 3000, "top-right");
      return;
    }

    if (newPassword.length < 6) {
      ErrorToster("Password must be at least 6 characters long", 3000, "top-right");
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await API.post("/Auth/reset-password", {
        email: decodedEmail,
        token,
        newPassword,
        confirmPassword,
      });

      if (data?.success) {
        SuccessToster(data?.message || "Password reset successful", 3500, "top-right");
        setTimeout(() => navigate("/Login"), 1500);
      } else {
        ErrorToster(data?.message || "Could not reset password", 4000, "top-right");
      }
    } catch (error) {
      ErrorToster(getApiErrorMessage(error, "Failed to reset password"), 4000, "top-right");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-gray-800 font-serif tracking-tight">Reset Password</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Set a new password for <span className="font-semibold">{decodedEmail || "your account"}</span>
        </p>

        {isCheckingToken ? (
          <div className="mt-6 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            Verifying your reset link...
          </div>
        ) : null}

        {!isCheckingToken && !isTokenValid ? (
          <div className="mt-6">
            <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {statusMessage}
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                to="/forgot-password"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Request New Link
              </Link>
              <Link
                to="/Login"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Go to Login
              </Link>
            </div>
          </div>
        ) : null}

        {!isCheckingToken && isTokenValid ? (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                onBlur={() => setNewPasswordTouched(true)}
                placeholder="Enter new password"
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  newPasswordTouched && passwordError ? "border-red-400" : "border-gray-300"
                }`}
                required
              />
                {newPasswordTouched && passwordError ? (
                  <p className="mt-2 text-xs text-red-600">{passwordError}</p>
                ) : null}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                onBlur={() => setConfirmPasswordTouched(true)}
                placeholder="Confirm new password"
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  confirmPasswordTouched && confirmPasswordError ? "border-red-400" : "border-gray-300"
                }`}
                required
              />
              {confirmPasswordTouched && confirmPasswordError ? (
                <p className="mt-2 text-xs text-red-600">{confirmPasswordError}</p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${
                isSubmitting || !isFormValid ? "opacity-80 cursor-not-allowed" : "hover:scale-[1.02]"
              }`}
            >
              {isSubmitting ? "Updating Password..." : "Reset Password"}
            </button>
          </form>
        ) : null}
      </div>
    </section>
  );
}

export default ResetPassword;
