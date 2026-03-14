import { useState } from "react";
import { Button } from "../../components/Button";
import { Link, useNavigate } from "react-router-dom";
import {
  Building,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Sparkles,
  KeyRound,
  UserCog,
  Presentation,
  GraduationCap,
  School,
  Info,
  Building2,
  UserPlus,
} from "lucide-react";
import API from "../../utils/axiosintence";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../../utils/apiError";

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
      toast.error(
        "Password must be strong (8+ chars, uppercase, lowercase, digit, special char)",
        {
          position: "top-center",
          duration: 4000,
        },
      );
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
        getApiErrorMessage(error, "Registration failed. Please try again."),
        {
          position: "top-center",
          duration: 4000,
        },
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-[8px] border border-slate-200 bg-slate-50/50 focus:border-[#B08D57] focus:ring focus:ring-[#B08D57]/30 text-sm py-3 px-4 transition-all outline-none dark:border-slate-700 dark:bg-navy-charcoal/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-[#B08D57] dark:focus:ring-[#B08D57]/30";

  const sectionTitleClass =
    "font-bold text-slate-800 text-base uppercase tracking-widest font-heading dark:text-slate-200";

  return (
    <section className="min-h-screen bg-[#F9FAFB] text-slate-900 transition-colors duration-300 dark:bg-[#1a1d2b] dark:text-slate-100 select-none">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="relative hidden md:flex md:w-[40%] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#F4E9D8] to-[#B08D57] dark:from-[#1A1B23] dark:to-[#0F0F12] p-12">
          <div className="absolute top-0 left-0 w-80 h-80 bg-white/20 dark:bg-[#ecb613]/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/10 dark:bg-[#ecb613]/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

          <div className="relative z-10 w-full max-w-lg">
            <div className="mb-12 relative flex justify-center">
              <div className="flex flex-col gap-6 relative z-10 w-full sm:w-[320px]">
                <svg
                  className="absolute inset-0 w-full h-full -z-10 pointer-events-none opacity-40 dark:opacity-20"
                  viewBox="0 0 450 300 "
                >
                  <path
                    d="M110 7 Q 200 150 280 120 120 "
                    fill="none"
                    stroke="white"
                    strokeDasharray="6 4"
                    strokeWidth="2"
                  />
                  <path
                    d="M280 140 Q 200 200 120 260  "
                    fill="none"
                    stroke="white"
                    strokeDasharray="6 4"
                    strokeWidth="2"
                  />
                  <circle
                    cx="200"
                    cy="150"
                    fill="white"
                    fillOpacity="0.1"
                    r="40"
                  />
                </svg>

                <div className="flex justify-start transform -rotate-6 mb-10  ">
                  <div className="bg-white/40 dark:bg-white/10 backdrop-blur-sm border border-white/40 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-4 w-64 glass-card card-float-x">
                    <div className="w-12 h-12 rounded-full bg-[#B08D57] flex items-center justify-center text-white shadow-inner">
                      <UserCog className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="h-2 w-24 bg-slate-800/20 dark:bg-white/20 rounded mb-2" />
                      <div className="h-2 w-16 bg-slate-800/10 dark:bg-white/10 rounded" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end transform rotate-3 -mt-4 mb-4">
                  <div className="bg-white/40 dark:bg-white/10 backdrop-blur-sm border border-white/40 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-4 w-64 glass-card card-float-x">
                    <div className="w-12 h-12 rounded-full bg-[#ecb613] flex items-center justify-center text-white shadow-inner">
                      <Presentation className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="h-2 w-20 bg-slate-800/20 dark:bg-white/20 rounded mb-2" />
                      <div className="h-2 w-28 bg-slate-800/10 dark:bg-white/10 rounded" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center transform -rotate-10 -mt-6  ">
                  <div className="bg-white/40 dark:bg-white/10 backdrop-blur-sm border border-white/40 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-4 w-64 glass-card card-float-x">
                    <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-[#B08D57] shadow-inner">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="h-2 w-24 bg-slate-800/20 dark:bg-white/20 rounded mb-2" />
                      <div className="h-2 w-20 bg-slate-800/10 dark:bg-white/10 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-4xl lg:text-5xl font-black text-slate-800 dark:text-white mb-6 leading-tight font-heading">
                Empower Your Institution's Future
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-lg max-w-sm mx-auto font-medium">
                Welcome to Eduverse. A warmer, smarter way to connect students,
                teachers, and administrators in one unified ecosystem.
              </p>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 overflow-y-auto bg-[#F9FAFB] dark:bg-[#0F0F12]/80">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 text-[#B08D57] rounded-2xl mb-6 bg-[#F4E9D8] dark:bg-[#ecb613]/15 dark:text-[#B08D57]">
                <School className="w-8 h-8" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
                Join the Eduverse Community
              </h1>
              <p className="text-slate-500 dark:text-slate-300 mt-3 text-lg">
                Create an admin account to manage your institution
              </p>
            </div>

            <div className="bg-white/60 dark:bg-[#1A1B23]/80 border border-slate-100 dark:border-slate-700 rounded-[24px] p-5 mb-10 flex gap-4 items-center">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[#ecb613]/10 dark:bg-[#ecb613]/15">
                <Info className="w-5 h-5 text-[#B08D57]" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug select-none">
                <span className="font-bold text-slate-800 dark:text-white">
                  Note:
                </span>{" "}
                Use this form to create organization administrator accounts
                responsible for managing their respective organizations on the
                platform.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1A1B23]/80 rounded-[8px] p-8 sm:p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04),_0_5px_15px_-5px_rgba(0,0,0,0.03)] border border-white dark:border-slate-700">
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#ecb613]/10 dark:bg-[#ecb613]/15">
                      <Building2 className="w-4 h-4 text-[#B08D57]" />
                    </span>
                    <h3 className={sectionTitleClass}>Organization Details</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Organization Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={data.name}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="ABC University"
                        required
                      />
                    </div>
                    <div className="group">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Organization Phone *
                      </label>
                      <input
                        type="tel"
                        name="phoneNo"
                        value={data.phoneNo}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="1234567890"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F4E9D8] dark:bg-[#ecb613]/15">
                      <UserPlus className="w-4 h-4 text-[#B08D57]" />
                    </span>
                    <h3 className={sectionTitleClass}>
                      Organization Owner Details
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div className="group">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Owner Name *
                      </label>
                      <input
                        type="text"
                        name="OrgOwnerName"
                        value={data.OrgOwnerName}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="group">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Owner Email *
                        </label>
                        <input
                          type="email"
                          name="OrgOwnerEmail"
                          value={data.OrgOwnerEmail}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="owner@example.com"
                          required
                        />
                      </div>
                      <div className="group">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Owner Phone *
                        </label>
                        <input
                          type="tel"
                          name="OrgOwnerPhone"
                          value={data.OrgOwnerPhone}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="1234567890"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#ecb613]/15 flex items-center justify-center">
                      <KeyRound className="w-4 h-4 text-slate-600 dark:text-[#B08D57]" />
                    </span>
                    <h3 className={sectionTitleClass}>Login Credentials</h3>
                  </div>

                  <div className="space-y-6">
                    <div className="group">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Login Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="admin@university.edu"
                        required
                      />
                      <p className="text-xs text-slate-400 mt-2 italic font-medium">
                        Used exclusively for admin panel authentication.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="relative group">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}
                            onChange={handleChange}
                            className={`${inputClass} pr-12`}
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-[#B08D57] transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="ConformPassword"
                            value={data.ConformPassword}
                            onChange={handleChange}
                            className={`${inputClass} pr-12 ${data.ConformPassword && data.password !== data.ConformPassword ? "border-red-400 focus:border-red-500 focus:ring-red-200" : data.ConformPassword && data.password === data.ConformPassword ? "border-green-400 focus:border-green-500 focus:ring-green-200" : ""}`}
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-[#B08D57] transition-colors"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {data.password && (
                    <div className="mt-4 space-y-2 rounded-xl border border-[#B08D57]/15 bg-[#f8f8f6] p-4 dark:border-slate-700 dark:bg-slate-900/70">
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                      <p
                        className={`text-xs font-semibold ${getPasswordStrengthLabel(passwordStrength).color}`}
                      >
                        Password Strength:{" "}
                        {getPasswordStrengthLabel(passwordStrength).label}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <div
                          className={`flex items-center gap-1 ${data.password.length >= 8 ? "text-green-600" : ""}`}
                        >
                          {data.password.length >= 8 ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          8+ characters
                        </div>
                        <div
                          className={`flex items-center gap-1 ${/[A-Z]/.test(data.password) ? "text-green-600" : ""}`}
                        >
                          {/[A-Z]/.test(data.password) ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          Uppercase
                        </div>
                        <div
                          className={`flex items-center gap-1 ${/[a-z]/.test(data.password) ? "text-green-600" : ""}`}
                        >
                          {/[a-z]/.test(data.password) ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          Lowercase
                        </div>
                        <div
                          className={`flex items-center gap-1 ${/\d/.test(data.password) ? "text-green-600" : ""}`}
                        >
                          {/\d/.test(data.password) ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          Number
                        </div>
                        <div
                          className={`col-span-2 flex items-center gap-1 ${/[!@#$%^&*()_+\-=\[\]{};':"\|,.<>\/?]/.test(data.password) ? "text-green-600" : ""}`}
                        >
                          {/[!@#$%^&*()_+\-=\[\]{};':"\|,.<>\/?]/.test(
                            data.password,
                          ) ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          Special character
                        </div>
                      </div>
                    </div>
                  )}

                  {data.ConformPassword && (
                    <p
                      className={`mt-2 text-xs font-semibold ${data.password === data.ConformPassword ? "text-green-600" : "text-red-600"}`}
                    >
                      {data.password === data.ConformPassword
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </p>
                  )}
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-start gap-3 p-1">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={data.agreeTerms}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-[#B08D57] accent-[#B08D57] focus:ring-[#B08D57] dark:border-slate-700 dark:bg-slate-900/80"
                      required
                    />
                    <label className="text-sm text-slate-600 dark:text-slate-300 leading-snug">
                      I accept the{" "}
                      <Link
                        to="/terms"
                        className="font-bold hover:underline text-[#B08D57]"
                      >
                        Terms of Service
                      </Link>{" "}
                      and have read the{" "}
                      <Link
                        to="/privacy"
                        className="font-bold hover:underline text-[#B08D57]"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-[#B08D57] text-white font-black py-4 rounded-[8px] hover:bg-[#B08D57]/90 hover:shadow-xl transition-all shadow-lg flex items-center justify-center gap-3 group ${loading ? "cursor-not-allowed opacity-80" : ""}`}
                  >
                    {loading ? (
                      <>
                        <span className="text-lg">
                          Registering Organization
                        </span>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      </>
                    ) : (
                      <>
                        <span className="text-lg">Register Organization</span>
                        <Sparkles className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-10 space-y-4 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Already have an account?{" "}
                <Link
                  to="/Login"
                  className="font-bold hover:underline text-[#B08D57]"
                >
                  Sign in
                </Link>
              </p>
              <div className="h-px bg-slate-200 dark:bg-slate-700 w-24 mx-auto"></div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Joining as a student or teacher?{" "}
                <Link
                  to="/Sign-Up"
                  className="font-bold hover:underline text-[#ecb613]"
                >
                  Create personal account
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}

export default OrganizationRegister;
