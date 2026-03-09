import React, { useState, useEffect } from "react";
import { Button } from "../../components/Button";
import ilus2 from "../../assets/imgs/ilustrator2.png";
import { Link, useNavigate } from "react-router-dom";
import { useSignupMutation } from "../../redux/Apis/authApi";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "../../redux";
import { getApiErrorMessage } from "../../utils/apiError";

function SignUp() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get auth state from Redux
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const [signup, { isLoading: signupLoading }] = useSignupMutation();
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
    organizationCode: "", // Optional organization code for teachers
  });

  const [Loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // ✅ Check if user is already logged in (even if Redux state is lost)
  useEffect(() => {
    const checkExistingSession = async () => {
      // First check Redux state
      if (isAuthenticated && user) {
        const userType = user.userType?.toLowerCase();
        const dashboardMap = {
          superadmin: "/superadmin/dashboard",
          admin: "/admin/dashboard",
          teacher: "/teacher/dashboard",
          student: "/student/dashboard",
        };
        const redirectPath = dashboardMap[userType] || "/";
        console.log("✅ User already logged in (Redux), redirecting to:", redirectPath);
        navigate(redirectPath, { replace: true });
        return;
      }

      // Check sessionStorage for persisted auth
      try {
        const storedAuth = sessionStorage.getItem("authUser");
        if (storedAuth) {
          const { user: storedUser, accessToken } = JSON.parse(storedAuth);
          if (storedUser && accessToken) {
            // Restore Redux state
            dispatch(setCredentials({ 
              user: storedUser, 
              accessToken,
              refreshToken: JSON.parse(storedAuth).refreshToken 
            }));
            
            const userType = storedUser.userType?.toLowerCase();
            const dashboardMap = {
              superadmin: "/superadmin/dashboard",
              admin: "/admin/dashboard",
              teacher: "/teacher/dashboard",
              student: "/student/dashboard",
            };
            const redirectPath = dashboardMap[userType] || "/";
            console.log("✅ Session restored from sessionStorage, redirecting to:", redirectPath);
            navigate(redirectPath, { replace: true });
          }
        }
      } catch (error) {
        console.error("Error checking existing session:", error);
        // Clear invalid sessionStorage data
        sessionStorage.removeItem("authUser");
      }
    };

    checkExistingSession();
  }, [isAuthenticated, user, navigate, dispatch]);

  // Calculate password strength
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
    
    // Count how many criteria are met
    Object.values(checks).forEach(check => {
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
    if (strength === 0) return "bg-gray-200";
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
    
    // Update password strength when password changes
    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all required fields
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
    
    // Validate password strength
    if (passwordStrength < 80) {
      toast.error("Password must be strong (80% strength required: 8+ chars, uppercase, lowercase, digit, special char)", {
        position: "top-center",
        duration: 4000,
      });
      return;
    }

    // Validate password match
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
        age: parseInt(Data.age),
        gender: Data.gender,
        phoneNo: Data.phoneNo,
        email: Data.email,
        password: Data.password,
        confirmPassword: Data.confirmPassword,
        agreeTerms: Data.agreeTerms,
        organizationCode: Data.organizationCode, // Include organization code
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
          organizationCode: "", // Reset organization code
        });
        setPasswordStrength(0);
        setLoading(false);
        setTimeout(() => {
          window.location.href = "/Login";
        }, 2000);
      }
    } catch (error) {
      setLoading(false);
      
      // Handle different types of errors
      let errorMessage = getApiErrorMessage(error, "Sign up failed. Please try again.");
      
      if (error?.status === 400) {
        if (error?.data?.errors && Array.isArray(error.data.errors)) {
          // Handle validation errors
          const validationErrors = error.data.errors.map(err => err.message).join(', ');
          errorMessage = `Validation Error: ${validationErrors}`;
        } else {
          errorMessage = error?.data?.message || "Invalid request. Please check your input.";
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

  return (
    <React.Fragment>
      <section
        className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 
        flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-12"
      >
        <div className="w-full max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 lg:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800 font-serif tracking-tight">
              Create an Account
            </h1>
            <p className="mt-3 text-base sm:text-lg lg:text-xl text-gray-600 font-light">
              Register your account
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 xl:gap-20">
            {/* Form Section */}
            <div className="w-full max-w-sm lg:max-w-md xl:max-w-lg order-2">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
                <form
                  className="space-y-3 sm:space-y-4"
                  onSubmit={handleSubmit}
                >
                  <div>
                    <label
                      htmlFor="userType"
                      className="block text-sm font-medium text-gray-700 mb-2 font-sans"
                    >
                      What Is Your Role?
                    </label>
                    <select
                      id="userType"
                      name="userType"
                      value={Data.userType}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm 
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                      transition-all duration-200 font-sans text-gray-900"
                      required
                    >
                      <option value="">Select your role</option>
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </div>

                  {/* Organization Code - Optional for both student and teacher */}
                  <div>
                    <label
                      htmlFor="organizationCode"
                      className="block text-sm font-medium text-gray-700 mb-2 font-sans"
                    >
                      Organization Code (Optional)
                    </label>
                    <input
                      type="text"
                      id="organizationCode"
                      name="organizationCode"
                      value={Data.organizationCode}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm 
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                      transition-all duration-200 font-sans text-gray-900
                      placeholder:text-gray-400"
                      placeholder="Enter organization code if you have one"
                    />
                    {Data.userType === "student" && (
                      <p className="text-xs text-gray-500 mt-1">
                        If left blank, your account will be created under platform learner space.
                      </p>
                    )}
                    {Data.userType === "teacher" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Optional: Join an existing organization or create your own
                      </p>
                    )}
                  </div>

                  <div className="flex flex-row gap-3 justify-between items-center">
                    <div className="flex flex-col flex-1">
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-gray-700 mb-2 font-sans"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={Data.firstName}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm 
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                        transition-all duration-200 font-sans text-gray-900
                        placeholder:text-gray-400"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="flex flex-col flex-1">
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-gray-700 mb-2 font-sans"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={Data.lastName}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm 
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                        transition-all duration-200 font-sans text-gray-900
                        placeholder:text-gray-400"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="flex flex-row gap-3 justify-between items-center">
                    <div className="flex flex-col flex-1">
                      <label
                        htmlFor="age"
                        className="block text-sm font-medium text-gray-700 mb-2 font-sans"
                      >
                        Age
                      </label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={Data.age}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm 
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                        transition-all duration-200 font-sans text-gray-900
                        placeholder:text-gray-400"
                        placeholder="Enter your age"
                      />
                    </div>
                    <div className="flex flex-col flex-1">
                      <label
                        htmlFor="gender"
                        className="block text-sm font-medium text-gray-700 mb-2 font-sans"
                      >
                        Gender
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={Data.gender}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm 
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                        transition-all duration-200 font-sans text-gray-900
                        placeholder:text-gray-400"
                      >
                        <option value="" disabled>
                          Select your gender
                        </option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phoneNo"
                      className="block text-sm font-medium text-gray-700 mb-2 font-sans"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phoneNo"
                      name="phoneNo"
                      value={Data.phoneNo}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm 
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                      transition-all duration-200 font-sans text-gray-900
                      placeholder:text-gray-400"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2 font-sans"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={Data.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm 
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                      transition-all duration-200 font-sans text-gray-900
                      placeholder:text-gray-400"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-2 font-sans"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={Data.password}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm 
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                      transition-all duration-200 font-sans text-gray-900
                      placeholder:text-gray-400"
                      placeholder="Enter your password"
                    />
                    
                    {/* Password Strength Indicator */}
                    {Data.password && (
                      <div className="mt-3 space-y-2">
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${getPasswordStrengthBarColor(passwordStrength)}`}
                            style={{ width: `${passwordStrength}%` }}
                          ></div>
                        </div>
                        <div className="text-xs space-y-1">
                          <p className={`font-semibold ${getPasswordStrengthLabel(passwordStrength).color}`}>
                            Password Strength: {getPasswordStrengthLabel(passwordStrength).label}
                          </p>
                          <p className="text-gray-600">Password must contain:</p>
                          <ul className="grid grid-cols-2 gap-1 text-gray-600">
                            <li className={`flex items-center gap-1 ${Data.password.length >= 8 ? 'text-green-600' : ''}`}>
                              <span className={Data.password.length >= 8 ? '✓' : '○'}>
                              </span> 8+ characters
                            </li>
                            <li className={`flex items-center gap-1 ${/[A-Z]/.test(Data.password) ? 'text-green-600' : ''}`}>
                              <span className={/[A-Z]/.test(Data.password) ? '✓' : '○'}>
                              </span> Uppercase
                            </li>
                            <li className={`flex items-center gap-1 ${/[a-z]/.test(Data.password) ? 'text-green-600' : ''}`}>
                              <span className={/[a-z]/.test(Data.password) ? '✓' : '○'}>
                              </span> Lowercase
                            </li>
                            <li className={`flex items-center gap-1 ${/\d/.test(Data.password) ? 'text-green-600' : ''}`}>
                              <span className={/\d/.test(Data.password) ? '✓' : '○'}>
                              </span> Number
                            </li>
                            <li className={`flex items-center gap-1 col-span-2 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(Data.password) ? 'text-green-600' : ''}`}>
                              <span className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(Data.password) ? '✓' : '○'}>
                              </span> Special character (!@#$%^&*)
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-2 font-sans"
                    >
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={Data.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 border rounded-lg shadow-sm 
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                      transition-all duration-200 font-sans text-gray-900
                      placeholder:text-gray-400 ${
                        Data.confirmPassword && Data.password !== Data.confirmPassword
                          ? 'border-red-500 focus:ring-red-500'
                          : Data.confirmPassword && Data.password === Data.confirmPassword
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="Re-enter your password"
                    />
                    {Data.confirmPassword && (
                      <p className={`text-xs mt-2 font-semibold ${
                        Data.password === Data.confirmPassword
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {Data.password === Data.confirmPassword
                          ? '✓ Passwords match'
                          : '✗ Passwords do not match'}
                      </p>
                    )}
                  </div>

                  <div className="flex items-start text-sm">
                    <label className="flex items-start font-sans">
                      <input
                        type="checkbox"
                        name="agreeTerms"
                        checked={Data.agreeTerms}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                      />
                      <span className="ml-2 text-gray-600 leading-relaxed">
                        I agree to the
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 underline"
                        >
                          Terms of Service
                        </button>{" "}
                        and{" "}
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 underline"
                        >
                          Privacy Policy
                        </button>
                      </span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={Loading}
                    aria-busy={Loading}
                    className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 
                        hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 
                        rounded-lg font-medium transition-all duration-200 shadow-lg 
                        hover:shadow-xl font-sans flex items-center justify-center gap-2
                        ${
                          Loading
                            ? "opacity-80 cursor-not-allowed"
                            : "hover:scale-[1.02]"
                        }`}
                  >
                    {Loading ? (
                      <>
                        <span className="text-sm">Signing up</span>
                        <span
                          className="w-4 h-4 border-2 border-white border-t-transparent 
                            rounded-full animate-spin"
                          aria-hidden="true"
                        />
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  <div className="text-center pt-4 border-t border-gray-100 space-y-3">
                    <p className="text-sm text-gray-600 font-sans">
                      Already have an account?{" "}
                      <Link
                        to="/Login"
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                      >
                        Login
                      </Link>
                    </p>
                    
                    {/* Organization Registration Link */}
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600 font-sans mb-2">
                        Want to register your organization?
                      </p>
                      <Link
                        to="/register-organization"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Register as Organization Owner
                      </Link>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="w-full max-w-md lg:max-w-lg xl:max-w-2xl order-1">
              <div className="relative">
                <img
                  src={ilus2}
                  alt="Login illustration"
                  className="w-full h-auto max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto 
                  drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-200 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-purple-200 rounded-full opacity-60 animate-pulse delay-1000"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
}

export default SignUp;
