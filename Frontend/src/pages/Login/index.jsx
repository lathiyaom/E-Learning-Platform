import React, { useState, useEffect } from "react";
import logo from "../../assets/imgs/logo.png";
import loginBanner from "../../assets/imgs/login-banner.jpg";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation, setCredentials } from "../../redux";
import { SuccessToster, ErrorToster } from "../../components/toster";
import { getApiErrorMessage } from "../../utils/apiError";

// ─── Inline SVG icon primitives ────────────────────────────────────────────
const IconMail = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IconLock = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

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

const IconArrowRight = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const IconBuilding = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
// ───────────────────────────────────────────────────────────────────────────

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [login, { isLoading }] = useLoginMutation();

  const [showPassword, setShowPassword] = useState(false);

  const [data, setData] = useState({
    email: "",
    password: "",
    Rememberme: false,
  });

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

      try {
        const storedAuth = sessionStorage.getItem("authUser");
        if (storedAuth) {
          const { user: storedUser, accessToken, refreshToken, sessionId } = JSON.parse(storedAuth);
          if (storedUser && accessToken) {
            // Restore Redux state
            dispatch(setCredentials({
              user: storedUser,
              accessToken,
              refreshToken,
              sessionId,
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
        const authData = response.data || response;
        const authUser = authData.user;
        const accessToken = authData.accessToken || authData.token;
        const refreshToken = authData.refreshToken;
        const sessionId = authData.sessionId;

        if (!authUser || !accessToken) {
          throw new Error("Login response missing auth payload");
        }

        // ✅ Store in sessionStorage immediately for instant persistence
        sessionStorage.setItem("authUser", JSON.stringify({
          user: authUser,
          accessToken,
          refreshToken,
          sessionId,
        }));

        // ✅ Update Redux state
        dispatch(
          setCredentials({
            user: authUser,
            accessToken,
            refreshToken,
            sessionId,
          }),
        );

        SuccessToster("Logged In Successfully", 800);

        setData({ email: "", password: "", Rememberme: false });

        // Role-based routing using userType (case-insensitive)
        const userType = authUser.userType?.toLowerCase();
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

        // ✅ Minimal delay (50ms) to ensure state is committed before navigation
        navigate(redirectPath, { replace: true });
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

          setTimeout(() => {
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
      {/* Full-viewport split layout */}
      <main className="flex flex-col lg:flex-row w-full min-h-screen bg-white dark:bg-slate-900 overflow-hidden">

        <aside
          className="hidden lg:flex lg:w-1/2 relative p-12 flex-col justify-between overflow-hidden"
          style={{ background: "radial-gradient(circle at top left, #f3e8ff 0%, #ffffff 100%)" }}
        >
          {/* Dark-mode override */}
          <div className="absolute inset-0 bg-slate-800 opacity-0 dark:opacity-100 pointer-events-none" aria-hidden="true" />

          {/* Decorative blobs */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

          {/* Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-5">
              <img
                src={logo}
                alt="EduVerse logo"
                className="h-14 w-14 object-contain shrink-0 drop-shadow-md"
              />
              <div className="flex flex-col">
                <span className="text-3xl font-extrabold tracking-tight leading-none select-none">
                  <span className="text-slate-800 dark:text-white">Edu</span><span className="text-primary select-none">Verse</span>
                </span>
                <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 select-none">
                  Learn&nbsp;·&nbsp;Grow&nbsp;·&nbsp;Succeed
                </span>
              </div>
            </div>
          </div>

          {/* Illustration + copy */}
          <div className="relative z-10 flex flex-col items-center gap-8">
            <img
              src={loginBanner}
              alt="Students learning online"
              className="w-full max-w-sm h-auto rounded-3xl shadow-2xl object-cover
                         transform transition-transform duration-500"
            />

            <div className="text-center space-y-4 px-4">
              <h2 className="text-4xl font-extrabold text-slate-800 dark:text-white leading-tight">
                Give Wings to Your <span className="text-primary italic">Dreams</span>
              </h2>
              <p className="text-base text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Transform your aspirations into achievements with our comprehensive
                programs designed for success.
              </p>

              {/* Stats strip */}
              <div className="pt-2 flex items-center justify-center gap-6">
                <div className="text-center">
                  <p className="text-xl font-extrabold text-slate-800 dark:text-white">500+</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Courses</p>
                </div>
                <div className="w-px h-10 bg-slate-300 dark:bg-slate-600" aria-hidden="true" />
                <div className="text-center">
                  <p className="text-xl font-extrabold text-slate-800 dark:text-white">10k+</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Students</p>
                </div>
                <div className="w-px h-10 bg-slate-300 dark:bg-slate-600" aria-hidden="true" />
                <div className="text-center">
                  <p className="text-xl font-extrabold text-slate-800 dark:text-white">4.9★</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Rating</p>
                </div>
              </div>

              {/* Joined label */}
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 pt-2">
                Joined by 10,000+ students worldwide
              </p>
            </div>
          </div>

          
        </aside>

        {/* ═══════════════════════ RIGHT PANEL — Auth Form ═══════════════════════ */}
        <section className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-10 lg:p-16 bg-white dark:bg-slate-900">

          {/* Mobile logo — hidden on desktop */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <img src={logo} alt="EduVerse logo" className="h-10 w-10 object-contain shrink-0 drop-shadow-sm" />
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight leading-none">
                <span className="text-slate-800 dark:text-white">Edu</span><span className="text-primary">Verse</span>
              </span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                Learn&nbsp;·&nbsp;Grow&nbsp;·&nbsp;Succeed
              </span>
            </div>
          </div>

          <div className="max-w-md mx-auto w-full">

            {/* ── Heading ── */}
            <div className="mb-7">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                Welcome Back
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Please enter your details to sign in to your account.
              </p>
            </div>

            {/* ── Auth Form ── */}
            <form className="space-y-5" onSubmit={handelsubmit} noValidate>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <IconMail className="w-5 h-5" />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="example@eduverse.com"
                    value={data.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none
                               rounded-xl focus:ring-2 focus:ring-primary/30 dark:text-white text-sm
                               shadow-sm transition-all outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <IconLock className="w-5 h-5" />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={data.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800 border-none
                               rounded-xl focus:ring-2 focus:ring-primary/30 dark:text-white text-sm
                               shadow-sm transition-all outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400
                               hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword
                      ? <IconEyeOff className="w-5 h-5" />
                      : <IconEye className="w-5 h-5" />
                    }
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  name="Rememberme"
                  type="checkbox"
                  checked={data.Rememberme}
                  onChange={handleChange}
                  className="w-4 h-4 rounded accent-primary focus:ring-primary
                             border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800
                             cursor-pointer"
                />
                <label
                  htmlFor="remember"
                  className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none"
                >
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                aria-busy={isLoading}
                className={`w-full bg-primary text-white font-bold py-4 rounded-xl
                            shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:brightness-105
                            active:scale-[0.98] transition-all flex items-center justify-center gap-2
                            ${isLoading ? "opacity-80 cursor-not-allowed" : ""}`}
              >
                {isLoading ? (
                  <>
                    <span className="text-sm">Signing in…</span>
                    <span
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                      aria-hidden="true"
                    />
                  </>
                ) : (
                  <>
                    Sign In
                    <IconArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* ── Divider ── */}
            <div className="my-8 flex items-center gap-4" aria-hidden="true">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">
                or
              </span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* ── Sign up link ── */}
            <p className="text-center text-slate-500 dark:text-slate-400 text-sm">
              Don&apos;t have an account?{" "}
              <Link
                to="/Sign-Up"
                className="text-primary font-bold hover:underline transition-all"
              >
                Create account
              </Link>
            </p>

            {/* ── Organization registration link ── */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
                Want to register your organization?
              </p>
              <Link
                to="/register-organization"
                className="inline-flex items-center gap-2 text-sm font-semibold
                           text-primary hover:text-primary/80 transition-colors"
              >
                <IconBuilding className="w-5 h-5" />
                Register as Organization Owner
              </Link>
            </div>

          </div>
        </section>

      </main>
    </React.Fragment>
  );
}

export default Login;
