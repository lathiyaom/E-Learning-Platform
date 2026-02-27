/**
 * Environment Configuration & Validation
 * Validates all required environment variables
 */

require("dotenv").config();

const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "NODE_ENV",
];

// Supabase (COMMENTED OUT - Using MongoDB now)
// const requiredEnvVars = [
//   "SUPABASE_DB_URL",
//   "JWT_SECRET",
//   "JWT_REFRESH_SECRET",
//   "NODE_ENV",
// ];

const optionalEnvVars = {
  PORT: "5000",
  NODE_ENV: "development",
  FRONTEND_URL_DEV: "http://localhost:3000",
  FRONTEND_URL_PROD: "https://example.com",
  VITE_APP_API_URL: "http://localhost:5000",
  LOG_LEVEL: "info",
  RATE_LIMIT_WINDOW: "15", // minutes
  RATE_LIMIT_MAX_REQUESTS: "100", // requests per window
  CURRENCY_CONVERSION_RATE: "83.50", // USD to INR
  ADMIN_EMAIL: "admin@eduverse.com",
  EMAIL_SERVICE: "smtp", // smtp, sendgrid, aws-ses
  SMTP_HOST: "smtp.gmail.com",
  SMTP_PORT: "587",
  SMTP_USER: "your-email@gmail.com",
  SMTP_PASS: "your-password",
  SENDGRID_API_KEY: "",
  AWS_SES_REGION: "us-east-1",
};

const config = {
  // Server
  port: parseInt(process.env.PORT || "5000"),
  nodeEnv: process.env.NODE_ENV || "development",
  isDevelopment: process.env.NODE_ENV !== "production",
  isProduction: process.env.NODE_ENV === "production",

  // Database
  database: {
    url: process.env.MONGO_URI,
  },

  // Supabase (COMMENTED OUT)
  // database: {
  //   url: process.env.SUPABASE_DB_URL,
  // },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenExpiry: "3d",
    refreshTokenExpiry: "7d",
  },

  // CORS
  cors: {
    origins: [
      process.env.FRONTEND_URL_DEV || "http://localhost:3000",
      process.env.FRONTEND_URL_PROD || "https://example.com",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
  },

  // API
  api: {
    baseUrl: process.env.VITE_APP_API_URL || "http://localhost:5000",
    logLevel: process.env.LOG_LEVEL || "info",
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "15") * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  },

  // Currency
  currency: {
    conversionRate: parseFloat(process.env.CURRENCY_CONVERSION_RATE || "83.50"),
  },

  // Email
  email: {
    adminEmail: process.env.ADMIN_EMAIL || "admin@eduverse.com",
    service: process.env.EMAIL_SERVICE || "smtp",
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
    },
    awsSes: {
      region: process.env.AWS_SES_REGION,
    },
  },
};

/**
 * Validate required environment variables
 */
const validateEnvironment = () => {
  const missing = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error(
      "❌ Missing required environment variables:",
      missing.join(", ")
    );
    process.exit(1);
  }

  // Warn about optional variables if not set
  if (config.isDevelopment) {
    for (const [envVar, defaultValue] of Object.entries(optionalEnvVars)) {
      if (!process.env[envVar]) {
        console.warn(`⚠️ Using default for ${envVar}: ${defaultValue}`);
      }
    }
  }

  console.log("✅ Environment configuration validated");
};

module.exports = { config, validateEnvironment };
