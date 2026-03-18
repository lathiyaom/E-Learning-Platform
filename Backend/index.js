const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// Import config and utilities
const { config, validateEnvironment } = require("./src/config/env");
const logger = require("./src/utils/logger");
const {
  errorHandler,
  notFoundHandler,
  asyncHandler,
} = require("./src/middlewares/errorHandler.middleware");
const {
  requestLogger,
  errorLogger,
} = require("./src/middlewares/requestLogger.middleware");

// Validate environment variables
validateEnvironment();

// Database connection
const { connectDB } = require("./src/Db/mongoose");
// const { testConnection, syncDatabase } = require("./src/Db/sequelize");
// const supabase = require("./src/Db/supabase");
const {
  isCloudinaryConfigured,
  missingCloudinaryEnvVars,
} = require("./src/config/cloudinary");
const { User, Tenant, Conversation } = require("./src/models");
const { verifyAccessToken } = require("./src/utils/jwtHelper");

const seedSuperAdmin = require("./src/utils/seedSuperAdmin");

const logCloudinaryStatus = () => {
  if (isCloudinaryConfigured) {
    console.log("✅ Cloudinary is connected");
    logger.info("Cloudinary is connected");
    return;
  }

  console.warn(
    `⚠️ Cloudinary is not configured. Missing env vars: ${missingCloudinaryEnvVars.join(", ")}`,
  );
  logger.warn(
    `Cloudinary is not configured. Missing env vars: ${missingCloudinaryEnvVars.join(", ")}`,
  );
};

