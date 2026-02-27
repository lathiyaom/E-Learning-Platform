import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLazyGetCurrentUserQuery } from "../redux";
import { logout } from "../redux/slice/authSlice";

const ProtectedRoute = ({ children, requiredRole }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, isAuthenticated, accessToken } = useSelector((state) => state.auth);
  const [validateUser] = useLazyGetCurrentUserQuery();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const validateAccess = async () => {
      setIsValidating(true);

      try {
        // ✅ Step 1: Check frontend state
        if (!isAuthenticated || !user || !accessToken) {
          setIsAuthorized(false);
          setIsValidating(false);
          return;
        }

        // ✅ Step 2: Validate with backend
        try {
          await validateUser().unwrap();
        } catch (error) {
          // ✅ Token invalid or expired
          console.warn("Token validation failed:", error);
          dispatch(logout());
          setIsAuthorized(false);
          setIsValidating(false);
          return;
        }

        // ✅ Step 3: Check role if required
        if (requiredRole) {
          const userRole = user.userType?.toLowerCase();
          const required = requiredRole.toLowerCase();

          if (userRole !== required) {
            setIsAuthorized(false);
            setIsValidating(false);
            return;
          }
        }

        // ✅ All checks passed
        setIsAuthorized(true);
      } catch (error) {
        console.error("Route validation error:", error);
        setIsAuthorized(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateAccess();
  }, [isAuthenticated, user, accessToken, requiredRole, validateUser, dispatch]);

  // ✅ Show loading while validating
  if (isValidating) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // ✅ Not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }

  // ✅ Not authorized (role mismatch)
  if (!isAuthorized) {
    if (requiredRole) {
      const dashboardMap = {
        superadmin: "/superadmin/dashboard",
        admin: "/admin/dashboard",
        teacher: "/teacher/dashboard",
        student: "/Dashboard",
      };

      const redirectPath = dashboardMap[user.userType?.toLowerCase()] || "/unauthorized";
      return <Navigate to={redirectPath} replace />;
    }

    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Authorized - render protected content
  return children;
};

export default ProtectedRoute;
