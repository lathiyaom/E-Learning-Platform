const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

// Import config and utilities
const { config, validateEnvironment } = require("./src/config/env");
const logger = require("./src/utils/logger");
const { errorHandler, notFoundHandler, asyncHandler } = require("./src/middlewares/errorHandler.middleware");
const { requestLogger, errorLogger } = require("./src/middlewares/requestLogger.middleware");

// Validate environment variables
validateEnvironment();

// Database connection
const { connectDB } = require("./src/Db/mongoose");
// const { testConnection, syncDatabase } = require("./src/Db/sequelize");
// const supabase = require("./src/Db/supabase");
require("./src/models/index");
const { Tenant } = require("./src/models");

// Initialize database connection
const initializeDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info("✅ Database connected successfully");

    // Auto-create platform owner (superadmin) on first run
    const superadminEmail = process.env.SUPERADMIN_EMAIL || "superadmin@gmail.com";
    const superadminPassword = process.env.SUPERADMIN_PASSWORD || "superadmin123";
    const existingSuperadmin = await Tenant.findOne({
      $or: [{ userType: "superadmin" }, { email: superadminEmail }],
    });

    if (!existingSuperadmin) {
      await Tenant.create({
        name: "Platform Owner",
        code: "PLATFM",
        phoneNo: "9999999999",
        userType: "superadmin",
        OrgOwnerName: "Platform Owner",
        OrgOwnerEmail: superadminEmail,
        OrgOwnerPhone: "9999999999",
        email: superadminEmail,
        password: superadminPassword,
        status: "active",
        agreeTerms: true,
        about: "Platform owner account",
      });

      logger.info("Superadmin auto-created", { email: superadminEmail });
    } else {
      logger.info("Superadmin already exists", { email: existingSuperadmin.email });
    }
  } catch (error) {
    logger.error("Database initialization failed", error);
    process.exit(1);
  }
};

// Supabase connection (COMMENTED OUT)
// const initializeDatabase = async () => {
//   try {
//     // Test Sequelize Connection
//     await testConnection();
//
//     // Test Supabase Connection (Optional check)
//     if (supabase) {
//       const { data, error } = await supabase
//         .from("users")
//         .select("id")
//         .limit(1);
//       if (error) {
//         logger.warn("Supabase client connected but failed to query");
//       } else {
//         logger.info("✅ Supabase client connected successfully");
//       }
//     }
//
//     // Only sync database when SYNC_DB=true
//     if (process.env.SYNC_DB === "true") {
//       await syncDatabase();
//       logger.info("🚀 Database Schema synced successfully");
//     }
//
//     logger.info("✅ Database connected successfully");
//   } catch (error) {
//     logger.error("Database initialization failed", error);
//     process.exit(1);
//   }
// };


// Import Routes
const userRoutes = require("./src/routes/userRoutes");
const courseRoutes = require("./src/routes/courseRoutes");
const contactRoutes = require("./src/routes/contactRoutes");
const authRoutes = require("./src/routes/authRoutes");
const tenantRoutes = require("./src/routes/tenantRoutes");
const superAdminRoutes = require("./src/routes/superAdminRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const activityLogRoutes = require("./src/routes/activityLogRoutes");
const bookmarkRoutes = require("./src/routes/bookmarkRoutes");
const newsletterRoutes = require("./src/routes/newsletterRoutes");
const attendanceRoutes = require("./src/routes/attendanceRoutes");
const examRoutes = require("./src/routes/examRoutes");
const enrollmentRoutes = require("./src/routes/enrollmentRoutes");
const feedbackRoutes = require("./src/routes/feedbackRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const teacherOrganizationRoutes = require("./src/routes/teacherOrganizationRoutes");
const lectureRoutes = require("./src/routes/lectureRoutes");
const timetableRoutes = require("./src/routes/timetableRoutes");
// const timetableRoutes = require("./src/routes/timetableRoutes");
const eventRoutes = require("./src/routes/eventRoutes");
const holidayRoutes = require("./src/routes/holidayRoutes");
const calendarRoutes = require("./src/routes/calendarRoutes");
// const calendarRoutes = require("./src/routes/calendarRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const organizationRoutes = require("./src/routes/organizationRoutes");
const chatRoutes = require("./src/routes/chatRoutes");
const courseMaterialRoutes = require("./src/routes/courseMaterialRoutes");
const lectureProgressRoutes = require("./src/routes/lectureProgressRoutes");
const teacherAssignmentRoutes = require("./src/routes/teacherAssignmentRoutes");
const superAdminTeachersRoute = require("./src/routes/superAdminTeachersRoute");
const teacherApplicationRoutes = require("./src/routes/teacherApplicationRoutes");

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = config.cors.origins;
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Cache-Control",
    "Pragma",
    "Expires",
    "X-Session-Id",
  ],
};

