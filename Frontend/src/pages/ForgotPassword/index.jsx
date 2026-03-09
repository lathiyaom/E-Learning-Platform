import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../../utils/axiosintence";
import { ErrorToster, SuccessToster } from "../../components/toster";
import { getApiErrorMessage } from "../../utils/apiError";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizedEmail = email.trim().toLowerCase();

  const getEmailError = () => {
    if (!emailTouched) return "";
    if (!normalizedEmail) return "Email is required";
    if (!emailRegex.test(normalizedEmail)) return "Please enter a valid email address";
    return "";
  };

  const emailError = getEmailError();
  const isFormValid = !!normalizedEmail && !emailError;

  const handleSubmit = async (event) => {
    event.preventDefault();

    setEmailTouched(true);

    if (!normalizedEmail) {
      ErrorToster("Please enter your email address", 3000, "top-right");
      return;
    }

    if (!emailRegex.test(normalizedEmail)) {
      ErrorToster("Please enter a valid email address", 3000, "top-right");
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await API.post("/Auth/forgot-password", {
        email: normalizedEmail,
      });

      if (data?.success) {
        setIsSent(true);
        SuccessToster(
          data?.message || "Reset instructions sent to your email",
          4000,
          "top-right",
        );
      } else {
        ErrorToster(data?.message || "Unable to process request", 4000, "top-right");
      }
    } catch (error) {
      ErrorToster(
        getApiErrorMessage(error, "Failed to send reset instructions"),
        4000,
        "top-right",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-gray-800 font-serif tracking-tight">Forgot Password</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Enter your account email. We will send a secure password reset link.
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => setEmailTouched(true)}
              placeholder="Enter your email"
              className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                emailTouched && emailError ? "border-red-400" : "border-gray-300"
              }`}
              required
            />
            {emailTouched && emailError ? (
              <p className="mt-2 text-xs text-red-600">{emailError}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${
              isSubmitting || !isFormValid ? "opacity-80 cursor-not-allowed" : "hover:scale-[1.02]"
            }`}
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>

          {isSent ? (
            <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
              Check your email inbox and click the reset link.
            </p>
          ) : null}

          <div className="text-center pt-2">
            <Link
              to="/Login"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}

export default ForgotPassword;
