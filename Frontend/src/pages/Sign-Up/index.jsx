import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import logo from "../../assets/imgs/logo.png";

import {
  useGetOrganizationListQuery,
  useSignupMutation,
} from "../../redux/Apis/authApi";
import { setCredentials } from "../../redux";
import { getApiErrorMessage } from "../../utils/apiError";
import signupCommunityImage from "../../assets/imgs/signup-community.jpg";

function SignUp() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const IconEye = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const IconEyeOff = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);


  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const { data: orgListData } = useGetOrganizationListQuery();
  const [signup] = useSignupMutation();

  const [Data, setData] = useState({
    userType: "",
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    phoneNo: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    organizationCode: "",
  });

  const [Loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const checkExistingSession = async () => {
      if (isAuthenticated && user) {
        const userType = user.userType?.toLowerCase();
        const dashboardMap = {
          superadmin: "/superadmin/dashboard",
          admin: "/admin/dashboard",
          teacher: "/teacher/dashboard",
          student: "/student/dashboard",
        };
        const redirectPath = dashboardMap[userType] || "/";
        navigate(redirectPath, { replace: true });
        return;
      }

      try {
        const storedAuth = sessionStorage.getItem("authUser");
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          const { user: storedUser, accessToken, refreshToken } = parsedAuth;

          if (storedUser && accessToken) {
            dispatch(
              setCredentials({
                user: storedUser,
                accessToken,
                refreshToken,
              }),
            );

            const userType = storedUser.userType?.toLowerCase();
            const dashboardMap = {
              superadmin: "/superadmin/dashboard",
              admin: "/admin/dashboard",
              teacher: "/teacher/dashboard",
              student: "/student/dashboard",
            };
            const redirectPath = dashboardMap[userType] || "/";
            navigate(redirectPath, { replace: true });
          }
        }
      } catch (error) {
        console.error("Error checking existing session:", error);
        sessionStorage.removeItem("authUser");
      }
    };

    checkExistingSession();
  }, [isAuthenticated, user, navigate, dispatch]);

  const calculatePasswordStrength = (password) => {
    if (!password) return 0;

    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password),
    };

    Object.values(checks).forEach((check) => {
      if (check) strength += 20;
    });

    return strength;
  };

  const getPasswordStrengthLabel = (strength) => {
    if (strength === 0) return { label: "", color: "" };
    if (strength < 40) return { label: "Weak", color: "text-red-500" };
    if (strength < 60) return { label: "Fair", color: "text-orange-500" };
    if (strength < 80) return { label: "Good", color: "text-yellow-500" };
    return { label: "Strong", color: "text-green-500" };
  };

  const getPasswordStrengthBarColor = (strength) => {
    if (strength === 0) return "bg-slate-200";
    if (strength < 40) return "bg-red-500";
    if (strength < 60) return "bg-orange-500";
    if (strength < 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newData = {
      ...Data,
      [name]: type === "checkbox" ? checked : value,
    };

    setData(newData);

    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!Data.userType) {
      toast.error("Please select your role", {
        position: "top-center",
        duration: 4000,
      });
      return;
    }

    if (!Data.firstName || !Data.lastName) {
      toast.error("First name and last name are required", {
        position: "top-center",
        duration: 4000,
      });
      return;
    }

    if (!Data.age || Data.age < 15) {
      toast.error("Age must be 15 or greater", {
        position: "top-center",
        duration: 4000,
      });
      return;
    }

    if (!Data.gender) {
      toast.error("Please select your gender", {
        position: "top-center",
        duration: 4000,
      });
      return;
    }

    if (!Data.phoneNo || !/^\d{10}$/.test(Data.phoneNo)) {
      toast.error("Phone number must be exactly 10 digits", {
        position: "top-center",
        duration: 4000,
      });
      return;
    }

    if (!Data.email || !Data.email.includes("@")) {
      toast.error("Please enter a valid email address", {
        position: "top-center",
        duration: 4000,
      });
      return;
    }

    if (passwordStrength < 80) {
      toast.error(
        "Password must be strong (80% strength required: 8+ chars, uppercase, lowercase, digit, special char)",
        {
          position: "top-center",
          duration: 4000,
        },
      );
      return;
    }

    if (Data.password !== Data.confirmPassword) {
      toast.error("Passwords do not match", {
        position: "top-center",
        duration: 4000,
      });
      return;
    }

    if (!Data.agreeTerms) {
      toast.error("Please agree to the terms and conditions", {
        position: "top-center",
        duration: 4000,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await signup({
        userType: Data.userType,
        firstName: Data.firstName,
        lastName: Data.lastName,
        age: parseInt(Data.age, 10),
        gender: Data.gender,
        phoneNo: Data.phoneNo,
        email: Data.email,
        password: Data.password,
        confirmPassword: Data.confirmPassword,
        agreeTerms: Data.agreeTerms,
        organizationCode: Data.organizationCode,
      }).unwrap();

      if (response?.success) {
        toast.success("Account Created Successfully", {
          position: "top-center",
          duration: 4000,
        });

        setData({
          userType: "",
          firstName: "",
          lastName: "",
          age: "",
          gender: "",
          phoneNo: "",
          email: "",
          password: "",
          confirmPassword: "",
          agreeTerms: false,
          organizationCode: "",
        });

        setPasswordStrength(0);
        setShowPassword(false);
        setShowConfirmPassword(false);
        setLoading(false);

        setTimeout(() => {
          window.location.href = "/Login";
        }, 2000);
      }
    } catch (error) {
      setLoading(false);

      let errorMessage = getApiErrorMessage(
        error,
        "Sign up failed. Please try again.",
      );

      if (error?.status === 400) {
        if (error?.data?.errors && Array.isArray(error.data.errors)) {
          const validationErrors = error.data.errors
            .map((err) => err.message)
            .join(", ");
          errorMessage = `Validation Error: ${validationErrors}`;
        } else {
          errorMessage =
            error?.data?.message || "Invalid request. Please check your input.";
        }
      } else if (error?.status === 403) {
        errorMessage = "Access denied. You cannot register with this role.";
      } else if (error?.status === 409) {
        errorMessage = "Email already exists. Please use a different email.";
      } else if (error?.status === 429) {
        errorMessage = "Too many signup attempts. Please try again later.";
      }

      toast.error(errorMessage, {
        position: "top-center",
        duration: 4000,
      });

      console.error("Sign Up error:", error?.data || error?.message);
    }
  };

  const inputBaseClass =
    "w-full rounded-xl border border-[#9A864C]/20 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-navy-charcoal/80 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-primary dark:focus:ring-primary/30";

  const selectBaseClass = `${inputBaseClass} appearance-none pr-10`;

  const renderPasswordToggle = (isVisible, onToggle, label) => (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-[#9A864C] transition-colors hover:bg-[#9A864C]/10 dark:hover:bg-white/10"
      aria-label={label}
    >
        {isVisible
                ? <IconEyeOff className="w-5 h-5" />
                 : <IconEye className="w-5 h-5" />
                    }
    </button>
  );

  return (
    <section className="min-h-screen bg-background-light text-slate-900 transition-colors duration-300 dark:bg-background-dark dark:text-slate-100 select-none">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="relative hidden lg:flex lg:w-1/2 flex-col items-center justify-center overflow-hidden bg-lavender/40 px-10 py-12 dark:bg-navy-charcoal">
          <div className="absolute left-10 top-10 flex items-center gap-2 text-primary">
            <div className="relative z-10 top-[-20px]">
              <div className="flex items-center gap-4 mb-5">
                <img
                  src={logo}
                  alt="EduVerse logo"
                  className="h-14 w-14 object-contain shrink-0 drop-shadow-md"
                />
                <div className="flex flex-col">
                  <span className="text-3xl font-extrabold tracking-tight leading-none select-none">
                    <span className="text-slate-800 dark:text-white">Edu</span>
                    <span className="text-primary select-none">Verse</span>
                  </span>
                  <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 select-none">
                    Learn&nbsp;·&nbsp;Grow&nbsp;·&nbsp;Succeed
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="z-10 max-w-md text-center">
            <div className="mb-8 overflow-hidden rounded-2xl border border-white/70 bg-white p-2 shadow-2xl shadow-black/10 dark:border-white/10 dark:bg-slate-900/70">
              <img
                src={signupCommunityImage}
                alt="Education community"
                className="h-72 w-full rounded-xl object-cover"
              />
            </div>
            <h2 className="mb-3 text-4xl font-black leading-tight text-slate-900 dark:text-white">
              Empower your learning journey.
            </h2>
            <p className="text-lg font-medium text-[#9A864C] dark:text-premium-gold">
              Join a global community of learners and educators dedicated to
              excellence.
            </p>
          </div>

          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl dark:bg-premium-gold/20" />
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-lavender-light/80 blur-3xl dark:bg-slate-700/40" />
        </aside>

        <main className="flex-1 bg-background-light px-5 py-10 sm:px-8 lg:px-16 lg:py-14 dark:bg-deep-charcoal/80">
          <div className="mx-auto w-full max-w-2xl">
            <div className="mb-8 lg:hidden">
              <div className="relative z-10 top-[-10px]">
                <div className="flex items-center gap-4 mb-5">
                  <img
                    src={logo}
                    alt="EduVerse logo"
                    className="h-14 w-14 object-contain shrink-0 drop-shadow-md"
                  />
                  <div className="flex flex-col">
                    <span className="text-3xl font-extrabold tracking-tight leading-none select-none">
                      <span className="text-slate-800 dark:text-white">
                        Edu
                      </span>
                      <span className="text-primary select-none">Verse</span>
                    </span>
                    <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 select-none">
                      Learn&nbsp;·&nbsp;Grow&nbsp;·&nbsp;Succeed
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Begin Your Eduverse Journey
              </h1>
              <p className="mt-2 font-medium text-[#9A864C] dark:text-premium-gold">
                Ready to start? Fill in your details below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label
                    htmlFor="userType"
                    className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    What Is Your Role?
                  </label>
                  <div className="relative">
                    <select
                      id="userType"
                      name="userType"
                      value={Data.userType}
                      onChange={handleChange}
                      className={selectBaseClass}
                      required
                    >
                      <option value="">Select your role</option>
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9A864C] dark:text-premium-gold">
                      ▾
                    </span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="organizationCode"
                    className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    Organization Code (Optional)
                  </label>
                  <div className="relative">
                    <select
                      id="organizationCode"
                      name="organizationCode"
                      value={Data.organizationCode}
                      onChange={handleChange}
                      className={selectBaseClass}
                    >
                      <option value="">Select an organization</option>
                      {orgListData?.data?.map((org) => (
                        <option key={org._id} value={org.code}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9A864C] dark:text-premium-gold">
                      ▾
                    </span>
                  </div>
                  {Data.userType === "student" && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Leave blank to join the platform learner space.
                    </p>
                  )}
                  {Data.userType === "teacher" && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Optional: Join an existing organization or create your
                      own.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={Data.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className={inputBaseClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={Data.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className={inputBaseClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="age"
                    className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    Age
                  </label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    value={Data.age}
                    onChange={handleChange}
                    placeholder="18"
                    className={inputBaseClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="gender"
                    className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      id="gender"
                      name="gender"
                      value={Data.gender}
                      onChange={handleChange}
                      className={selectBaseClass}
                    >
                      <option value="" disabled>
                        Select gender
                      </option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9A864C] dark:text-premium-gold">
                      ▾
                    </span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="phoneNo"
                    className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phoneNo"
                    name="phoneNo"
                    type="tel"
                    value={Data.phoneNo}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className={inputBaseClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={Data.email}
                    onChange={handleChange}
                    placeholder="john.doe@example.com"
                    className={inputBaseClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={Data.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`${inputBaseClass} pr-16`}
                    />
                    {renderPasswordToggle(
                      showPassword,
                      () => setShowPassword((prev) => !prev),
                      "Toggle password visibility",
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={Data.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`${inputBaseClass} pr-16 ${
                        Data.confirmPassword &&
                        Data.password !== Data.confirmPassword
                          ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                          : Data.confirmPassword &&
                              Data.password === Data.confirmPassword
                            ? "border-green-400 focus:border-green-500 focus:ring-green-200"
                            : ""
                      }`}
                    />
                    {renderPasswordToggle(
                      showConfirmPassword,
                      () => setShowConfirmPassword((prev) => !prev),
                      "Toggle confirm password visibility",
                    )}
                  </div>
                </div>
              </div>

              {Data.password && (
                <div className="rounded-xl border border-[#9A864C]/15 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
                  <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className={`h-full transition-all duration-300 ${getPasswordStrengthBarColor(passwordStrength)}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>

                  <p
                    className={`text-xs font-semibold ${getPasswordStrengthLabel(passwordStrength).color}`}
                  >
                    Password Strength:{" "}
                    {getPasswordStrengthLabel(passwordStrength).label}
                  </p>

                  <ul className="mt-2 grid grid-cols-1 gap-1 text-xs text-slate-600 dark:text-slate-400 sm:grid-cols-2">
                    <li
                      className={
                        Data.password.length >= 8 ? "text-green-600" : ""
                      }
                    >
                      8+ characters
                    </li>
                    <li
                      className={
                        /[A-Z]/.test(Data.password) ? "text-green-600" : ""
                      }
                    >
                      Uppercase letter
                    </li>
                    <li
                      className={
                        /[a-z]/.test(Data.password) ? "text-green-600" : ""
                      }
                    >
                      Lowercase letter
                    </li>
                    <li
                      className={
                        /\d/.test(Data.password) ? "text-green-600" : ""
                      }
                    >
                      Number
                    </li>
                    <li
                      className={`sm:col-span-2 ${
                        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(
                          Data.password,
                        )
                          ? "text-green-600"
                          : ""
                      }`}
                    >
                      Special character (!@#$%^&*)
                    </li>
                  </ul>
                </div>
              )}

              {Data.confirmPassword && (
                <p
                  className={`text-xs font-semibold ${
                    Data.password === Data.confirmPassword
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {Data.password === Data.confirmPassword
                    ? "Passwords match"
                    : "Passwords do not match"}
                </p>
              )}

              <div className="flex items-start gap-3 pt-1">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={Data.agreeTerms}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-[#9A864C]/30 text-primary focus:ring-primary accent-primary focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900/80 dark:focus:ring-primary/30 dark:accent-primary "
                />
                <label htmlFor="agreeTerms" className="text-sm text-slate-600 dark:text-slate-300">
                  I agree to the
                  <button
                    type="button"
                    className="ml-1 font-semibold text-[#9A864C] underline dark:text-premium-gold"
                  >
                    Terms of Service
                  </button>
                  <span className="mx-1">and</span>
                  <button
                    type="button"
                    className="font-semibold text-[#9A864C] underline dark:text-premium-gold"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>

              <button
                type="submit"
                disabled={Loading}
                aria-busy={Loading}
                className={`w-full rounded-xl bg-primary py-3.5 text-base font-extrabold text-slate-900 shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary/90 ${
                  Loading
                    ? "cursor-not-allowed opacity-80"
                    : "hover:-translate-y-0.5"
                }`}
              >
                {Loading ? "Signing up..." : "Sign Up"}
              </button>

              <p className="text-center text-sm font-medium text-slate-600 dark:text-slate-300">
                Already have an account?
                <Link
                  to="/Login"
                  className="ml-1 font-bold text-[#9A864C] hover:underline dark:text-premium-gold"
                >
                  Log In
                </Link>
              </p>

              <div className="rounded-xl border border-[#9A864C]/15 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-900/70">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Want to register your organization?
                </p>
                <Link
                  to="/register-organization"
                  className="mt-1 inline-flex items-center text-sm font-bold text-[#9A864C] hover:underline dark:text-premium-gold"
                >
                  Register as Organization Owner
                </Link>
              </div>
            </form>
          </div>
        </main>
      </div>
    </section>
  );
}

export default SignUp;