// Rate Limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Strict rate limiting for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts
  skipSuccessfulRequests: true,
  message: "Too many login attempts, please try again later",
});

// ✅ Rate limiting for signup
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 signups per hour per IP
  message: "Too many account creations, please try again later",
});

// ✅ Rate limiting for token refresh
const refreshLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 refresh attempts
  message: "Too many token refresh attempts",
});

// ✅ Rate limiting for superadmin operations
const superAdminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: "Too many admin operations, please slow down",
});

// Middleware
// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "res.cloudinary.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors(corsOptions));
app.use(limiter); // Apply rate limiting to all routes
app.use(express.json({ limit: "10mb" })); // Request size limit
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Request logging middleware (logs all requests/responses)
app.use(requestLogger);

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "EduVers API is running",
    status: "success",
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint (for Docker/monitoring)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

// Routes
// ✅ Apply specific rate limiters to sensitive endpoints
const userRoutesWithLimits = express.Router();
userRoutesWithLimits.use("/Signup", signupLimiter);
userRoutesWithLimits.use("/", userRoutes);

app.use("/User", userRoutesWithLimits);
app.use("/Course", courseRoutes);
app.use("/Contact", contactRoutes);

// ✅ Auth routes with specific limiters
const authRoutesWithLimits = express.Router();
authRoutesWithLimits.use("/Login", loginLimiter);
authRoutesWithLimits.use("/refresh-token", refreshLimiter);
authRoutesWithLimits.use("/", authRoutes);

app.use("/Auth", authRoutesWithLimits);
app.use("/Tenant", tenantRoutes);
app.use("/SuperAdmin", superAdminLimiter, superAdminRoutes); // ✅ Rate limit all superadmin routes
app.use("/Admin", adminRoutes);
app.use("/ActivityLog", activityLogRoutes);
app.use("/Bookmark", bookmarkRoutes);
app.use("/Newsletter", newsletterRoutes);
app.use("/Attendance", attendanceRoutes);
app.use("/Exam", examRoutes);
app.use("/Enrollment", enrollmentRoutes);
app.use("/Feedback", feedbackRoutes);
app.use("/Notification", notificationRoutes);
app.use("/Teacher", teacherOrganizationRoutes);
app.use("/Lecture", lectureRoutes);
app.use("/Timetable", timetableRoutes);
app.use("/Event", eventRoutes);
app.use("/Holiday", holidayRoutes);
app.use("/Calendar", calendarRoutes);
app.use("/Analytics", analyticsRoutes);
app.use("/Profile", profileRoutes);
app.use("/Upload", uploadRoutes);
app.use("/Organization", organizationRoutes);
app.use("/Chat", chatRoutes);
app.use("/Material", courseMaterialRoutes);
app.use("/Progress", lectureProgressRoutes);
app.use("/Admin", teacherAssignmentRoutes);
app.use("/SuperAdmin", superAdminTeachersRoute);
app.use("/TeacherApplication", teacherApplicationRoutes);

// 404 Handler
app.use(notFoundHandler);

// Error logger (logs errors before handling)
app.use(errorLogger);

// Global Error Handler (MUST be last)
app.use(errorHandler);

const PORT = config.port;
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server is running on port http://localhost:${PORT} in ${config.nodeEnv} mode`);
    });
  })
  .catch((error) => {
    logger.error("Server startup failed", error);
    process.exit(1);
  });
