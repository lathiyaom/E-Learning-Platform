import { useState } from "react";
import { Button } from "../../components/Button";
import { Link, useNavigate } from "react-router-dom";
import { Building, Shield, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import API from "../../utils/axiosintence";
import { toast } from "react-toastify";

function OrganizationRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [data, setData] = useState({
    name: "",
    phoneNo: "",
    OrgOwnerName: "",
    OrgOwnerEmail: "",
    OrgOwnerPhone: "",
    email: "",
    password: "",
    ConformPassword: "",
    agreeTerms: false,
  });

  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
    Object.values(checks).forEach((check) => {
      if (check) strength += 20;
    });
    return strength;
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength === 0) return "bg-gray-200";
    if (strength < 40) return "bg-red-500";
    if (strength < 60) return "bg-orange-500";
    if (strength < 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthLabel = (strength) => {
    if (strength === 0) return { label: "", color: "" };
    if (strength < 40) return { label: "Weak", color: "text-red-500" };
    if (strength < 60) return { label: "Fair", color: "text-orange-500" };
    if (strength < 80) return { label: "Good", color: "text-yellow-500" };
    return { label: "Strong", color: "text-green-500" };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newData = {
      ...data,
      [name]: type === "checkbox" ? checked : value,
    };
    setData(newData);

    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (passwordStrength < 80) {
      toast.error("Password must be strong (8+ chars, uppercase, lowercase, digit, special char)", {
        position: "top-center",
        duration: 4000,
      });
      return;
    }

    if (data.password !== data.ConformPassword) {
      toast.error("Passwords do not match", {
        position: "top-center",
        duration: 4000,
      });
      return;
    }

    if (!data.agreeTerms) {
      toast.error("Please agree to the terms and conditions", {
        position: "top-center",
        duration: 4000,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/Tenant/Register", {
        name: data.name,
        phoneNo: data.phoneNo,
        OrgOwnerName: data.OrgOwnerName,
        OrgOwnerEmail: data.OrgOwnerEmail,
        OrgOwnerPhone: data.OrgOwnerPhone,
        email: data.email,
        password: data.password,
        ConformPassword: data.ConformPassword,
        agreeTerms: data.agreeTerms,
      });

      if (response.data.success) {
        toast.success("Organization registered successfully!", {
          position: "top-center",
          duration: 4000,
        });

        // Reset form
        setData({
          name: "",
          phoneNo: "",
          OrgOwnerName: "",
          OrgOwnerEmail: "",
          OrgOwnerPhone: "",
          email: "",
          password: "",
          ConformPassword: "",
          agreeTerms: false,
        });
        setPasswordStrength(0);

        setTimeout(() => {
          navigate("/Login");
        }, 2000);
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error.response?.data?.message || "Registration failed. Please try again.",
        {
          position: "top-center",
          duration: 4000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-4">
            <Building className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 font-serif tracking-tight">
            Register Your Organization
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600 font-light">
            Create an admin account to manage your institution
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">First Registration = SuperAdmin</p>
              <p>
                The first organization registered becomes the platform SuperAdmin. 
                Subsequent registrations require SuperAdmin approval and become regular Admins.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Organization Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Building className="h-5 w-5 text-purple-600" />
                Organization Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={data.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="ABC University"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Phone *
                  </label>
                  <input
                    type="tel"
                    name="phoneNo"
                    value={data.phoneNo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="1234567890"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Owner Details */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Organization Owner Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    name="OrgOwnerName"
                    value={data.OrgOwnerName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Email *
                  </label>
                  <input
                    type="email"
                    name="OrgOwnerEmail"
                    value={data.OrgOwnerEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="john@abc.edu"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Phone *
                  </label>
                  <input
                    type="tel"
                    name="OrgOwnerPhone"
                    value={data.OrgOwnerPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="9876543210"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Login Credentials */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Login Credentials
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Login Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={data.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="admin@abc.edu"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This email will be used to login to the admin panel
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={data.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter strong password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {data.password && (
                  <div className="mt-3 space-y-2">
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    <p className={`text-xs font-semibold ${getPasswordStrengthLabel(passwordStrength).color}`}>
                      Password Strength: {getPasswordStrengthLabel(passwordStrength).label}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div className={`flex items-center gap-1 ${data.password.length >= 8 ? 'text-green-600' : ''}`}>
                        {data.password.length >= 8 ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        8+ characters
                      </div>
                      <div className={`flex items-center gap-1 ${/[A-Z]/.test(data.password) ? 'text-green-600' : ''}`}>
                        {/[A-Z]/.test(data.password) ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        Uppercase
                      </div>
                      <div className={`flex items-center gap-1 ${/[a-z]/.test(data.password) ? 'text-green-600' : ''}`}>
                        {/[a-z]/.test(data.password) ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        Lowercase
                      </div>
                      <div className={`flex items-center gap-1 ${/\d/.test(data.password) ? 'text-green-600' : ''}`}>
                        {/\d/.test(data.password) ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        Number
                      </div>
                      <div className={`flex items-center gap-1 col-span-2 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(data.password) ? 'text-green-600' : ''}`}>
                        {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(data.password) ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        Special character
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="ConformPassword"
                    value={data.ConformPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      data.ConformPassword && data.password !== data.ConformPassword
                        ? 'border-red-500'
                        : data.ConformPassword && data.password === data.ConformPassword
                        ? 'border-green-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="Re-enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {data.ConformPassword && (
                  <p className={`text-xs mt-2 font-semibold ${
                    data.password === data.ConformPassword ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {data.password === data.ConformPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={data.agreeTerms}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-1"
                required
              />
              <label className="ml-2 text-sm text-gray-600">
                I agree to the Terms of Service and Privacy Policy, and confirm that all information provided is accurate.
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 
                hover:from-purple-700 hover:to-blue-700 text-white py-3 px-6 
                rounded-lg font-medium transition-all duration-200 shadow-lg 
                hover:shadow-xl flex items-center justify-center gap-2
                ${loading ? "opacity-80 cursor-not-allowed" : "hover:scale-[1.02]"}`}
            >
              {loading ? (
                <>
                  <span>Registering Organization</span>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </>
              ) : (
                <>
                  <Building className="h-5 w-5" />
                  Register Organization
                </>
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-gray-100 space-y-3">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/Login"
                  className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
                >
                  Login here
                </Link>
              </p>
              
              {/* Regular User Signup Link */}
              <div className="pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-2">
                  Are you a student or teacher?
                </p>
                <Link
                  to="/Sign-Up"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Register as Student/Teacher
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default OrganizationRegister;
