import React, { useState, useEffect } from "react";
import { Button } from "../../components/Button";
import ilus from "../../assets/imgs/ilustrater.png";

import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation, setCredentials } from "../../redux";
import { SuccessToster, ErrorToster } from "../../components/toster";
import { getApiErrorMessage } from "../../utils/apiError";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get auth state from Redux
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [login, { isLoading }] = useLoginMutation();

  const [data, setData] = useState({
    email: "",
    password: "",
    Rememberme: false,
  });

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

      // Check localStorage for persisted auth
      try {
        const storedAuth = localStorage.getItem("authUser");
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
            console.log("✅ Session restored from localStorage, redirecting to:", redirectPath);
            navigate(redirectPath, { replace: true });
          }
        }
      } catch (error) {
        console.error("Error checking existing session:", error);
        // Clear invalid localStorage data
        localStorage.removeItem("authUser");
      }
    };

    checkExistingSession();
  }, [isAuthenticated, user, navigate, dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handelsubmit = async (e) => {
    e.preventDefault();

    if (!data.email || !data.password) {
      ErrorToster(
        "All Fields Are Necessary",
        3000,
        "top-right",
        true,
        false,
        true,
        "font-bold transition-all",
      );
      return;
    }

    try {
      const response = await login({
        email: data.email,
        password: data.password,
      }).unwrap();

      if (response.success) {
        dispatch(
          setCredentials({
            user: response.data.user,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          }),
        );

        SuccessToster("Logged In Successfully", 3000);

        setData({
          email: "",
          password: "",
          Rememberme: false,
        });

        // Role-based routing using userType (case-insensitive)
        const userType = response.data.user.userType?.toLowerCase();
        let redirectPath = "/";

        switch (userType) {
          case "superadmin":
            redirectPath = "/superadmin/dashboard";
            break;
          case "admin":
            redirectPath = "/admin/dashboard";
            break;
          case "teacher":
            redirectPath = "/teacher/dashboard";
            break;
          case "student":
            redirectPath = "/student/dashboard";
            break;
          default:
            redirectPath = "/";
        }

        setTimeout(() => {
          navigate(redirectPath);
        }, 2000);
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle different types of errors
      let errorMessage = getApiErrorMessage(error, "Login failed. Please try again.");
      
      if (error?.status === 400) {
        errorMessage = error?.data?.message || "Invalid request. Please check your input.";
      } else if (error?.status === 401) {
        errorMessage = "Invalid email or password";
      } else if (error?.status === 403) {
        if (error?.data?.message?.includes("already logged in")) {
          errorMessage = "You are already logged in. Redirecting to dashboard...";
          
          // Force redirect to dashboard after showing message
          setTimeout(() => {
            // Try to get user from Redux state
            const currentUser = user;
            if (currentUser) {
              const userType = currentUser.userType?.toLowerCase();
              const dashboardMap = {
                superadmin: "/superadmin/dashboard",
                admin: "/admin/dashboard",
                teacher: "/teacher/dashboard",
                student: "/student/dashboard",
              };
              navigate(dashboardMap[userType] || "/", { replace: true });
            } else {
              // If no user in state, redirect to home
              navigate("/", { replace: true });
            }
          }, 2000);
        } else {
          errorMessage = "Access denied. Please contact support.";
        }
      } else if (error?.status === 429) {
        errorMessage = "Too many login attempts. Please try again later.";
      }

      ErrorToster(errorMessage, 4000, "top-center");
    }
  };

  return (
    <React.Fragment>
      <section
        className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 
                              flex items-center justify-center px-4 sm:px-6 lg:px-8"
      >
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-8 lg:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800 font-serif tracking-tight">
              Welcome Back
            </h1>
            <p className="mt-3 text-base sm:text-lg lg:text-xl text-gray-600 font-light">
              Sign in to your account
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 xl:gap-20">
            <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 lg:p-10">
                <form className="space-y-6" onSubmit={handelsubmit}>
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
                      value={data.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
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
                      value={data.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                                                     transition-all duration-200 font-sans text-gray-900
                                                     placeholder:text-gray-400"
                      placeholder="Enter your password"
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center font-sans">
                      <input
                        type="checkbox"
                        name="Rememberme"
                        checked={data.Rememberme}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-600">Remember me</span>
                    </label>
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 
                                                     underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    aria-busy={isLoading}
                    className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 
    hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 
    rounded-lg font-medium transition-all duration-200 shadow-lg 
    hover:shadow-xl font-sans flex items-center justify-center gap-2
    ${isLoading ? "opacity-80 cursor-not-allowed" : "hover:scale-[1.02]"}`}
                  >
                    {isLoading ? (
                      <>
                        <span className="text-sm">Logging in</span>
                        <span
                          className="w-4 h-4 border-2 border-white border-t-transparent 
        rounded-full animate-spin"
                          aria-hidden="true"
                        />
                      </>
                    ) : (
                      "Login in"
                    )}
                  </Button>

                  <div className="text-center pt-4 border-t border-gray-100 space-y-3">
                    <p className="text-sm text-gray-600 font-sans">
                      Don't have an account?{" "}
                      <Link
                        to="/Sign-Up"
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                      >
                        Create account
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

            <div className="w-full max-w-md lg:max-w-lg xl:max-w-2xl order-1 lg:order-2">
              <div className="relative">
                <img
                  src={ilus}
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

export default Login;