// Initialize database connection
const initializeDatabase = async () => {
  try {
    await connectDB();
    logger.info("✅ Database connected successfully");

    // Seed platform Super Admin (idempotent — safe on every restart)
    await seedSuperAdmin();
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
const { invitationRouter } = require("./src/routes/superAdminRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const activityLogRoutes = require("./src/routes/activityLogRoutes");
const bookmarkRoutes = require("./src/routes/bookmarkRoutes");
const newsletterRoutes = require("./src/routes/newsletterRoutes");
const attendanceRoutes = require("./src/routes/attendanceRoutes");
const assignmentRoutes = require("./src/routes/assignmentRoutes");
const courseMaterialRoutes = require("./src/routes/courseMaterialRoutes");

const enrollmentRoutes = require("./src/routes/enrollmentRoutes");
const feedbackRoutes = require("./src/routes/feedbackRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const teacherOrganizationRoutes = require("./src/routes/teacherOrganizationRoutes");
const lectureRoutes = require("./src/routes/lectureRoutes");
const eventRoutes = require("./src/routes/eventRoutes");
const holidayRoutes = require("./src/routes/holidayRoutes");
const calendarRoutes = require("./src/routes/calendarRoutes");
// const calendarRoutes = require("./src/routes/calendarRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const organizationRoutes = require("./src/routes/organizationRoutes");
const chatRoutes = require("./src/routes/chatRoutes");
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

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: config.cors.origins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectionStateRecovery: {},
});

const buildParticipantKey = (model, id) => `${model}:${String(id)}`;
const buildParticipantRoom = (model, id) => `participant_${model}_${String(id)}`;
const buildOrganizationRoom = (organizationId) => `organization_${String(organizationId)}`;

const onlineParticipants = new Map();

const extractSocketToken = (socket) => {
  const authToken = socket.handshake?.auth?.token;
  const headerToken = socket.handshake?.headers?.authorization;

  if (authToken) return authToken;
  if (headerToken && headerToken.startsWith("Bearer ")) return headerToken.slice(7);
  return null;
};

const isConversationParticipant = (conversation, model, userId) => {
  const id = String(userId);

  if (Array.isArray(conversation.participants) && conversation.participants.length) {
    return conversation.participants.some(
      (participant) =>
        participant.participant_model === model &&
        String(participant.participant_id) === id,
    );
  }

  if (model !== "User") return false;
  return String(conversation.student_id) === id || String(conversation.teacher_id) === id;
};

io.use(async (socket, next) => {
  try {
    const token = extractSocketToken(socket);
    if (!token) {
      return next(new Error("Socket authentication failed: missing token"));
    }

    const decoded = verifyAccessToken(token);
    if (!decoded?.id) {
      return next(new Error("Socket authentication failed: invalid token"));
    }

    let account = await Tenant.findById(decoded.id).select("_id userType status sessions token");
    let model = "Tenant";

    if (!account) {
      account = await User.findById(decoded.id).select(
        "_id userType status sessions token tenant_id currentOrganization organizations",
      );
      model = "User";
    }

    if (!account || account.status !== "active") {
      return next(new Error("Socket authentication failed: account inactive"));
    }

    const hasSession =
      Array.isArray(account.sessions) &&
      account.sessions.some((session) => session.sid === decoded.sid && session.accessToken === token);
    const hasLegacyToken = account.token === token;

    if (!hasSession && !hasLegacyToken) {
      return next(new Error("Socket authentication failed: session expired"));
    }

    const role = String(account.userType || "").toLowerCase();
    const tenantId =
      model === "Tenant"
        ? String(account._id)
        : String(account.currentOrganization || account.tenant_id || account.organizations?.[0] || "");

    socket.data.user = {
      id: String(account._id),
      model,
      role,
      tenantId: tenantId || null,
      participantKey: buildParticipantKey(model, account._id),
    };

    return next();
  } catch (error) {
    return next(new Error("Socket authentication failed"));
  }
});

io.on("connection", (socket) => {
  const user = socket.data.user;
  const participantRoom = buildParticipantRoom(user.model, user.id);

  socket.join(participantRoom);
  if (user.tenantId) {
    socket.join(buildOrganizationRoom(user.tenantId));
  }

  const existing = onlineParticipants.get(user.participantKey) || new Set();
  existing.add(socket.id);
  onlineParticipants.set(user.participantKey, existing);

  io.to(participantRoom).emit("socket_authenticated", { connected: true });
  io.emit("user_status_change", {
    userId: user.id,
    model: user.model,
    participantKey: user.participantKey,
    status: "online",
  });

  socket.on("user_online", () => {
    io.emit("user_status_change", {
      userId: user.id,
      model: user.model,
      participantKey: user.participantKey,
      status: "online",
    });
  });

  socket.on("join_conversation", async (payload, ack) => {
    try {
      const conversationId = typeof payload === "string" ? payload : payload?.conversationId;
      if (!conversationId) {
        if (typeof ack === "function") ack({ ok: false, error: "conversationId is required" });
        return;
      }

      const conversation = await Conversation.findById(conversationId).select(
        "participants student_id teacher_id organization_id",
      );
      if (!conversation) {
        if (typeof ack === "function") ack({ ok: false, error: "Conversation not found" });
        return;
      }

      if (!isConversationParticipant(conversation, user.model, user.id)) {
        if (typeof ack === "function") ack({ ok: false, error: "Forbidden" });
        return;
      }

      socket.join(`conversation_${conversationId}`);
      if (typeof ack === "function") ack({ ok: true });
    } catch (error) {
      if (typeof ack === "function") ack({ ok: false, error: "Failed to join conversation" });
    }
  });

  socket.on("leave_conversation", (payload) => {
    const conversationId = typeof payload === "string" ? payload : payload?.conversationId;
    if (conversationId) {
      socket.leave(`conversation_${conversationId}`);
    }
  });

  const emitTyping = async (event, payload) => {
    const conversationId = payload?.conversationId;
    if (!conversationId) return;

    const conversation = await Conversation.findById(conversationId).select(
      "participants student_id teacher_id",
    );
    if (!conversation) return;
    if (!isConversationParticipant(conversation, user.model, user.id)) return;

    socket.to(`conversation_${conversationId}`).emit(event, {
      conversationId,
      userId: user.id,
      model: user.model,
      participantKey: user.participantKey,
    });
  };

  socket.on("typing", (payload) => emitTyping("user_typing", payload).catch(() => null));
  socket.on("stop_typing", (payload) => emitTyping("user_stop_typing", payload).catch(() => null));

  socket.on("disconnect", () => {
    const sockets = onlineParticipants.get(user.participantKey);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        onlineParticipants.delete(user.participantKey);
        io.emit("user_status_change", {
          userId: user.id,
          model: user.model,
          participantKey: user.participantKey,
          status: "offline",
        });
      } else {
        onlineParticipants.set(user.participantKey, sockets);
      }
    }

    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set("io", io);
app.set("onlineUsers", onlineParticipants);

// // Rate Limiting
// const limiter = rateLimit({
//   windowMs: config.rateLimit.windowMs,
//   max: config.rateLimit.maxRequests,
//   message: "Too many requests from this IP, please try again later.",
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // ✅ Strict rate limiting for login endpoint
// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // 5 login attempts
//   skipSuccessfulRequests: true,
//   message: "Too many login attempts, please try again later",
// });

// // ✅ Rate limiting for signup
// const signupLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 5, // 5 signups per hour per IP
//   message: "Too many account creations, please try again later",
// });

// // ✅ Rate limiting for token refresh
// const refreshLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 20, // 20 refresh attempts
//   message: "Too many token refresh attempts",
// });

// // ✅ Rate limiting for superadmin operations
// const superAdminLimiter = rateLimit({
//   windowMs: 60 * 1000, // 1 minute
//   max: 30, // 30 requests per minute
//   message: "Too many admin operations, please slow down",
// });

// Middleware
// Security headers
app.use(
  helmet({
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
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(cors(corsOptions));
// app.use(limiter); // Apply rate limiting to all routes
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
// userRoutesWithLimits.use("/Signup", signupLimiter);
userRoutesWithLimits.use("/", userRoutes);

app.use("/User", userRoutesWithLimits);
app.use("/Course", courseRoutes);
app.use("/Contact", contactRoutes);

// ✅ Auth routes with specific limiters
const authRoutesWithLimits = express.Router();
// authRoutesWithLimits.use("/Login", loginLimiter);
// authRoutesWithLimits.use("/refresh-token", refreshLimiter);
authRoutesWithLimits.use("/", authRoutes);

app.use("/Auth", authRoutesWithLimits);
app.use("/Tenant", tenantRoutes);
app.use("/SuperAdmin", superAdminRoutes); // ✅ Rate limit all superadmin routes
app.use("/TeacherInvitation", invitationRouter);
app.use("/Admin", adminRoutes);
app.use("/ActivityLog", activityLogRoutes);
app.use("/Bookmark", bookmarkRoutes);
app.use("/Newsletter", newsletterRoutes);
app.use("/Attendance", attendanceRoutes);
app.use("/Assignment", assignmentRoutes);
app.use("/Material", courseMaterialRoutes);

app.use("/Enrollment", enrollmentRoutes);
app.use("/Feedback", feedbackRoutes);
app.use("/Notification", notificationRoutes);
app.use("/Teacher", teacherOrganizationRoutes);
app.use("/Lecture", lectureRoutes);
app.use("/Event", eventRoutes);
app.use("/Holiday", holidayRoutes);
app.use("/Calendar", calendarRoutes);
app.use("/Analytics", analyticsRoutes);
app.use("/Profile", profileRoutes);
app.use("/Upload", uploadRoutes);
app.use("/Organization", organizationRoutes);
app.use("/Chat", chatRoutes);
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
    server.listen(PORT, () => {
      logger.info(
        `Server is running on port http://localhost:${PORT} in ${config.nodeEnv} mode`,
      );
      logger.info(`Socket.IO is ready for connections`);
      logCloudinaryStatus();
    });
  })
  .catch((error) => {
    logger.error("Server startup failed", error);
    process.exit(1);
  });
