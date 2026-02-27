
// ============================================================
//         EduVers Backend — Complete Documentation
// ============================================================
// File   : test.groovy (used as project notes / reference doc)
// Author : EduVers Dev Team
// Date   : 2026-02-21
// ============================================================


// ============================================================
// SECTION 1: TECHNOLOGY STACK
// ============================================================

/*
  | Tool                  | Purpose                                 |
  |-----------------------|-----------------------------------------|
  | Express.js v5         | Web server / API framework              |
  | Sequelize ORM         | Database model definitions & queries    |
  | PostgreSQL (Supabase) | Cloud database                          |
  | Supabase JS Client    | Direct Supabase-level operations        |
  | JWT (jsonwebtoken)    | Authentication tokens                   |
  | bcryptjs              | Password hashing                        |
  | cookie-parser         | Reading HTTP-only cookies               |
  | cors                  | Cross-origin requests from frontend     |
  | dotenv                | Environment variable management         |
*/


// ============================================================
// SECTION 2: COMPLETE FOLDER & FILE STRUCTURE
// ============================================================

/*
EduVers_Backend/
│
├── index.js                         ← App entry point, server setup, all routes mounted
├── package.json                     ← Dependencies & npm scripts
├── .env                             ← Environment variables (secrets, DB URL, etc.)
├── supabase_schema.sql              ← SQL schema (tables, columns)
├── supabase_rls_policies.sql        ← Row-Level Security (RLS) policy SQL
│
└── src/
    ├── Db/
    │   ├── sequelize.js             ← Sequelize connection + testConnection + syncDatabase
    │   └── supabase.js              ← Supabase JS client (for RLS/auth policy checks)
    │
    ├── models/
    │   ├── index.js                 ← Exports all models together
    │   ├── User.js                  ← User table model (students, teachers, user-admins)
    │   ├── tenants.js               ← Tenant table model (org owners, superadmin)
    │   ├── Course.js                ← Course table model
    │   └── ContactUs.js             ← Contact form submissions model
    │
    ├── middlewares/
    │   └── authMiddleware.js        ← authenticate, authorize, optionalAuth, isTenantOwner
    │
    ├── utils/
    │   ├── jwtHelper.js             ← generateTokens, verifyAccessToken, verifyRefreshToken
    │   └── syncPolicies.js          ← Runs RLS SQL policies on startup (when SYNC_DB=true)
    │
    ├── routes/
    │   ├── authRoutes.js            ← /Auth/*        — Login, Logout, Refresh, GetMe
    │   ├── userRoutes.js            ← /User/*        — Signup, Details, AllUsers, Update
    │   ├── tenantRoutes.js          ← /Tenant/*      — Register, Details, Update
    │   ├── courseRoutes.js          ← /Course/*      — Create, All, ById, Update, Delete
    │   ├── contactRoutes.js         ← /Contact/*     — Create, GetComments
    │   └── superAdminRoutes.js      ← /SuperAdmin/*  — Tenant & User management
    │
    ├── controllers/
    │   ├── authController.js        ← Handles Auth requests → calls authService
    │   ├── loginController.js       ← [OLD/UNUSED] standalone login logic
    │   ├── logoutController.js      ← [OLD/UNUSED] standalone logout logic
    │   ├── userController.js        ← Handles User requests → calls userService
    │   ├── tenantController.js      ← Handles Tenant requests → calls tenantService
    │   ├── courseController.js      ← Handles Course requests → calls courseService
    │   ├── contactController.js     ← Handles Contact requests → calls contactService
    │   └── superAdminController.js  ← Handles SuperAdmin requests → calls superAdminService
    │
    └── services/
        ├── authService.js           ← Business logic: login, logout, refresh, getUserById
        ├── userService.js           ← Business logic: createUser, getUser, update
        ├── tenantService.js         ← Business logic: createTenant, getTenant, update
        ├── courseService.js         ← Business logic: create, get, update, delete course
        ├── contactService.js        ← Business logic: create contact, get all contacts
        └── superAdminService.js     ← Business logic: manage tenants, platform stats
*/


// ============================================================
// SECTION 3: ARCHITECTURE PATTERN (3-Layer)
// ============================================================

/*
  Every request flows through 3 layers:

  ┌─────────────────────────────────────────────────────────┐
  │  REQUEST (from Frontend / Postman)                      │
  └──────────────────────────┬──────────────────────────────┘
                             │
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │  ROUTES  (routes/)                                      │
  │  Defines: URL + Middleware chain + Controller function  │
  └──────────────────────────┬──────────────────────────────┘
                             │
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │  MIDDLEWARE  (middlewares/)                             │
  │  authenticate → authorize → isTenantOwner              │
  └──────────────────────────┬──────────────────────────────┘
                             │
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │  CONTROLLER  (controllers/)                            │
  │  Reads req → sends res → delegates logic to service    │
  └──────────────────────────┬──────────────────────────────┘
                             │
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │  SERVICE  (services/)                                   │
  │  All business logic + database queries                  │
  └──────────────────────────┬──────────────────────────────┘
                             │
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │  MODEL  (models/)                                       │
  │  Sequelize table definition + hooks                     │
  └──────────────────────────┬──────────────────────────────┘
                             │
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │  DATABASE  (PostgreSQL via Supabase)                    │
  └─────────────────────────────────────────────────────────┘
*/


// ============================================================
// SECTION 4: USER ROLE SYSTEM
// ============================================================

/*
  Two SEPARATE tables exist — each with their own roles:

  ┌─────────────────────────────────────────────────────────────┐
  │  TABLE: tenants  (Organization Level)                       │
  ├────────────────┬────────────────────────────────────────────┤
  │  superadmin    │ Platform owner (first ever registered)     │
  │                │ Can manage all other tenants               │
  ├────────────────┼────────────────────────────────────────────┤
  │  admin         │ Organization owner                         │
  │                │ Can create users (students/teachers)       │
  │                │ under their own org                        │
  └────────────────┴────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────┐
  │  TABLE: users  (User Level)                                 │
  ├────────────────┬────────────────────────────────────────────┤
  │  student       │ End learner                                │
  ├────────────────┼────────────────────────────────────────────┤
  │  teacher       │ Can create and manage courses              │
  ├────────────────┼────────────────────────────────────────────┤
  │  admin         │ User-level admin (NOT same as tenant admin)│
  └────────────────┴────────────────────────────────────────────┘

  ⚠️ IMPORTANT:
    - Login checks Tenant table FIRST, then User table
    - Both types share the SAME /Auth/Login endpoint
    - "admin" in tenants table ≠ "admin" in users table
*/


// ============================================================
// SECTION 5: AUTHENTICATION & AUTHORIZATION FLOW
// ============================================================

// --- 5.1 JWT Token System (src/utils/jwtHelper.js) ---
/*
  accessToken  → expires in 3 days  → signed with JWT_SECRET
  refreshToken → expires in 7 days  → signed with JWT_REFRESH_SECRET

  Both tokens are:
    ✅ Stored in the database (token & refresh_token columns)
    ✅ Sent as HTTP-only cookies to frontend
    ✅ Also returned in the JSON response body
*/

// --- 5.2 Login Flow ---
/*
  POST /Auth/Login  { email, password }
          │
          ▼
  authService.login()
          │
          ├── Check Tenant table first
          │         ├── Found? → verify password
          │         │           → generate tokens
          │         │           → store tokens in DB
          │         │           → return { tokens, user: { role: "tenant" } }
          │         └── Not found? → go to step 2
          │
          └── Check User table
                    ├── Found? → verify password
                    │           → generate tokens
                    │           → store tokens in DB
                    │           → return { tokens, user: { role: "user" } }
                    └── Not found? → throw "Account Not Found"

  Response:
    {
      accessToken,
      refreshToken,
      user: { id, email, userType, firstName, lastName, role }
    }
  + Sets HTTP-only cookies: accessToken, refreshToken
*/

// --- 5.3 authenticate Middleware ---
/*
  On every protected request:
          │
          ▼
  1. Read token from:
       - Authorization header ("Bearer <token>")  OR
       - Cookie (accessToken)
          │
          ▼
  2. Verify JWT using verifyAccessToken()
          │
          ▼
  3. Find account in Tenant table
       → If not found → look in User table
          │
          ▼
  4. Check: account.token === token (token invalidation check)
       → If mismatch → 401 Session expired
          │
          ▼
  5. Set req.user = {
       id, email, userType, firstName, lastName,
       role ("tenant" | "user"),
       tenantId (only if role === "user")
     }
          │
          ▼
  6. next() → proceed to controller
*/

// --- 5.4 authorize Middleware (Role-Based Access Control) ---
/*
  Usage: authorize("teacher")   OR   authorize("admin", "superadmin")

  Flow:
    → Read req.user.userType
    → Compare (case-insensitive) to allowed roles
    → Match: next()
    → No match: 403 Forbidden
*/

// --- 5.5 isTenantOwner Middleware ---
/*
  Checks: req.user.role === "tenant"

  Passes only if the logged-in account is from the TENANTS table.
  Blocks: regular users (students, teachers, user-level admins)
*/

// --- 5.6 Password Hashing (Model Hooks) ---
/*
  Sequelize model hooks handle hashing automatically:

  beforeCreate → hash password when creating new user/tenant
  beforeUpdate → hash only if password field was changed

  ⚠️ NEVER manually hash before User.create() or Tenant.create()
     The model hook does it automatically!

  Register / Create:
  ┌─────────────────────────────┐
  │  password = "hello123"      │  ← Plain text from frontend
  └──────────────┬──────────────┘
                 │  beforeCreate Hook
                 ▼
  ┌─────────────────────────────┐
  │  password = "$2b$10$xyz..."  │  ← bcrypt hashed
  └──────────────┬──────────────┘
                 │
                 ▼
  ┌─────────────────────────────┐
  │  Saved in Database          │  ← Only hashed password stored
  └─────────────────────────────┘

  Login:
  ┌─────────────────────────────┐
  │  enteredPassword            │  ← Plain text from user
  └──────────────┬──────────────┘
                 │  comparePassword()
                 ▼
  ┌─────────────────────────────┐
  │  bcrypt.compare()           │  ← Compare with hashed password
  └──────────────┬──────────────┘
                 │
                 ▼
  ┌─────────────────────────────┐
  │  true → Login success       │
  │  false → 401 Invalid creds  │
  └─────────────────────────────┘
*/


// ============================================================
// SECTION 6: ALL API ENDPOINTS
// ============================================================

// --- 6.1 Auth Routes  BASE: /Auth ---
/*
  POST   /Auth/Login           → Public     → Login for tenants & users
  POST   /Auth/Logout          → Public     → Logout, clear DB token & cookie
  POST   /Auth/refresh-token   → Public     → Get new accessToken using refreshToken cookie
  GET    /Auth/me              → 🔒 Auth    → Get currently logged-in user/tenant data
*/

// --- 6.2 Tenant Routes  BASE: /Tenant ---
/*
  POST   /Tenant/Register      → 🔀 Smart Auth (see below)    → Register new org/tenant
  GET    /Tenant/Details/:id   → 🔒 Auth                      → Get tenant by ID
  PATCH  /Tenant/Update/:id    → 🔒 Auth + isTenantOwner
                                  + admin/superadmin           → Update tenant profile

  🔀 Smart Register Auth Logic:
    - If 0 tenants in DB → No auth needed (Bootstrap: creates 1st SuperAdmin)
    - If tenants exist   → Must be authenticated SuperAdmin to create more tenants
*/

// --- 6.3 User Routes  BASE: /User ---
/*
  POST   /User/Signup          → 🔒 Auth + isTenantOwner
                                  + admin/superadmin           → Create user under tenant
  GET    /User/Details/:email  → ❌ Public (no auth)          → Get user by email
  GET    /User/AllUsers        → ❌ Public (no auth)          → Get all users
  PATCH  /User/Update/:id      → ❌ Public (no auth)          → Update user profile

  ⚠️ Note: GET & PATCH user routes have NO authentication currently
*/

// --- 6.4 Course Routes  BASE: /Course ---
/*
  POST   /Course/Create        → 🔒 Auth + teacher only       → Create a new course
  GET    /Course/All           → ❌ Public                    → Get all courses
  GET    /Course/:id           → ❌ Public                    → Get course by ID
  PATCH  /Course/Update/:id    → 🔒 Auth + teacher only       → Update course
  DELETE /Course/Delete        → 🔒 Auth + teacher only       → Delete course (id in query)
*/

// --- 6.5 Contact Routes  BASE: /Contact ---
/*
  POST   /Contact/Create       → ❌ Public (but checks user email exists)  → Submit form
  GET    /Contact/Comments     → ❌ Public                                 → Get all submissions
*/

// --- 6.6 SuperAdmin Routes  BASE: /SuperAdmin ---
/*
  ALL routes require: 🔒 authenticate + isTenantOwner + authorize("superadmin")

  GET    /SuperAdmin/Tenants       → List all tenants on the platform
  GET    /SuperAdmin/Tenant/:id    → Get tenant + all users under that tenant
  PATCH  /SuperAdmin/Promote/:id   → Promote admin tenant → superadmin
  PATCH  /SuperAdmin/Demote/:id    → Demote superadmin → admin
  PATCH  /SuperAdmin/Status/:id    → Change tenant status (active/inactive/suspended)
  GET    /SuperAdmin/Users         → View all users across entire platform
  GET    /SuperAdmin/Stats         → Dashboard stats (totals, active/suspended counts)
*/


// ============================================================
// SECTION 7: WHO CAN DO WHAT (Permissions Table)
// ============================================================

/*
  Action                       Who                         Route
  ─────────────────────────────────────────────────────────────────────────────
  First registration           Anyone (public)             POST /Tenant/Register
  Create new tenants           SuperAdmin only             POST /Tenant/Register
  Login                        Anyone with account         POST /Auth/Login
  Logout                       Anyone                      POST /Auth/Logout
  Create users                 Tenant owner (admin/superadmin from tenants table)
                                                           POST /User/Signup
  View all tenants             SuperAdmin                  GET /SuperAdmin/Tenants
  View tenant + its users      SuperAdmin                  GET /SuperAdmin/Tenant/:id
  Promote admin → superadmin   SuperAdmin                  PATCH /SuperAdmin/Promote/:id
  Demote superadmin → admin    SuperAdmin                  PATCH /SuperAdmin/Demote/:id
  Suspend / activate tenant    SuperAdmin                  PATCH /SuperAdmin/Status/:id
  View all platform users      SuperAdmin                  GET /SuperAdmin/Users
  Dashboard stats              SuperAdmin                  GET /SuperAdmin/Stats
  Update own tenant profile    Tenant owner (self)         PATCH /Tenant/Update/:id
  Create course                Teacher (user table)        POST /Course/Create
  Update course                Teacher (user table)        PATCH /Course/Update/:id
  Delete course                Teacher (user table)        DELETE /Course/Delete
  View courses                 Anyone                      GET /Course/All
  Submit contact form          Anyone (email must exist)   POST /Contact/Create
*/


// ============================================================
// SECTION 8: DATABASE MODELS
// ============================================================

// --- 8.1 tenants table ---
/*
  Field              Type                   Notes
  ─────────────────────────────────────────────────────────────
  id                 UUID (PK)              Auto-generated UUID
  name               STRING                 Organization name
  phone_no           STRING                 10-digit phone
  user_type          ENUM                   "admin" | "superadmin"
  org_owner_name     STRING                 Name of org owner
  org_owner_email    STRING                 Email of org owner
  org_owner_phone    STRING                 Phone of org owner
  email              STRING (UNIQUE)        Login email for tenant
  password           STRING                 bcrypt hashed (auto by model hook)
  status             ENUM                   "active" | "inactive" | "suspended"
  agree_terms        BOOLEAN                Default: false
  about              TEXT                   Default: ""
  token              TEXT                   Current accessToken (null = logged out)
  refresh_token      TEXT                   Current refreshToken
  created_at         TIMESTAMP              Auto
  updated_at         TIMESTAMP              Auto
*/

// --- 8.2 users table ---
/*
  Field              Type                   Notes
  ─────────────────────────────────────────────────────────────
  id                 UUID (PK)              Auto-generated UUID
  tenant_id          UUID (FK)              → tenants.id (CASCADE delete/update)
  user_type          ENUM                   "student" | "teacher" | "admin"
  first_name         STRING
  last_name          STRING
  age                INTEGER
  gender             ENUM                   "male" | "female"
  phone_no           STRING                 10-digit phone
  email              STRING (UNIQUE)        Login email
  password           STRING                 bcrypt hashed (auto by model hook)
  agree_terms        BOOLEAN                Default: false
  status             ENUM                   "active" | "inactive" | "suspended"
  about              TEXT                   Default: ""
  token              TEXT                   Current accessToken (null = logged out)
  refresh_token      TEXT                   Current refreshToken
  created_at         TIMESTAMP              Auto
  updated_at         TIMESTAMP              Auto
*/

// --- 8.3 courses table ---
/*
  Field              Type                   Notes
  ─────────────────────────────────────────────────────────────
  id                 UUID (PK)              Auto-generated UUID
  title              STRING                 Unique (checked in service)
  image              TEXT                   Image URL
  description        TEXT
  category           STRING
  rating             DECIMAL(2,1)           0.0 - 5.0
  review_count       INTEGER                Default: 0
  video_url          TEXT                   Video URL
  tags               ARRAY(STRING)          Default: ["Popular", "New"]
  created_at         TIMESTAMP              Auto
  updated_at         TIMESTAMP              Auto
*/

// --- 8.4 contact_us table ---
/*
  Field              Type                   Notes
  ─────────────────────────────────────────────────────────────
  id                 UUID (PK)              Auto-generated UUID
  fullname           STRING
  email              STRING                 Must exist in users table
  phone              STRING                 10-digit phone
  subject            STRING
  message            TEXT
  created_at         TIMESTAMP              Auto
  updated_at         TIMESTAMP              Auto
*/


// ============================================================
// SECTION 9: SERVER STARTUP FLOW
// ============================================================

/*
  When: node index.js (or nodemon index.js)

  Step 1: testConnection()
          └── Sequelize authenticates with Supabase PostgreSQL
          └── Logs: ✅ Sequelize connection established

  Step 2: Supabase JS check
          └── Queries users table with limit 1
          └── Logs: ✅ Supabase client connected successfully

  Step 3: If SYNC_DB=true in .env
          └── syncRLSPolicies("drop")   ← Drops all existing RLS policies
          └── syncDatabase()            ← Sequelize sync({ alter: true })
          └── syncRLSPolicies("full")   ← Re-applies all policies from .sql file

  Step 4: Routes are registered
          └── /User       → userRoutes.js
          └── /Course     → courseRoutes.js
          └── /Contact    → contactRoutes.js
          └── /Auth       → authRoutes.js
          └── /Tenant     → tenantRoutes.js
          └── /SuperAdmin → superAdminRoutes.js

  Step 5: Server listens on PORT (default: 5000)
          └── http://localhost:5000
*/


// ============================================================
// SECTION 10: SMART REGISTRATION FLOW (Bootstrap)
// ============================================================

/*
  POST /Tenant/Register  ← First time (0 tenants in DB)
          │
          ▼
  tenantRoutes.js → smartRegisterAuth middleware
          │
          └── Tenant.count() === 0?
                  ├── YES → skip auth → next() directly
                  └── NO  → chain authenticate + authorize("superadmin")
          │
          ▼
  tenantService.createTenant()
          │
          └── Tenant.count() === 0?
                  ├── YES → assignedUserType = "superadmin"
                  └── NO  → assignedUserType = "admin"
          │
          ▼
  tenantController.createTenant()
          │
          └── Generate JWT tokens → store in DB
          └── Set HTTP-only cookies
          └── Return: { message, data, tokens }

  ─────────────────────────────────────────────────────────
  After First SuperAdmin Exists:
  ─────────────────────────────────────────────────────────
  POST /Tenant/Register  ← Requires SuperAdmin JWT
          │
          ▼
  smartRegisterAuth → count > 0 → authenticate + authorize("superadmin")
          │
          ▼
  Creates new tenant with userType: "admin"
*/


// ============================================================
// SECTION 11: SAFETY GUARDS BUILT IN
// ============================================================

/*
  ✅ Cannot demote yourself (SuperAdmin.Demote)
  ✅ Cannot demote the last remaining superadmin
  ✅ Cannot suspend / deactivate another superadmin (demote them first)
  ✅ Cannot change your own status (SuperAdmin.Status)
  ✅ Suspending / deactivating a tenant force-clears their tokens (instant logout)
  ✅ User-level "admin" (from users table) CANNOT:
       - Create users (blocked by isTenantOwner)
       - Access tenant routes
       - Access superAdmin routes
  ✅ Tenant cannot be created under inactive/suspended tenant
  ✅ Passwords are never exposed in responses (deleted from JSON)
*/


// ============================================================
// SECTION 12: IMPORTANT NOTES & KNOWN ISSUES
// ============================================================

/*
  1. loginController.js and logoutController.js are OLD / UNUSED files.
     The active login/logout is in: authController.js + authService.js
     These old files are NOT connected to any route.

  2. contactService.js checks that the email in the contact form exists
     in the users table — meaning only registered users can submit
     the contact form (even though no auth middleware is on the route).

  3. /User/AllUsers, /User/Details/:email, /User/Update/:id are
     currently NOT protected by any auth middleware — open to anyone.

  4. tenantController.js exports getAllTenants() but it is NOT
     registered in tenantRoutes.js — it is only used via
     superAdminController.js / superAdminRoutes.js.

  5. Password hashing is done automatically inside Sequelize model hooks
     (beforeCreate, beforeUpdate). NEVER manually hash before
     User.create() or Tenant.create().

  6. There is a casing inconsistency:
       ../Models/User   (capital M) — in some service files
       ../models/User   (lowercase m) — in others
     This should be made consistent to avoid issues on Linux servers.
*/



// ╔══════════════════════════════════════════════════════════════╗
// ║        PART 2 — NEW FEATURES PLAN & IMPLEMENTATION GUIDE   ║
// ║        EduVers Backend — What Needs to Be Built Next        ║
// ╚══════════════════════════════════════════════════════════════╝
// Date : 2026-02-21
// Total New Features : 13
// ================================================================


// ================================================================
// FEATURE PLAN OVERVIEW — QUICK INDEX
// ================================================================

/*
  #1  → SuperAdmin creates Tenants & Admins (extend existing flow)
  #2  → SuperAdmin Platform Management (extend existing SuperAdmin panel)
  #3  → Admin manages Sub-Admins & Employees (new admin panel flow)
  #4  → Data Separation (Tenant-Scoped Queries across all models)
  #5  → Cloudinary Integration (image & profile picture upload)
  #6  → Gemini AI — Video Subtitle Generation & Summary Storage
  #7  → Analytics System (role-specific dashboards & metrics)
  #8  → Google Meet API — Meeting creation & sharing
  #9  → Notification System (in-app, email, push notifications)
  #10 → Validation Fixes (harden all existing routes)
  #11 → AI Chatbot (Gemini/OpenAI powered)
  #12 → Rating & Ranking System (courses & faculty by student rating)
  #13 → Feedback System (full flow)
*/


// ================================================================
// FEATURE #1 — SuperAdmin Creates Tenants & Admins
// ================================================================

/*
  CURRENT STATE:
    - POST /Tenant/Register (smart auth: public if 0 tenants, else superadmin)
    - SuperAdmin can create new "admin" tenants via the same register endpoint

  WHAT TO ADD:
    - SuperAdmin should be able to explicitly set userType when creating tenants
    - Add ability to create a sub-admin directly within a tenant
    - Add endpoint to list all admins of a specific tenant

  NEW / UPDATED APIs:
  ─────────────────────────────────────────────────────────────────
  POST   /Tenant/Register               (existing, enhanced)
         Body: { name, phoneNo, OrgOwnerName, OrgOwnerEmail,
                 OrgOwnerPhone, email, password, ConformPassword,
                 agreeTerms, userType? }
         Auth: 🔒 superadmin only (after first registration)
         New : superadmin can now pass userType: "admin" or "superadmin"

  GET    /SuperAdmin/Tenant/:id/Admins  (new)
         Auth: 🔒 superadmin
         Returns: All users under a tenant with userType: "admin"

  ─────────────────────────────────────────────────────────────────
  FLOW:
  SuperAdmin logs in
        │
        ▼
  POST /Tenant/Register  { ..., userType: "admin" }
        │
        ▼
  smartRegisterAuth → count > 0 → authenticate + authorize("superadmin")
        │
        ▼
  tenantService.createTenant() →
        └── useType is passed explicitly by superadmin → skips "superadmin" auto-assign
        └── Creates tenant as "admin"
        └── Returns: tenant data + tokens (admin is auto-logged-in after creation)

  FILES TO UPDATE:
    - src/services/tenantService.js     → allow explicit userType from superadmin
    - src/routes/superAdminRoutes.js    → add GET /Tenant/:id/Admins
    - src/controllers/superAdminController.js → add getTenantAdmins()
    - src/services/superAdminService.js → add getTenantAdmins() query
*/


// ================================================================
// FEATURE #2 — SuperAdmin Platform Management (Extended)
// ================================================================

/*
  CURRENT STATE:
    - Can view all tenants, promote, demote, change status, view stats

  WHAT TO ADD:
    - Delete a tenant and cascade delete all its users
    - Search/filter tenants by name, status, userType
    - Pagination for tenant & user lists
    - View platform-wide activity logs (audit trail)

  NEW / UPDATED APIs:
  ─────────────────────────────────────────────────────────────────
  DELETE /SuperAdmin/Tenant/:id           (new)
         Auth: 🔒 superadmin
         Action: Delete tenant + CASCADE delete all users under it
         Guard: Cannot delete yourself

  GET    /SuperAdmin/Tenants              (enhanced with filters & pagination)
         Query params: ?status=active&userType=admin&page=1&limit=10&search=name

  GET    /SuperAdmin/Logs                 (new — future audit trail)
         Returns: Recent platform-level actions (who did what, when)

  ─────────────────────────────────────────────────────────────────
  NEW DB TABLE: activity_logs
  ─────────────────────────────────────────────────────────────────
  Field          Type       Notes
  id             UUID       PK
  actor_id       UUID       Who performed the action (tenant or user id)
  actor_type     ENUM       "tenant" | "user"
  action         STRING     e.g. "promoted_tenant", "suspended_tenant"
  target_id      UUID       Who was affected
  metadata       JSONB      Extra info (old value, new value)
  created_at     TIMESTAMP  Auto

  FILES TO CREATE / UPDATE:
    - src/models/ActivityLog.js              (new model)
    - src/services/superAdminService.js      (add delete, filter, paginate)
    - src/controllers/superAdminController.js (add deleteTenant, getLogs)
    - src/routes/superAdminRoutes.js          (add DELETE /Tenant/:id and GET /Logs)
*/


// ================================================================
// FEATURE #3 — Admin Manages Sub-Admins & Employees
// ================================================================

/*
  SCENARIO:
    A Tenant "Admin" (org owner) should be able to:
      1. Create other sub-admins within THEIR OWN tenant
      2. Create employees (students, teachers) under their tenant
      3. View all users under their tenant only (data separation)
      4. Update or suspend users within their tenant

  FLOW:
  Admin logs in → isTenantOwner check passes → role === "tenant"
        │
        ▼
  POST /User/Signup  { ..., userType: "admin" | "teacher" | "student" }
        │
        ▼
  userService.createUser()
        └── tenantId is injected from req.user.id (the logged-in admin's ID)
        └── Verifies tenant exists and is active
        └── Creates user under that tenant

  GET  /Admin/MyUsers   (new)
        └── Returns only users where tenant_id = req.user.id
        └── Admin sees ONLY their own org's users

  NEW / UPDATED APIs:
  ─────────────────────────────────────────────────────────────────
  POST   /User/Signup               (existing, works already)
         Auth: 🔒 authenticate + isTenantOwner + admin/superadmin
         Note: tenantId is auto-injected from logged-in admin's JWT

  GET    /Admin/MyUsers             (new)
         Auth: 🔒 authenticate + isTenantOwner + admin/superadmin
         Returns: All users under this admin's tenant only
         Query: ?userType=student&status=active&page=1&limit=10

  GET    /Admin/MyUsers/:id         (new)
         Auth: 🔒 authenticate + isTenantOwner + admin/superadmin
         Returns: Single user details (must belong to admin's tenant)

  PATCH  /Admin/UpdateUser/:id      (new)
         Auth: 🔒 authenticate + isTenantOwner + admin/superadmin
         Action: Update user details within admin's tenant only

  PATCH  /Admin/SuspendUser/:id     (new)
         Auth: 🔒 authenticate + isTenantOwner + admin/superadmin
         Action: Suspend / reactivate a user within admin's tenant
         Guard: Cannot suspend yourself

  DELETE /Admin/DeleteUser/:id      (new)
         Auth: 🔒 authenticate + isTenantOwner + admin/superadmin
         Guard: Cannot delete yourself

  ─────────────────────────────────────────────────────────────────
  FILES TO CREATE:
    - src/routes/adminRoutes.js              (new — /Admin/* routes)
    - src/controllers/adminController.js     (new)
    - src/services/adminService.js           (new — scoped to tenant_id)
  FILES TO UPDATE:
    - index.js                               (mount /Admin → adminRoutes)
*/


// ================================================================
// FEATURE #4 — DATA SEPARATION (Tenant-Scoped Architecture)
// ================================================================

/*
  WHAT IS DATA SEPARATION?
    Every piece of data (users, courses, meetings, notifications, etc.)
    must be scoped to a specific tenant. An admin of Org A must NEVER
    see data from Org B.

  HOW IT WORKS:
    All queries that are tenant-scoped must include:
      WHERE tenant_id = <logged-in-admin's-id>

  TABLES THAT NEED tenant_id:
  ─────────────────────────────────────────────────────────────────
  Table             Already Has tenant_id?   Action
  ─────────────────────────────────────────────────────────────────
  users             ✅ YES (tenant_id FK)    Working — inject from JWT
  courses           ❌ NO                    ADD tenant_id column
  notifications     ❌ (new table)           Add tenant_id on creation
  meetings          ❌ (new table)           Add tenant_id on creation
  ratings           ❌ (new table)           Add tenant_id on creation
  feedback          ❌ (new table)           Add tenant_id on creation
  activity_logs     ❌ (new table)           Add tenant_id on creation
  chat_messages     ❌ (new table)           Add tenant_id on creation

  ─────────────────────────────────────────────────────────────────
  MIDDLEWARE APPROACH:
  ─────────────────────────────────────────────────────────────────
  Create a new middleware: tenantScope
    - Reads req.user.id (when role === "tenant") → set req.tenantId
    - Reads req.user.tenantId (when role === "user") → set req.tenantId
    - All scoped service calls receive tenantId as parameter

  Example:
    Course.findAll({ where: { tenant_id: req.tenantId } })

  ─────────────────────────────────────────────────────────────────
  COURSE MODEL UPDATE (add tenant_id):
  ─────────────────────────────────────────────────────────────────
  Field          Type      Notes
  tenant_id      UUID FK   → tenants.id (CASCADE)
  created_by     UUID FK   → users.id (teacher who created it)

  FILES TO UPDATE:
    - src/models/Course.js              (add tenant_id, created_by fields)
    - src/middlewares/authMiddleware.js  (add tenantScope middleware)
    - src/services/courseService.js     (scope all queries to tenantId)
    - src/controllers/courseController.js (pass tenantId from req)
    - ALL new feature services          (always scope with tenantId)
*/


// ================================================================
// FEATURE #5 — CLOUDINARY INTEGRATION (Image & Profile Picture)
// ================================================================

/*
  PURPOSE:
    Upload profile pictures for users & tenants, and course images
    to Cloudinary CDN. Store only the Cloudinary URL in the DB.

  PACKAGE NEEDED:
    npm install cloudinary multer multer-storage-cloudinary

  NEW UTILITY FILE:
    src/utils/cloudinary.js       ← Cloudinary SDK config
    src/utils/multer.js           ← Multer middleware (memory storage)

  FLOW:
  Client sends multipart/form-data (image file)
        │
        ▼
  multer middleware → reads file into memory (buffer)
        │
        ▼
  cloudinaryUpload() → uploads buffer to Cloudinary
        │
        ▼
  Returns { secure_url, public_id }
        │
        ▼
  Store secure_url in DB (user.avatar or tenant.logo or course.image)

  ─────────────────────────────────────────────────────────────────
  NEW APIs:
  ─────────────────────────────────────────────────────────────────
  POST   /Upload/ProfilePicture     (new)
         Auth: 🔒 authenticate (any logged-in user or tenant)
         Body: multipart/form-data { image: <file> }
         Action: Upload to Cloudinary → update avatar in DB
         Returns: { url: "https://res.cloudinary.com/..." }

  POST   /Upload/CourseThumbnail    (new)
         Auth: 🔒 authenticate + teacher
         Body: multipart/form-data { image: <file> }
         Returns: { url: "..." }

  POST   /Upload/OrgLogo            (new)
         Auth: 🔒 authenticate + isTenantOwner
         Body: multipart/form-data { image: <file> }
         Action: Upload org logo → update tenant.logo in DB

  DELETE /Upload/DeleteImage        (new)
         Auth: 🔒 authenticate
         Body: { public_id: "cloudinary_public_id" }
         Action: Delete image from Cloudinary

  ─────────────────────────────────────────────────────────────────
  DB CHANGES:
  ─────────────────────────────────────────────────────────────────
  users table      → ADD avatar TEXT (Cloudinary URL)
  tenants table    → ADD logo TEXT (Cloudinary URL)
  courses table    → ADD image already exists (update to use Cloudinary URL)

  FOLDER STRUCTURE IN CLOUDINARY:
    eduverts/profiles/<userId>
    eduverts/logos/<tenantId>
    eduverts/courses/<courseId>

  FILES TO CREATE:
    - src/utils/cloudinary.js             (SDK config, upload helper)
    - src/utils/multer.js                 (multer setup)
    - src/controllers/uploadController.js (handle upload requests)
    - src/routes/uploadRoutes.js          (route definitions)
  FILES TO UPDATE:
    - src/models/User.js                  (add avatar field)
    - src/models/tenants.js               (add logo field)
    - index.js                            (mount /Upload → uploadRoutes)
    - .env                                (CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET)
*/


// ================================================================
// FEATURE #6 — GEMINI AI: Video Subtitle & Summary Generation
// ================================================================

/*
  PURPOSE:
    When a teacher uploads a course video:
    1. Send the video to Gemini AI API
    2. Gemini transcribes the video → generates subtitles (SRT format)
    3. Gemini also generates a text summary of the video content
    4. Both subtitle and summary are stored in the DB (on the course record)

  PACKAGE NEEDED:
    npm install @google/generative-ai

  FLOW:
  Teacher creates/updates a course with a video URL
        │
        ▼
  courseService.createCourse()
        │
        ▼
  geminiService.generateSubtitlesAndSummary(videoUrl)
        │   └── Calls Gemini API with video URL or transcript
        │   └── Returns { subtitles: "...", summary: "..." }
        │
        ▼
  Store subtitles + summary in courses table
        │
        ▼
  Student views course → sees subtitles + AI summary

  ─────────────────────────────────────────────────────────────────
  NEW APIs:
  ─────────────────────────────────────────────────────────────────
  POST   /Course/GenerateSubtitles/:id   (new)
         Auth: 🔒 authenticate + teacher
         Action: Trigger Gemini AI for a specific course video
         Returns: { subtitles, summary }

  GET    /Course/:id/Subtitles           (new)
         Auth: 🔒 authenticate (any logged-in user)
         Returns: { subtitles, summary } for that course

  ─────────────────────────────────────────────────────────────────
  DB CHANGES — courses table:
  ─────────────────────────────────────────────────────────────────
  ADD subtitles   TEXT      (SRT/VTT format subtitle content)
  ADD summary     TEXT      (AI-generated summary of video content)
  ADD ai_status   ENUM      "pending" | "processing" | "done" | "failed"

  FILES TO CREATE:
    - src/utils/gemini.js                   (Gemini SDK config + helper)
    - src/services/aiService.js             (generateSubtitles, generateSummary)
    - src/controllers/aiController.js       (trigger generation, get results)
    - src/routes/aiRoutes.js                (route definitions)
  FILES TO UPDATE:
    - src/models/Course.js                  (add subtitles, summary, ai_status)
    - src/services/courseService.js         (trigger AI after video upload if needed)
    - index.js                              (mount /AI → aiRoutes)
    - .env                                  (GEMINI_API_KEY)
*/


// ================================================================
// FEATURE #7 — ANALYTICS SYSTEM (Role-Specific Dashboards)
// ================================================================

/*
  PURPOSE:
    Each role gets different analytics/metrics relevant to them.

  ─────────────────────────────────────────────────────────────────
  SUPERADMIN ANALYTICS:
  ─────────────────────────────────────────────────────────────────
  - Total tenants (active, suspended, inactive)
  - Total users across platform
  - Total courses across platform
  - Total meetings scheduled
  - Growth trend (new tenants per month)
  - Top tenants by user count

  ADMIN (TENANT OWNER) ANALYTICS:
  ─────────────────────────────────────────────────────────────────
  - Total users in their org (students, teachers, admins breakdown)
  - Total courses created in their org
  - Active meetings in their org
  - Average course rating in their org
  - Student progress metrics
  - Top rated teachers in their org

  TEACHER ANALYTICS:
  ─────────────────────────────────────────────────────────────────
  - Total courses created
  - Total students enrolled per course
  - Average rating per course
  - Total feedback received
  - Meetings scheduled

  STUDENT ANALYTICS:
  ─────────────────────────────────────────────────────────────────
  - Courses enrolled in
  - Progress per course (% completed)
  - Average rating given
  - Meetings attended
  - Feedback submitted

  ─────────────────────────────────────────────────────────────────
  NEW APIs:
  ─────────────────────────────────────────────────────────────────
  GET  /SuperAdmin/Stats           (existing, enhance with more metrics)
  GET  /Admin/Stats                (new — tenant-scoped analytics)
  GET  /Teacher/Stats              (new — teacher-specific metrics)
  GET  /Student/Stats              (new — student-specific metrics)
  GET  /Admin/Stats/Growth         (new — monthly growth chart data)
  GET  /Admin/Stats/TopTeachers    (new — top rated teachers in org)
  GET  /Admin/Stats/TopCourses     (new — top rated courses in org)

  ─────────────────────────────────────────────────────────────────
  NEW TABLE: enrollments
  ─────────────────────────────────────────────────────────────────
  Field           Type      Notes
  id              UUID      PK
  student_id      UUID FK   → users.id
  course_id       UUID FK   → courses.id
  tenant_id       UUID FK   → tenants.id (data separation)
  progress        INTEGER   % completed (0-100)
  enrolled_at     TIMESTAMP Auto
  completed_at    TIMESTAMP Nullable

  FILES TO CREATE:
    - src/models/Enrollment.js              (new)
    - src/services/analyticsService.js      (new — all stats queries)
    - src/controllers/analyticsController.js (new)
    - src/routes/analyticsRoutes.js         (new)
  FILES TO UPDATE:
    - src/services/superAdminService.js     (enhance getPlatformStats)
    - index.js                              (mount /Analytics → analyticsRoutes)
*/


// ================================================================
// FEATURE #8 — GOOGLE MEET API (Meeting Creation & Sharing)
// ================================================================

/*
  PURPOSE:
    Admin (org owner) creates Google Meet links and shares them
    with teachers/students in their organization.

  PACKAGE NEEDED:
    npm install googleapis

  PREREQUISITES:
    - Google Cloud Console project
    - OAuth2 credentials (client_id, client_secret, refresh_token)
    - Google Calendar API enabled (Meet links are created via Calendar events)

  FLOW:
  Admin creates a meeting
        │
        ▼
  POST /Meeting/Create { title, description, startTime, endTime, attendees[] }
        │
        ▼
  meetingService.createMeeting()
        └── Google Calendar API → create event with conferenceDataVersion=1
        └── Google auto-generates Meet link
        └── Store meeting in DB: { meet_link, event_id, title, attendees }
        │
        ▼
  notificationService.send()
        └── Notify all attendees (in-app + email) with meeting details & link
        │
        ▼
  Response: { meetLink, startTime, endTime, attendees }

  ─────────────────────────────────────────────────────────────────
  NEW APIs:
  ─────────────────────────────────────────────────────────────────
  POST   /Meeting/Create            (new)
         Auth: 🔒 authenticate + isTenantOwner + admin/superadmin (Admin only)
         Body: { title, description, startTime, endTime, attendees: [userId, ...] }
         Returns: { meetLink, eventId, attendees }

  GET    /Meeting/All               (new)
         Auth: 🔒 authenticate
         Returns: All meetings for logged-in user's tenant (scoped)

  GET    /Meeting/:id               (new)
         Auth: 🔒 authenticate
         Returns: Single meeting details

  PATCH  /Meeting/Update/:id        (new)
         Auth: 🔒 authenticate + isTenantOwner + admin
         Action: Update meeting time/attendees → updates Google Calendar event

  DELETE /Meeting/Delete/:id        (new)
         Auth: 🔒 authenticate + isTenantOwner + admin
         Action: Cancel meeting from Google Calendar + delete from DB

  GET    /Meeting/MyMeetings        (new)
         Auth: 🔒 authenticate (student/teacher)
         Returns: Meetings the logged-in user is an attendee of

  ─────────────────────────────────────────────────────────────────
  NEW DB TABLE: meetings
  ─────────────────────────────────────────────────────────────────
  Field           Type        Notes
  id              UUID        PK
  tenant_id       UUID FK     → tenants.id (data separation)
  created_by      UUID FK     → tenants.id (admin who created)
  title           STRING
  description     TEXT
  meet_link       TEXT        Google Meet URL
  google_event_id STRING      Google Calendar Event ID (for updates/delete)
  start_time      TIMESTAMP
  end_time        TIMESTAMP
  status          ENUM        "scheduled" | "ongoing" | "completed" | "cancelled"
  created_at      TIMESTAMP   Auto

  NEW DB TABLE: meeting_attendees (junction table)
  ─────────────────────────────────────────────────────────────────
  Field           Type        Notes
  id              UUID        PK
  meeting_id      UUID FK     → meetings.id
  user_id         UUID FK     → users.id
  status          ENUM        "invited" | "accepted" | "declined"

  FILES TO CREATE:
    - src/utils/googleMeet.js              (Google OAuth2 + Calendar API helper)
    - src/models/Meeting.js                (new)
    - src/models/MeetingAttendee.js        (new junction table)
    - src/services/meetingService.js       (new)
    - src/controllers/meetingController.js (new)
    - src/routes/meetingRoutes.js          (new)
  FILES TO UPDATE:
    - index.js                             (mount /Meeting → meetingRoutes)
    - .env                                 (GOOGLE_CLIENT_ID, SECRET, REFRESH_TOKEN)
*/


// ================================================================
// FEATURE #9 — NOTIFICATION SYSTEM (In-App + Email)
// ================================================================

/*
  PURPOSE:
    Notify users and tenants about important events:
    - Meeting invitations
    - New course published
    - New feedback received
    - Account status changes
    - Platform announcements (superadmin → all tenants)

  NOTIFICATION TYPES:
    "meeting_invite"    → When admin creates a meeting
    "course_published"  → When teacher publishes a course
    "feedback_received" → When student submits feedback to teacher
    "account_suspended" → When superadmin suspends a tenant
    "announcement"      → Superadmin broadcasts to all

  FLOW:
  Any action (meeting create, course publish, etc.)
        │
        ▼
  notificationService.send({ to: userId, type, message, metadata })
        │
        ├── Save to notifications table (in-app)
        └── (Optional) Send email via Nodemailer/SendGrid

  ─────────────────────────────────────────────────────────────────
  NEW APIs:
  ─────────────────────────────────────────────────────────────────
  GET    /Notification/All          (new)
         Auth: 🔒 authenticate (any role)
         Returns: All notifications for logged-in user (unread first)
         Query: ?read=false&page=1&limit=20

  PATCH  /Notification/Read/:id     (new)
         Auth: 🔒 authenticate
         Action: Mark single notification as read

  PATCH  /Notification/ReadAll      (new)
         Auth: 🔒 authenticate
         Action: Mark all notifications of this user as read

  DELETE /Notification/Delete/:id   (new)
         Auth: 🔒 authenticate
         Action: Delete a notification

  POST   /Notification/Broadcast    (new)
         Auth: 🔒 authenticate + isTenantOwner + superadmin
         Body: { message, targetRole? }
         Action: Send announcement to all tenants/users

  ─────────────────────────────────────────────────────────────────
  NEW DB TABLE: notifications
  ─────────────────────────────────────────────────────────────────
  Field           Type      Notes
  id              UUID      PK
  recipient_id    UUID      Target user or tenant ID
  recipient_type  ENUM      "user" | "tenant"
  tenant_id       UUID FK   → tenants.id (data separation)
  type            ENUM      notification type
  title           STRING
  message         TEXT
  metadata        JSONB     Extra context (e.g. meetLink, courseId)
  is_read         BOOLEAN   Default: false
  created_at      TIMESTAMP Auto

  FILES TO CREATE:
    - src/models/Notification.js              (new)
    - src/services/notificationService.js     (new — send, getAll, markRead)
    - src/controllers/notificationController.js (new)
    - src/routes/notificationRoutes.js        (new)
  FILES TO UPDATE:
    - src/services/meetingService.js          (call notificationService on create)
    - src/services/courseService.js           (notify students on publish)
    - src/services/superAdminService.js       (notify on suspend/status change)
    - index.js                                (mount /Notification → notificationRoutes)
*/


// ================================================================
// FEATURE #10 — VALIDATION FIXES (Harden All Existing Routes)
// ================================================================

/*
  CURRENT ISSUES TO FIX:
  ─────────────────────────────────────────────────────────────────
  1. /User/AllUsers        → No auth. Anyone can list all users → ADD authenticate
  2. /User/Details/:email  → No auth. Expose user data → ADD authenticate
  3. /User/Update/:id      → No auth. Anyone can update any user → ADD authenticate
                             Also add ownership check (only update own profile)
  4. /Contact/Create       → No auth. Only checks email exists → ADD authenticate
  5. /Contact/Comments     → No auth. Anyone reads all messages → ADD authenticate + admin
  6. Course.Delete         → Uses query param (?id=) instead of URL param → FIX to /:id
  7. loginController.js    → Old file, not connected → DELETE or clearly mark unused
  8. logoutController.js   → Old file, not connected → DELETE or clearly mark unused
  9. Path casing: ../Models/User vs ../models/User → FIX to lowercase everywhere
  10. No rate limiting on /Auth/Login → ADD express-rate-limit

  FIXES PLAN:
  ─────────────────────────────────────────────────────────────────
  Route                       Fix
  ─────────────────────────────────────────────────────────────────
  GET  /User/AllUsers         Add: authenticate + isTenantOwner (scoped to tenant)
  GET  /User/Details/:email   Add: authenticate (user sees own profile only)
  PATCH /User/Update/:id      Add: authenticate + ownership check (id === req.user.id)
  POST /Contact/Create        Add: authenticate (user already logged in)
  GET  /Contact/Comments      Add: authenticate + authorize("admin", "superadmin")
  DELETE /Course/Delete       Change from ?id= query to /:id URL param
  POST /Auth/Login            Add: express-rate-limit (5 attempts per 15 min)

  PACKAGES NEEDED:
    npm install express-rate-limit

  FILES TO UPDATE:
    - src/routes/userRoutes.js        (add middleware to all routes)
    - src/routes/contactRoutes.js     (add middleware)
    - src/routes/courseRoutes.js      (fix Delete route)
    - src/controllers/courseController.js (update DeleteCourse to use req.params.id)
    - index.js                        (add rate limiter to /Auth)
    - src/services/authService.js     (all ../Models → ../models lowercase fix)
    - src/services/contactService.js  (../Models → ../models)
    - src/services/courseService.js   (../Models → ../models)
    - Delete or move loginController.js and logoutController.js
*/


// ================================================================
// FEATURE #11 — AI CHATBOT (Gemini / OpenAI Powered)
// ================================================================

/*
  PURPOSE:
    An intelligent chatbot embedded in the platform that:
    - Answers student questions about courses
    - Helps navigate the platform
    - Provides study assistance based on course content
    - Falls back to general knowledge via Gemini/OpenAI

  FLOW:
  Student sends a message
        │
        ▼
  POST /Chat/Message { message, context? }
        │
        ▼
  chatService.handleMessage()
        │
        ├── Load conversation history from DB for this user
        ├── Inject course context (summary from AI feature #6) if available
        ├── Build prompt → send to Gemini API
        │       └── Gemini generates response
        ├── Save message + response to chat_messages table
        └── Return response

  ─────────────────────────────────────────────────────────────────
  NEW APIs:
  ─────────────────────────────────────────────────────────────────
  POST   /Chat/Message              (new)
         Auth: 🔒 authenticate (any role)
         Body: { message: "...", courseId?: "uuid" }
         Returns: { reply: "...", conversationId }

  GET    /Chat/History              (new)
         Auth: 🔒 authenticate
         Returns: Full conversation history for this user
         Query: ?limit=50

  DELETE /Chat/Clear                (new)
         Auth: 🔒 authenticate
         Action: Clear this user's chat history

  ─────────────────────────────────────────────────────────────────
  NEW DB TABLE: chat_messages
  ─────────────────────────────────────────────────────────────────
  Field           Type      Notes
  id              UUID      PK
  user_id         UUID FK   → users.id (or tenants.id)
  tenant_id       UUID FK   → tenants.id (data separation)
  role            ENUM      "user" | "assistant"
  message         TEXT      The message content
  course_context  UUID FK   → courses.id (optional context)
  created_at      TIMESTAMP Auto

  FILES TO CREATE:
    - src/services/chatService.js             (new — history load, Gemini call, save)
    - src/controllers/chatController.js       (new)
    - src/routes/chatRoutes.js                (new)
    - src/models/ChatMessage.js               (new)
  FILES TO UPDATE:
    - src/utils/gemini.js                     (add chat/conversational function)
    - index.js                                (mount /Chat → chatRoutes)
*/


// ================================================================
// FEATURE #12 — RATING & RANKING SYSTEM
// ================================================================

/*
  PURPOSE:
    Students rate courses and teachers.
    Courses and faculty are ranked based on average student ratings.

  RULES:
    - Only enrolled students can rate a course / teacher
    - A student can rate a course/teacher only ONCE
    - Rating scale: 1 to 5 stars
    - Average rating is stored on the course record (for fast reads)
    - Rankings are sorted by average rating descending

  FLOW — Student Rates a Course:
  Student submits rating { courseId, rating, review? }
        │
        ▼
  ratingService.rateCourse()
        └── Check: student is enrolled in this course
        └── Check: student has NOT already rated this course
        └── Create rating record
        └── Recalculate course average rating
        └── Update courses.rating + courses.review_count in DB

  FLOW — Get Rankings:
  GET /Course/All?sort=rating   → sorted by average rating DESC
  GET /Teacher/Rankings         → sorted by average teacher rating DESC

  ─────────────────────────────────────────────────────────────────
  NEW APIs:
  ─────────────────────────────────────────────────────────────────
  POST   /Rating/Course          (new)
         Auth: 🔒 authenticate + student only
         Body: { courseId, rating (1-5), review? }
         Guard: Must be enrolled, can only rate once

  POST   /Rating/Teacher         (new)
         Auth: 🔒 authenticate + student only
         Body: { teacherId, rating (1-5), review? }
         Guard: Must have a course with this teacher, once per teacher

  GET    /Rating/Course/:id      (new)
         Auth: 🔒 authenticate
         Returns: All ratings for a specific course

  GET    /Rating/Teacher/:id     (new)
         Auth: 🔒 authenticate
         Returns: All ratings for a specific teacher

  GET    /Course/Rankings        (new)
         Auth: ❌ Public
         Returns: All courses sorted by average rating DESC
         Query: ?category=math&limit=10

  GET    /Teacher/Rankings       (new)
         Auth: 🔒 authenticate (scoped to tenant)
         Returns: All teachers sorted by average rating DESC
         Scoped: Only teachers within same tenant

  PATCH  /Rating/Update/:id      (new)
         Auth: 🔒 authenticate + student (own rating only)
         Body: { rating, review? }
         Action: Update existing rating (recalculate average)

  DELETE /Rating/Delete/:id      (new)
         Auth: 🔒 authenticate + student (own rating only)
         Action: Delete rating (recalculate average)

  ─────────────────────────────────────────────────────────────────
  NEW DB TABLE: ratings
  ─────────────────────────────────────────────────────────────────
  Field           Type         Notes
  id              UUID         PK
  tenant_id       UUID FK      → tenants.id (data separation)
  rated_by        UUID FK      → users.id (student)
  target_id       UUID         → courses.id or users.id
  target_type     ENUM         "course" | "teacher"
  rating          INTEGER      1 to 5
  review          TEXT         Optional written review
  created_at      TIMESTAMP    Auto
  updated_at      TIMESTAMP    Auto

  UNIQUE CONSTRAINT: (rated_by, target_id, target_type)
  → One student can rate each course/teacher only once

  EXISTING TABLE UPDATE — courses:
    rating        DECIMAL(2,1)    Already exists — keep, update via trigger
    review_count  INTEGER         Already exists — increment on each new rating

  FILES TO CREATE:
    - src/models/Rating.js                (new)
    - src/services/ratingService.js       (new — rate, getRatings, recalculate avg)
    - src/controllers/ratingController.js (new)
    - src/routes/ratingRoutes.js          (new)
  FILES TO UPDATE:
    - src/models/Course.js                (recalculate rating on new rating)
    - index.js                            (mount /Rating → ratingRoutes)
*/


// ================================================================
// FEATURE #13 — FEEDBACK SYSTEM (Full Flow)
// ================================================================

/*
  PURPOSE:
    A structured feedback system where:
    - Students give feedback to teachers (about their teaching)
    - Students give feedback about courses (content quality)
    - Admin views all feedback within their org
    - Teachers see their own feedback and can respond

  DIFFERENCE FROM RATING:
    Rating = numeric score (1-5 stars)
    Feedback = detailed written feedback with categories

  FLOW — Student Submits Feedback:
  Student submits { teacherId | courseId, type, category, message }
        │
        ▼
  feedbackService.create()
        └── Validates: student must be enrolled in a course by this teacher
        └── Creates feedback record
        └── Notifies teacher via notificationService
        └── Returns feedback

  FLOW — Teacher Responds:
  Teacher reads feedback list → PATCH /Feedback/Respond/:id { response }
        │
        ▼
  feedbackService.respond()
        └── Updates feedback.teacher_response
        └── Notifies student that teacher responded

  ─────────────────────────────────────────────────────────────────
  NEW APIs:
  ─────────────────────────────────────────────────────────────────
  POST   /Feedback/Submit           (new)
         Auth: 🔒 authenticate + student
         Body: { targetId, targetType ("teacher"|"course"), category, message }
         Guard: Must be enrolled in a course by this teacher

  GET    /Feedback/Mine             (new — student sees own submitted feedback)
         Auth: 🔒 authenticate + student
         Returns: All feedback this student submitted

  GET    /Feedback/Received         (new — teacher sees feedback received)
         Auth: 🔒 authenticate + teacher
         Returns: All feedback directed at this teacher

  PATCH  /Feedback/Respond/:id      (new — teacher responds to feedback)
         Auth: 🔒 authenticate + teacher (must be feedback target)
         Body: { response: "..." }
         Action: Set teacher_response field

  GET    /Feedback/All              (new — admin sees all org feedback)
         Auth: 🔒 authenticate + isTenantOwner + admin/superadmin
         Query: ?targetType=teacher&page=1&limit=20
         Scoped: Only feedback within this admin's tenant

  DELETE /Feedback/Delete/:id       (new)
         Auth: 🔒 authenticate + admin/superadmin (can delete inappropriate feedback)
         Guard: Admin can only delete within their tenant

  ─────────────────────────────────────────────────────────────────
  NEW DB TABLE: feedback
  ─────────────────────────────────────────────────────────────────
  Field               Type      Notes
  id                  UUID      PK
  tenant_id           UUID FK   → tenants.id (data separation)
  submitted_by        UUID FK   → users.id (student)
  target_id           UUID      → users.id (teacher) or courses.id
  target_type         ENUM      "teacher" | "course"
  category            ENUM      "content" | "communication" | "punctuality"
                                | "material" | "other"
  message             TEXT      Written feedback
  teacher_response    TEXT      Teacher's optional reply
  is_anonymous        BOOLEAN   Default: false (student can choose)
  created_at          TIMESTAMP Auto
  updated_at          TIMESTAMP Auto

  FILES TO CREATE:
    - src/models/Feedback.js                  (new)
    - src/services/feedbackService.js         (new)
    - src/controllers/feedbackController.js   (new)
    - src/routes/feedbackRoutes.js            (new)
  FILES TO UPDATE:
    - src/services/notificationService.js     (notify teacher on new feedback)
    - index.js                                (mount /Feedback → feedbackRoutes)
*/


// ================================================================
// COMPLETE UPDATED FILE STRUCTURE (After All Features Added)
// ================================================================

/*
EduVers_Backend/
│
├── index.js                         ← (updated — new routes mounted)
├── package.json                     ← (updated — new packages)
├── .env                             ← (updated — Cloudinary, Gemini, Google keys)
│
└── src/
    ├── Db/
    │   ├── sequelize.js
    │   └── supabase.js
    │
    ├── models/
    │   ├── index.js                 ← (updated — export all new models)
    │   ├── User.js                  ← (updated — add avatar field)
    │   ├── tenants.js               ← (updated — add logo field)
    │   ├── Course.js                ← (updated — add tenant_id, created_by,
    │   │                               subtitles, summary, ai_status)
    │   ├── ContactUs.js
    │   ├── Enrollment.js            ← NEW
    │   ├── Rating.js                ← NEW
    │   ├── Feedback.js              ← NEW
    │   ├── Meeting.js               ← NEW
    │   ├── MeetingAttendee.js       ← NEW
    │   ├── Notification.js          ← NEW
    │   ├── ChatMessage.js           ← NEW
    │   └── ActivityLog.js           ← NEW
    │
    ├── middlewares/
    │   └── authMiddleware.js        ← (updated — add tenantScope middleware)
    │
    ├── utils/
    │   ├── jwtHelper.js
    │   ├── syncPolicies.js
    │   ├── cloudinary.js            ← NEW
    │   ├── multer.js                ← NEW
    │   └── gemini.js                ← NEW
    │
    ├── routes/
    │   ├── authRoutes.js            ← (updated — rate limiter added)
    │   ├── userRoutes.js            ← (updated — auth added to all routes)
    │   ├── tenantRoutes.js
    │   ├── courseRoutes.js          ← (updated — Delete fixed to /:id)
    │   ├── contactRoutes.js         ← (updated — auth added)
    │   ├── superAdminRoutes.js      ← (updated — new routes added)
    │   ├── adminRoutes.js           ← NEW (/Admin/*)
    │   ├── uploadRoutes.js          ← NEW (/Upload/*)
    │   ├── meetingRoutes.js         ← NEW (/Meeting/*)
    │   ├── notificationRoutes.js    ← NEW (/Notification/*)
    │   ├── chatRoutes.js            ← NEW (/Chat/*)
    │   ├── ratingRoutes.js          ← NEW (/Rating/*)
    │   ├── feedbackRoutes.js        ← NEW (/Feedback/*)
    │   ├── analyticsRoutes.js       ← NEW (/Analytics/*)
    │   └── aiRoutes.js              ← NEW (/AI/*)
    │
    ├── controllers/
    │   ├── authController.js
    │   ├── userController.js
    │   ├── tenantController.js
    │   ├── courseController.js      ← (updated)
    │   ├── contactController.js
    │   ├── superAdminController.js  ← (updated)
    │   ├── adminController.js       ← NEW
    │   ├── uploadController.js      ← NEW
    │   ├── meetingController.js     ← NEW
    │   ├── notificationController.js ← NEW
    │   ├── chatController.js        ← NEW
    │   ├── ratingController.js      ← NEW
    │   ├── feedbackController.js    ← NEW
    │   ├── analyticsController.js   ← NEW
    │   └── aiController.js          ← NEW
    │
    └── services/
        ├── authService.js
        ├── userService.js
        ├── tenantService.js
        ├── courseService.js         ← (updated)
        ├── contactService.js
        ├── superAdminService.js     ← (updated)
        ├── adminService.js          ← NEW
        ├── uploadService.js         ← NEW (Cloudinary helpers)
        ├── meetingService.js        ← NEW
        ├── notificationService.js   ← NEW
        ├── chatService.js           ← NEW
        ├── ratingService.js         ← NEW
        ├── feedbackService.js       ← NEW
        ├── analyticsService.js      ← NEW
        └── aiService.js             ← NEW (Gemini subtitles + summary)
*/


// ================================================================
// COMPLETE NEW PACKAGES THAT NEED TO BE INSTALLED
// ================================================================

/*
  npm install cloudinary multer multer-storage-cloudinary
  npm install @google/generative-ai
  npm install googleapis
  npm install express-rate-limit
  npm install nodemailer           ← (for email notifications, optional)

  Summary of .env keys to add:
  ─────────────────────────────────────────────────────────────────
  # Cloudinary
  CLOUDINARY_CLOUD_NAME=
  CLOUDINARY_API_KEY=
  CLOUDINARY_API_SECRET=

  # Gemini AI
  GEMINI_API_KEY=

  # Google OAuth2 (for Meet)
  GOOGLE_CLIENT_ID=
  GOOGLE_CLIENT_SECRET=
  GOOGLE_REDIRECT_URI=
  GOOGLE_REFRESH_TOKEN=

  # Email (Nodemailer)
  EMAIL_HOST=
  EMAIL_PORT=
  EMAIL_USER=
  EMAIL_PASS=
*/


// ================================================================
// PRIORITY ORDER — WHAT TO BUILD FIRST
// ================================================================

/*
  Priority  Feature                      Reason
  ────────────────────────────────────────────────────────────────
  1st       #10 — Validation Fixes       Fix what's broken before adding more
  2nd       #4  — Data Separation        Foundation for all other features
  3rd       #3  — Admin Panel            Core business flow needed right away
  4th       #5  — Cloudinary Upload      Needed for profiles, courses, org logos
  5th       #9  — Notifications          Used by many features after this
  6th       #12 — Rating & Ranking       Core student-facing feature
  7th       #13 — Feedback System        Extends rating, triggers notifications
  8th       #7  — Analytics              Needs rating, feedback, enrollment data
  9th       #8  — Google Meet            Needs notifications to share links
  10th      #6  — Gemini Subtitles       AI enrichment once core is stable
  11th      #11 — AI Chatbot             Advanced feature, needs AI util ready
  12th      #1  — SuperAdmin Enhance     Extend existing, low risk
  13th      #2  — SuperAdmin Extended    Audit logs, pagination, filters
*/




// ================================================================
// FEATURE #14 — ATTENDANCE SYSTEM (Full Flow)
// ================================================================
// Date Added: 2026-02-21
// ================================================================

/*
  PURPOSE:
    A complete attendance management system for the EduVers platform:
    - Admin and Teacher can MARK and UPDATE attendance
    - Students can VIEW their own attendance record
    - Attendance is per-lecture / per-session, tied to a course
    - Summarized % attendance shown per student per course
    - Attendance can be marked as: Present, Absent, Late, Excused

  ─────────────────────────────────────────────────────────────────
  WHO CAN DO WHAT:
  ─────────────────────────────────────────────────────────────────
  Action                          Who
  ────────────────────────────────────────────────────────────────
  Mark attendance for a session   Teacher (own course) + Admin (any course in org)
  Update attendance record        Teacher (own course) + Admin (any course in org)
  View attendance of a student    Admin (all), Teacher (own course), Student (own only)
  View attendance of a course     Admin + Teacher
  View own attendance summary     Student (own records only, scoped to tenant)
  Delete an attendance record     Admin only
  Export attendance report        Admin + Teacher
*/


// ================================================================
// FEATURE #14.1 — ATTENDANCE: DATABASE TABLES
// ================================================================

/*
  ─────────────────────────────────────────────────────────────────
  NEW TABLE: lectures  (A session/class period that can have attendance)
  ─────────────────────────────────────────────────────────────────
  Field             Type        Notes
  id                UUID        PK
  tenant_id         UUID FK     → tenants.id (data separation)
  course_id         UUID FK     → courses.id
  teacher_id        UUID FK     → users.id (teacher conducting the lecture)
  title             STRING      Lecture topic/title
  date              DATEONLY    Date of the lecture
  start_time        TIME        Start time
  end_time          TIME        End time
  room              STRING      Physical/virtual room info
  type              ENUM        "lecture" | "lab" | "tutorial" | "seminar"
  status            ENUM        "scheduled" | "ongoing" | "completed" | "cancelled"
  notes             TEXT        Optional notes about the lecture
  created_at        TIMESTAMP   Auto
  updated_at        TIMESTAMP   Auto

  ─────────────────────────────────────────────────────────────────
  NEW TABLE: attendance  (Per-student per-lecture attendance record)
  ─────────────────────────────────────────────────────────────────
  Field             Type        Notes
  id                UUID        PK
  tenant_id         UUID FK     → tenants.id (data separation)
  lecture_id        UUID FK     → lectures.id (CASCADE delete)
  student_id        UUID FK     → users.id (student)
  course_id         UUID FK     → courses.id (denormalized for fast queries)
  status            ENUM        "present" | "absent" | "late" | "excused"
  marked_by         UUID FK     → users.id or tenants.id (who marked it)
  marked_by_type    ENUM        "teacher" | "admin"
  remarks           TEXT        Optional reason (e.g. "Medical leave")
  marked_at         TIMESTAMP   When attendance was marked
  updated_at        TIMESTAMP   Auto

  UNIQUE CONSTRAINT: (lecture_id, student_id)
  → One record per student per lecture only

  ─────────────────────────────────────────────────────────────────
  VIRTUAL / COMPUTED per course:
  ─────────────────────────────────────────────────────────────────
  attendance_percentage = (present + late) / total_lectures * 100
  → Calculated dynamically in the service (not stored, to stay consistent)
  → Can be cached if needed later
*/


// ================================================================
// FEATURE #14.2 — ATTENDANCE: API ENDPOINTS
// ================================================================

/*
  BASE ROUTES: /Attendance/*  and  /Lecture/*

  ─────────────────────────────────────────────────────────────────
  LECTURE MANAGEMENT:
  ─────────────────────────────────────────────────────────────────

  POST   /Lecture/Create
         Auth: 🔒 authenticate + (teacher | admin via isTenantOwner)
         Body: { courseId, title, date, startTime, endTime, room?, type, notes? }
         Action: Create a new lecture session for a course
         Guard: Teacher must be assigned to the course

  GET    /Lecture/Course/:courseId
         Auth: 🔒 authenticate + (teacher | admin | student with enrollment)
         Returns: All lectures for a course (past + upcoming)
         Query: ?status=completed&from=2026-01-01&to=2026-02-28

  GET    /Lecture/:id
         Auth: 🔒 authenticate
         Returns: Single lecture details

  PATCH  /Lecture/Update/:id
         Auth: 🔒 authenticate + (teacher who owns | admin)
         Body: { title?, date?, startTime?, endTime?, room?, type?, notes?, status? }
         Action: Update lecture details

  DELETE /Lecture/Delete/:id
         Auth: 🔒 authenticate + admin (isTenantOwner)
         Guard: Cannot delete if attendance already marked for it

  ─────────────────────────────────────────────────────────────────
  ATTENDANCE MARKING:
  ─────────────────────────────────────────────────────────────────

  POST   /Attendance/Mark
         Auth: 🔒 authenticate + (teacher | admin)
         Body: {
           lectureId,
           records: [
             { studentId, status: "present" | "absent" | "late" | "excused", remarks? },
             { studentId, status: "present" },
             ...
           ]
         }
         Action: Bulk mark attendance for an entire class (all enrolled students)
         Guard: Lecture must belong to this teacher's course or admin's tenant
         Guard: Cannot mark if lecture is "cancelled"
         Response: { marked: 30, skipped: 2, errors: [] }

  PATCH  /Attendance/Update/:id
         Auth: 🔒 authenticate + (teacher | admin)
         Body: { status, remarks? }
         Action: Update a single student's attendance for a specific lecture
         Guard: Teacher can only update attendance for their own courses

  GET    /Attendance/Lecture/:lectureId
         Auth: 🔒 authenticate + (teacher | admin)
         Returns: All student attendance records for one lecture
         Returns: [{
           student: { id, firstName, lastName },
           status: "present" | "absent" | ...,
           remarks,
           marked_at
         }]

  GET    /Attendance/Student/:studentId
         Auth: 🔒 authenticate + (admin | teacher | student own only)
         Returns: All attendance records for a specific student
         Query: ?courseId=uuid&from=2026-01-01&to=2026-02-28
         Guard: Student can only view their own (studentId === req.user.id)

  GET    /Attendance/Student/:studentId/Summary
         Auth: 🔒 authenticate
         Returns: Per-course attendance summary for a student
         Returns: [{
           course: { id, title },
           totalLectures: 30,
           attended: 25,
           absent: 3,
           late: 2,
           percentage: 83.3
         }]

  GET    /Attendance/Course/:courseId
         Auth: 🔒 authenticate + (teacher | admin)
         Returns: Full attendance matrix for a course
         Returns: {
           students: [...],
           lectures: [...],
           matrix: { studentId: { lectureId: "present"|"absent"|... } }
         }

  GET    /Attendance/Course/:courseId/Summary
         Auth: 🔒 authenticate + (teacher | admin)
         Returns: Per-student attendance percentage for a course
         Returns: [{
           student: { id, firstName, lastName },
           present: 20, absent: 5, late: 2, excused: 1,
           total: 28, percentage: 78.6
         }]

  GET    /Attendance/MyAttendance
         Auth: 🔒 authenticate + student
         Returns: Logged-in student's attendance summary across ALL courses
         Returns: [{
           course: { id, title },
           percentage: 83.3,
           status: "safe" | "warning" | "danger"
           (safe >=75%, warning 60-75%, danger <60%)
         }]

  DELETE /Attendance/Delete/:id
         Auth: 🔒 authenticate + admin only
         Action: Delete a single attendance record

  POST   /Attendance/Export/:courseId
         Auth: 🔒 authenticate + (teacher | admin)
         Returns: CSV/JSON export of full attendance for a course
*/


// ================================================================
// FEATURE #14.3 — ATTENDANCE: REAL-WORLD FLOW
// ================================================================

/*
  ═══════════════════════════════════════════════════════════════
  FLOW 1: Teacher Marks Attendance for a Lecture
  ═══════════════════════════════════════════════════════════════

  Teacher opens a lecture (GET /Lecture/:id)
          │
          ▼
  Gets enrolled students list for that course
  (from enrollments table, scoped to course_id)
          │
          ▼
  Teacher marks attendance for each student:
  POST /Attendance/Mark
  Body: {
    lectureId: "uuid-of-lecture",
    records: [
      { studentId: "s1", status: "present" },
      { studentId: "s2", status: "absent", remarks: "Not in class" },
      { studentId: "s3", status: "late" },
      { studentId: "s4", status: "excused", remarks: "Medical leave" }
    ]
  }
          │
          ▼
  attendanceService.markBulk()
          └── Validate: lecture belongs to teacher's course
          └── Validate: each studentId is enrolled in that course
          └── Insert records (upsert: update if already marked)
          └── Trigger notification to student if absent/excused
          │
          ▼
  Response: { marked: 4, message: "Attendance saved successfully" }

  ═══════════════════════════════════════════════════════════════
  FLOW 2: Student Views Their Own Attendance
  ═══════════════════════════════════════════════════════════════

  Student opens dashboard → hits GET /Attendance/MyAttendance
          │
          ▼
  attendanceService.getStudentSummary(studentId)
          │
          ├── Get all courses student is enrolled in
          ├── For each course:
          │       ├── COUNT total lectures (status !== "cancelled")
          │       ├── COUNT student's "present" + "late" records
          │       ├── Calculate percentage
          │       └── Tag status: safe / warning / danger
          └── Return array of per-course summaries

  ═══════════════════════════════════════════════════════════════
  FLOW 3: Admin Views Full Attendance Matrix for a Course
  ═══════════════════════════════════════════════════════════════

  Admin hits GET /Attendance/Course/:courseId
          │
          ▼
  attendanceService.getCourseMatrix(courseId, tenantId)
          │
          ├── Get all lectures for the course
          ├── Get all enrolled students
          ├── Get all attendance records
          └── Build matrix:
              {
                students: [ {id, name}, ... ],
                lectures: [ {id, date, title}, ... ],
                matrix: {
                  "studentId1": {
                    "lectureId1": "present",
                    "lectureId2": "absent",
                    "lectureId3": "late"
                  },
                  "studentId2": { ... }
                }
              }
*/


// ================================================================
// FEATURE #14.4 — ATTENDANCE: FILES TO CREATE / UPDATE
// ================================================================

/*
  FILES TO CREATE:
  ─────────────────────────────────────────────────────────────────
  src/models/Lecture.js                 ← Lecture session model
  src/models/Attendance.js              ← Attendance record model
  src/services/lectureService.js        ← CRUD for lectures
  src/services/attendanceService.js     ← Mark, update, summarize, matrix
  src/controllers/lectureController.js  ← Handle lecture requests
  src/controllers/attendanceController.js ← Handle attendance requests
  src/routes/lectureRoutes.js           ← /Lecture/* routes
  src/routes/attendanceRoutes.js        ← /Attendance/* routes

  FILES TO UPDATE:
  ─────────────────────────────────────────────────────────────────
  src/models/index.js                   ← Export Lecture + Attendance
  src/services/notificationService.js   ← Notify student on absence
  index.js                              ← Mount /Lecture + /Attendance routes

  NEW .env VARIABLES:
  ─────────────────────────────────────────────────────────────────
  ATTENDANCE_WARNING_THRESHOLD=75       ← % below which it's a warning
  ATTENDANCE_DANGER_THRESHOLD=60        ← % below which it's danger
*/


// ================================================================
// FEATURE #15 — ACADEMIC CALENDAR & SCHEDULE SYSTEM
// (Timetable | Lectures | Events | Holidays | Exam Dates)
// ================================================================

/*
  PURPOSE:
    A unified academic calendar system that manages:
    1. 🗓️  Weekly Timetable  — Per-course recurring class schedule
    2. 📅  Events            — Seminars, workshops, extracurricular
    3. 🎉  Holidays          — Official platform or org-specific holidays
    4. 📝  Exam Dates        — Scheduled exams per course with details
    5. 📖  Lecture Sessions  — Single lecture entries (linked to Feature #14)
    6. 🔔  Notifications     — Auto-notify students about upcoming exams/events

  ─────────────────────────────────────────────────────────────────
  WHO CAN DO WHAT:
  ─────────────────────────────────────────────────────────────────
  Action                          Who
  ────────────────────────────────────────────────────────────────
  Create timetable entry          Admin + Teacher (for own course)
  Update timetable entry          Admin + Teacher
  Delete timetable entry          Admin only
  Create events                   Admin only
  Create holidays                 Admin only (SuperAdmin for all tenants)
  Schedule exam dates             Admin + Teacher
  View all of above               All authenticated users (scoped to tenant)
  Student views own schedule      Student (aggregated: their courses only)
  Export calendar                 Admin + Teacher
*/


// ================================================================
// FEATURE #15.1 — ACADEMIC CALENDAR: DATABASE TABLES
// ================================================================

/*
  ─────────────────────────────────────────────────────────────────
  NEW TABLE: timetable  (Recurring weekly schedule per course)
  ─────────────────────────────────────────────────────────────────
  Field             Type         Notes
  id                UUID         PK
  tenant_id         UUID FK      → tenants.id
  course_id         UUID FK      → courses.id
  teacher_id        UUID FK      → users.id (teacher)
  day_of_week       ENUM         "monday" | "tuesday" | ... | "sunday"
  start_time        TIME         e.g. "09:00"
  end_time          TIME         e.g. "10:30"
  room              STRING       Classroom / virtual link
  type              ENUM         "lecture" | "lab" | "tutorial"
  recurrence_start  DATEONLY     When this schedule begins
  recurrence_end    DATEONLY     When this schedule ends (semester end)
  is_active         BOOLEAN      Default: true
  created_at        TIMESTAMP    Auto
  updated_at        TIMESTAMP    Auto

  ─────────────────────────────────────────────────────────────────
  NEW TABLE: events  (One-time academic or org events)
  ─────────────────────────────────────────────────────────────────
  Field             Type         Notes
  id                UUID         PK
  tenant_id         UUID FK      → tenants.id
  created_by        UUID FK      → tenants.id (admin)
  title             STRING       Event name
  description       TEXT         Detailed description
  event_type        ENUM         "seminar" | "workshop" | "sports" |
                                 "cultural" | "technical" | "other"
  start_date        TIMESTAMP    Event start date & time
  end_date          TIMESTAMP    Event end date & time
  location          STRING       Physical or virtual location
  is_mandatory      BOOLEAN      True if attendance is mandatory
  target_role       ENUM         "all" | "student" | "teacher" | "admin"
  cover_image       TEXT         Cloudinary URL for event poster
  created_at        TIMESTAMP    Auto
  updated_at        TIMESTAMP    Auto

  ─────────────────────────────────────────────────────────────────
  NEW TABLE: holidays  (Org or platform-wide holidays)
  ─────────────────────────────────────────────────────────────────
  Field             Type         Notes
  id                UUID         PK
  tenant_id         UUID FK      → tenants.id (NULL = platform-wide holiday)
  title             STRING       Holiday name (e.g. "Republic Day")
  date              DATEONLY     The holiday date
  holiday_type      ENUM         "national" | "regional" | "org_specific"
  description       TEXT         Optional description
  created_at        TIMESTAMP    Auto

  ─────────────────────────────────────────────────────────────────
  NEW TABLE: exams  (Scheduled exam dates per course)
  ─────────────────────────────────────────────────────────────────
  Field             Type         Notes
  id                UUID         PK
  tenant_id         UUID FK      → tenants.id
  course_id         UUID FK      → courses.id
  teacher_id        UUID FK      → users.id (teacher responsible)
  title             STRING       Exam name (e.g. "Mid-Term Exam")
  exam_type         ENUM         "quiz" | "mid_term" | "final" | "assignment"
                                 | "viva" | "practical" | "other"
  date              DATEONLY     Exam date
  start_time        TIME         Exam start time
  end_time          TIME         Exam end time
  room              STRING       Hall / room / online
  total_marks       INTEGER      Maximum marks
  passing_marks     INTEGER      Minimum to pass
  instructions      TEXT         Exam instructions/rules
  syllabus_covered  TEXT[]       Array of topic headings covered
  status            ENUM         "upcoming" | "ongoing" | "completed" | "cancelled"
  created_at        TIMESTAMP    Auto
  updated_at        TIMESTAMP    Auto

  ─────────────────────────────────────────────────────────────────
  NEW TABLE: exam_results  (After exam is completed)
  ─────────────────────────────────────────────────────────────────
  Field             Type         Notes
  id                UUID         PK
  tenant_id         UUID FK      → tenants.id
  exam_id           UUID FK      → exams.id
  student_id        UUID FK      → users.id
  marks_obtained    DECIMAL      Marks scored
  grade             STRING       Computed grade (A, B, C etc.)
  is_pass           BOOLEAN      Computed: marks_obtained >= passing_marks
  remarks           TEXT         Teacher's remarks
  submitted_at      TIMESTAMP    When result was entered
*/


// ================================================================
// FEATURE #15.2 — ACADEMIC CALENDAR: API ENDPOINTS
// ================================================================

/*
  ─────────────────────────────────────────────────────────────────
  TIMETABLE ROUTES — BASE: /Timetable
  ─────────────────────────────────────────────────────────────────

  POST   /Timetable/Create
         Auth: 🔒 authenticate + (admin | teacher)
         Body: { courseId, dayOfWeek, startTime, endTime, room, type,
                 recurrenceStart, recurrenceEnd }
         Returns: Created timetable entry

  GET    /Timetable/Course/:courseId
         Auth: 🔒 authenticate
         Returns: Full weekly schedule for a course

  GET    /Timetable/MySchedule
         Auth: 🔒 authenticate (student/teacher/admin)
         Returns: Aggregated schedule for logged-in user across all their courses
         (Student: courses enrolled in; Teacher: courses they teach)

  GET    /Timetable/Today
         Auth: 🔒 authenticate
         Returns: Today's schedule for logged-in user (filtered by day_of_week)

  PATCH  /Timetable/Update/:id
         Auth: 🔒 authenticate + (admin | teacher who owns)
         Body: { dayOfWeek?, startTime?, endTime?, room?, isActive? }

  DELETE /Timetable/Delete/:id
         Auth: 🔒 authenticate + admin

  ─────────────────────────────────────────────────────────────────
  EVENTS ROUTES — BASE: /Event
  ─────────────────────────────────────────────────────────────────

  POST   /Event/Create
         Auth: 🔒 authenticate + isTenantOwner + admin
         Body: { title, description, eventType, startDate, endDate,
                 location, isMandatory, targetRole, coverImage? }
         Action: Also sends notification to all target users

  GET    /Event/All
         Auth: 🔒 authenticate
         Returns: All upcoming events for this tenant (sorted by date)
         Query: ?eventType=seminar&from=2026-02-01&to=2026-03-31

  GET    /Event/:id
         Auth: 🔒 authenticate
         Returns: Single event details

  PATCH  /Event/Update/:id
         Auth: 🔒 authenticate + isTenantOwner + admin
         Body: { title?, description?, startDate?, endDate?, location? }

  DELETE /Event/Delete/:id
         Auth: 🔒 authenticate + isTenantOwner + admin

  ─────────────────────────────────────────────────────────────────
  HOLIDAYS ROUTES — BASE: /Holiday
  ─────────────────────────────────────────────────────────────────

  POST   /Holiday/Create
         Auth: 🔒 authenticate + isTenantOwner + admin (org-specific)
              OR superadmin (platform-wide)
         Body: { title, date, holidayType, description? }

  GET    /Holiday/All
         Auth: 🔒 authenticate
         Returns: All holidays (platform-wide + tenant-specific)
         Query: ?year=2026&month=03

  GET    /Holiday/Upcoming
         Auth: 🔒 authenticate
         Returns: Next 5 upcoming holidays from today

  PATCH  /Holiday/Update/:id
         Auth: 🔒 authenticate + admin/superadmin

  DELETE /Holiday/Delete/:id
         Auth: 🔒 authenticate + admin/superadmin

  ─────────────────────────────────────────────────────────────────
  EXAM ROUTES — BASE: /Exam
  ─────────────────────────────────────────────────────────────────

  POST   /Exam/Schedule
         Auth: 🔒 authenticate + (admin | teacher)
         Body: { courseId, title, examType, date, startTime, endTime,
                 room, totalMarks, passingMarks, instructions?, syllabusCovered? }
         Action: Creates exam + auto-notifies all enrolled students

  GET    /Exam/Course/:courseId
         Auth: 🔒 authenticate
         Returns: All exams scheduled for a course (sorted by date)

  GET    /Exam/Upcoming
         Auth: 🔒 authenticate
         Returns: All upcoming exams for logged-in user (across all their courses)

  GET    /Exam/MyExams
         Auth: 🔒 authenticate + student
         Returns: Student's upcoming exams (only enrolled courses)

  GET    /Exam/:id
         Auth: 🔒 authenticate
         Returns: Single exam detail

  PATCH  /Exam/Update/:id
         Auth: 🔒 authenticate + (admin | teacher who owns)
         Body: { title?, date?, startTime?, endTime?, room?, instructions?, status? }
         Action: If date changes → re-notify all enrolled students

  DELETE /Exam/Delete/:id
         Auth: 🔒 authenticate + (admin | teacher)
         Guard: Cannot delete a "completed" exam

  ─────────────────────────────────────────────────────────────────
  EXAM RESULTS ROUTES — BASE: /Exam/Results
  ─────────────────────────────────────────────────────────────────

  POST   /Exam/Results/Enter/:examId
         Auth: 🔒 authenticate + (admin | teacher)
         Body: {
           results: [
             { studentId, marksObtained, remarks? },
             ...
           ]
         }
         Action: Bulk enter results for all students who took this exam
         Auto-computes: grade, isPassed based on passing_marks
         Auto-notifies: each student with their result

  GET    /Exam/Results/:examId
         Auth: 🔒 authenticate + (admin | teacher)
         Returns: All student results for an exam

  GET    /Exam/Results/Student/:studentId
         Auth: 🔒 authenticate + (admin | teacher | student own only)
         Returns: All exam results for a student across all courses
         Guard: Student can only fetch their own results

  GET    /Exam/Results/MyResults
         Auth: 🔒 authenticate + student
         Returns: Logged-in student's exam results

  PATCH  /Exam/Results/Update/:id
         Auth: 🔒 authenticate + (admin | teacher)
         Body: { marksObtained, remarks? }
         Action: Correct a result entry + notify student of change

  ─────────────────────────────────────────────────────────────────
  UNIFIED CALENDAR — BASE: /Calendar
  ─────────────────────────────────────────────────────────────────

  GET    /Calendar/Full
         Auth: 🔒 authenticate
         Query: ?month=02&year=2026
         Returns: Everything for a given month (tenant-scoped):
         {
           timetable: [...recurring slots],
           lectures:  [...individual lecture sessions],
           events:    [...events in this month],
           holidays:  [...holidays in this month],
           exams:     [...exams in this month]
         }
         Note: Student sees only their enrolled courses

  GET    /Calendar/Week
         Auth: 🔒 authenticate
         Returns: Current week's schedule (all types merged, sorted by time)

  GET    /Calendar/Upcoming
         Auth: 🔒 authenticate
         Returns: Next 7 days — events + exams + holidays as a timeline
*/


// ================================================================
// FEATURE #15.3 — ACADEMIC CALENDAR: REAL-WORLD FLOWS
// ================================================================

/*
  ═══════════════════════════════════════════════════════════════
  FLOW 1: Admin Sets Up Semester Schedule
  ═══════════════════════════════════════════════════════════════

  Admin logs in
          │
          ▼
  Step 1: Create timetable entries for each course
          POST /Timetable/Create × N
          { courseId: "math101", dayOfWeek: "monday", startTime: "09:00", ... }
          │
          ▼
  Step 2: Schedule exams for the semester
          POST /Exam/Schedule
          { courseId: "math101", title: "Mid-Term", date: "2026-03-15", ... }
          → Auto-notification sent to all enrolled students!
          │
          ▼
  Step 3: Add holidays for the semester
          POST /Holiday/Create
          { title: "Holi", date: "2026-03-14", holidayType: "national" }
          │
          ▼
  Step 4: Add events (workshops, seminars)
          POST /Event/Create
          { title: "Tech Seminar", eventType: "seminar", startDate: "2026-03-20" }
          → Auto-notification sent to all target users!

  ═══════════════════════════════════════════════════════════════
  FLOW 2: Student Views Their Schedule
  ═══════════════════════════════════════════════════════════════

  Student opens "My Calendar"
          │
          ▼
  GET /Calendar/Full?month=02&year=2026
          │
          ▼
  calendarService.getForUser(studentId, month, year, tenantId)
          │
          ├── Get enrolled course IDs for this student
          │
          ├── Get timetable entries (WHERE course_id IN [...])
          │
          ├── Get individual lectures (WHERE course_id IN [...])
          │
          ├── Get exams (WHERE course_id IN [...] AND status = 'upcoming')
          │
          ├── Get events (WHERE tenant_id = tenantId AND
          │              (target_role = 'all' OR target_role = 'student'))
          │
          └── Get holidays (tenant_id = tenantId OR tenant_id IS NULL)
                   (Platform-wide + org-specific)
          │
          ▼
  Returns merged calendar:
  {
    "2026-02-03": {
      timetable: [ { course: "Math", time: "09:00-10:30", room: "101" } ],
      lectures: [],
      events: [],
      exams: [],
      holidays: []
    },
    "2026-02-14": {
      timetable: [...],
      holidays: [ { title: "Valentine's Day Study Break", type: "org_specific" } ],
      events: [ { title: "Photography Exhibition", location: "Hall 3" } ]
    },
    "2026-02-20": {
      exams: [ { title: "Mid-Term Exam", course: "Math", time: "10:00-12:00" } ]
    }
  }

  ═══════════════════════════════════════════════════════════════
  FLOW 3: Teacher Enters Exam Results
  ═══════════════════════════════════════════════════════════════

  Teacher goes to completed exam → clicks "Enter Results"
          │
          ▼
  GET /Exam/Results/:examId   → get list of students who took exam
          │
          ▼
  Teacher fills in marks for each student (UI form)
          │
          ▼
  POST /Exam/Results/Enter/:examId
  Body: {
    results: [
      { studentId: "s1", marksObtained: 78, remarks: "Good work" },
      { studentId: "s2", marksObtained: 45, remarks: "Needs improvement" },
      { studentId: "s3", marksObtained: 92 }
    ]
  }
          │
          ▼
  examService.bulkEnterResults()
          └── For each result:
                ├── Compute grade (A/B/C/D/F based on %)
                ├── Compute isPassed (marksObtained >= passingMarks)
                └── Insert into exam_results
          └── notificationService.send() to each student:
              "Your Math Mid-Term result is out: 78/100 (Grade B - Passed)"
          │
          ▼
  Response: { entered: 30, failed_count: 3, passed_count: 27 }

  ═══════════════════════════════════════════════════════════════
  FLOW 4: Student Checks Exam Result
  ═══════════════════════════════════════════════════════════════

  Student gets notification → clicks "View Result"
          │
          ▼
  GET /Exam/Results/MyResults
          │
          ▼
  Returns: [{
    exam: { title: "Math Mid-Term", date: "2026-02-20" },
    course: { title: "Mathematics" },
    marksObtained: 78,
    totalMarks: 100,
    passingMarks: 40,
    grade: "B",
    isPassed: true,
    remarks: "Good work"
  }]
*/


// ================================================================
// FEATURE #14 + #15: GRADING SYSTEM (Auto Grade Calculation)
// ================================================================

/*
  When exam results are entered, grades are auto-calculated:

  Marks %          Grade   Status
  ─────────────────────────────────────────────────────────────
  90% and above    A+      Pass
  80% - 89%        A       Pass
  70% - 79%        B       Pass
  60% - 69%        C       Pass
  50% - 59%        D       Pass
  Below 50%        F       Fail

  This logic lives in: src/utils/gradeCalculator.js (new utility)

  Function: calculateGrade(marksObtained, totalMarks, passingMarks)
  Returns: { grade, percentage, isPassed }
*/


// ================================================================
// FEATURE #14 + #15: FILES TO CREATE / UPDATE
// ================================================================

/*
  FILES TO CREATE:
  ─────────────────────────────────────────────────────────────────

  Models:
    src/models/Lecture.js               ← Lecture session (used by attendance too)
    src/models/Attendance.js            ← Per-student per-lecture attendance
    src/models/Timetable.js             ← Recurring weekly schedule
    src/models/Event.js                 ← One-time org events
    src/models/Holiday.js               ← Holidays (org + platform wide)
    src/models/Exam.js                  ← Scheduled exam entries
    src/models/ExamResult.js            ← Student exam results + grades

  Services:
    src/services/lectureService.js      ← Lecture CRUD
    src/services/attendanceService.js   ← Mark, update, matrix, summary
    src/services/timetableService.js    ← Timetable CRUD + today/week views
    src/services/eventService.js        ← Event CRUD + notifications
    src/services/holidayService.js      ← Holiday CRUD + upcoming list
    src/services/examService.js         ← Exam CRUD + schedule + result entry
    src/services/calendarService.js     ← Unified calendar aggregator

  Controllers:
    src/controllers/lectureController.js
    src/controllers/attendanceController.js
    src/controllers/timetableController.js
    src/controllers/eventController.js
    src/controllers/holidayController.js
    src/controllers/examController.js
    src/controllers/calendarController.js

  Routes:
    src/routes/lectureRoutes.js         ← /Lecture/*
    src/routes/attendanceRoutes.js      ← /Attendance/*
    src/routes/timetableRoutes.js       ← /Timetable/*
    src/routes/eventRoutes.js           ← /Event/*
    src/routes/holidayRoutes.js         ← /Holiday/*
    src/routes/examRoutes.js            ← /Exam/*
    src/routes/calendarRoutes.js        ← /Calendar/*

  Utilities:
    src/utils/gradeCalculator.js        ← Grade auto-compute logic
    src/utils/calendarHelpers.js        ← Date grouping helpers

  FILES TO UPDATE:
  ─────────────────────────────────────────────────────────────────
    src/models/index.js                 ← Export all new models
    src/services/notificationService.js ← Notify on exams, events, results
    index.js                            ← Mount all new routes
*/


// ================================================================
// UPDATED MASTER PRIORITY ORDER (Including #14 & #15)
// ================================================================

/*
  Priority  Feature                       Reason
  ────────────────────────────────────────────────────────────────
  1st       #10 — Validation Fixes        Fix broken routes first
  2nd       #4  — Data Separation         Foundation middleware
  3rd       #3  — Admin Panel             Core org flow
  4th       #5  — Cloudinary Upload       Needed for profiles, courses
  5th       #14 — Attendance System       Core educational feature
  6th       #15 — Academic Calendar       Timetable, events, exams, holidays
  7th       #9  — Notifications           Used by exams, events, attendance
  8th       #12 — Rating & Ranking        Student-facing
  9th       #13 — Feedback System         Extends #12
  10th      #7  — Analytics               Needs #14, #15 data
  11th      #8  — Google Meet             Link to timetable/events
  12th      #6  — Gemini Subtitles        AI enrichment
  13th      #11 — AI Chatbot              Advanced AI feature
  14th      #1  — SuperAdmin Enhance      Low risk extension
  15th      #2  — SuperAdmin Extended     Audit logs, pagination

  TOTAL NEW TABLES TO CREATE:
  ─────────────────────────────────────────────────────────────────
  Lecture, Attendance, Timetable, Event, Holiday,
  Exam, ExamResult, Enrollment, Rating, Feedback,
  Meeting, MeetingAttendee, Notification,
  ChatMessage, ActivityLog
  → 15 new tables total
*/


// ================================================================
// SECTION: ALL USER TYPES — COMPLETE ROLES & AUTHORITY BREAKDOWN
// ================================================================
// Date Added: 2026-02-21
// ================================================================

/*
  EduVers has TWO separate database tables for users:
  ────────────────────────────────────────────────────────────────
  TABLE 1: tenants  → Organization-level accounts (org owners)
  TABLE 2: users    → Individual-level accounts (staff + students)

  These are completely separate. Both share the SAME /Auth/Login
  endpoint, but their data and permissions are different.
*/


// ================================================================
// TABLE 1: TENANTS (Organization Accounts)
// ================================================================

/*
  ╔══════════════════════════════════════════════════════════════════╗
  ║  ROLE: superadmin  (Tenant Table)                               ║
  ║  Created By: Auto-assigned to the FIRST ever registration        ║
  ║  Middleware: authenticate + isTenantOwner + authorize("superadmin")║
  ╚══════════════════════════════════════════════════════════════════╝

  WHO IS THIS?
    The platform owner. The very first organization that registered
    on EduVers automatically becomes the superadmin. They oversee
    the entire EduVers platform and all organizations on it.

  WHAT THEY CAN DO:
  ─────────────────────────────────────────────────────────────────
  Platform Management:
    ✅ Create new tenant organizations (become admin tenants)
    ✅ View ALL tenants on the platform (with filters, search, pagination)
    ✅ View any tenant's full profile + all their users
    ✅ Promote admin tenant → superadmin
    ✅ Demote superadmin → admin
    ✅ Suspend / Activate / Deactivate any tenant
    ✅ Delete a tenant (cascades: all users, courses, data deleted)
    ✅ View all users across ALL tenants on the platform
    ✅ View platform-wide statistics & growth analytics

  Notifications:
    ✅ Broadcast announcements to all tenants / all users on the platform
    ✅ Receive: status-change events, system alerts

  Calendar / Scheduling:
    ✅ Create platform-wide holidays (visible to all tenants)
    ✅ Create their own org's schedule, exams, events

  General:
    ✅ Login / Logout / Refresh token
    ✅ Upload org logo (Cloudinary)
    ✅ Update their own org profile
    ✅ Use AI Chatbot
    ✅ View their own org's analytics

  CANNOT:
    ❌ Demote themselves (safety guard — at least 1 superadmin must always exist)
    ❌ Suspend themselves
    ❌ Suspend/demote another superadmin directly (must demote first)
    ❌ Delete their own tenant account

  ROUTES THEY ACCESS:
    /Auth/*          → Login, Logout, Refresh, GetMe
    /Tenant/*        → Register (create), Details, Update self
    /SuperAdmin/*    → ALL routes (exclusive to superadmin)
    /Course/*        → View all courses
    /Notification/*  → Broadcast, view own notifications
    /Holiday/*       → Create platform-wide + org holidays
    /Event/*         → Manage own org events
    /Calendar/*      → View own org calendar
    /Upload/*        → Upload org logo
    /Analytics/*     → Platform stats + org stats


  ╔══════════════════════════════════════════════════════════════════╗
  ║  ROLE: admin  (Tenant Table)                                    ║
  ║  Created By: SuperAdmin via POST /Tenant/Register               ║
  ║  Middleware: authenticate + isTenantOwner + authorize("admin")   ║
  ╚══════════════════════════════════════════════════════════════════╝

  WHO IS THIS?
    An organization owner (e.g. a school, college, or training center)
    registered by the superadmin. They manage their own institution
    and everything within it. They are fully isolated from other orgs.

  WHAT THEY CAN DO:
  ─────────────────────────────────────────────────────────────────
  User Management (within their org only):
    ✅ Create users: students, teachers, sub-admins under their org
    ✅ View all users in their org
    ✅ Update any user's profile in their org
    ✅ Suspend / Activate users in their org
    ✅ Delete users from their org

  Course Management:
    ✅ View all courses in their org
    ✅ (Can create courses if allowed — admin acts as super-teacher)

  Schedule & Calendar:
    ✅ Create and manage the org's timetable
    ✅ Schedule exams for any course in their org
    ✅ Create org-specific holidays
    ✅ Create org events (seminars, workshops, sports days)
    ✅ View full academic calendar for their org

  Attendance:
    ✅ Mark attendance for any lecture in their org
    ✅ Update any attendance record in their org
    ✅ View full attendance matrix for any course
    ✅ Export attendance reports

  Meetings:
    ✅ Create Google Meet sessions for their org
    ✅ Invite any users from their org to meetings
    ✅ Update or cancel meetings

  Feedback & Ratings:
    ✅ View all feedback submitted within their org
    ✅ Delete inappropriate feedback
    ✅ View all ratings in their org

  Notifications:
    ✅ Send announcements to users within their org
    ✅ Receive: user signups, meeting alerts, feedback notifications

  Analytics:
    ✅ View org-level analytics dashboard
    ✅ View student progress, top teachers, top courses
    ✅ View attendance statistics per course/student

  CANNOT:
    ❌ Access /SuperAdmin/* routes
    ❌ See data from other organizations (strictly isolated)
    ❌ Suspend other org admins

  ROUTES THEY ACCESS:
    /Auth/*          → Login, Logout, Refresh, GetMe
    /Tenant/*        → Read + Update own profile
    /Admin/*         → All org-admin routes (exclusive)
    /User/Signup     → Create users in their org
    /Course/*        → View + manage courses in org
    /Lecture/*       → Create, manage lectures
    /Attendance/*    → Mark + manage attendance
    /Timetable/*     → Create + manage timetable
    /Exam/*          → Schedule + manage exams, enter results
    /Event/*         → Create + manage org events
    /Holiday/*       → Create org-specific holidays
    /Meeting/*       → Create + manage meetings
    /Notification/*  → Send org announcements
    /Calendar/*      → View full org calendar
    /Upload/*        → Upload org logo
    /Analytics/*     → Org dashboard + all role stats
    /Feedback/*      → View + delete all org feedback
*/


// ================================================================
// TABLE 2: USERS (Individual Accounts — belong to a tenant)
// ================================================================

/*
  ╔══════════════════════════════════════════════════════════════════╗
  ║  ROLE: teacher  (Users Table)                                   ║
  ║  Created By: Tenant Admin via POST /User/Signup                 ║
  ║  Middleware: authenticate + authorize("teacher")                ║
  ╚══════════════════════════════════════════════════════════════════╝

  WHO IS THIS?
    A faculty member / educator within an organization. They create
    and manage educational content and track their students.

  WHAT THEY CAN DO:
  ─────────────────────────────────────────────────────────────────
  Courses (own courses only):
    ✅ Create new courses (linked to their tenant org)
    ✅ Update their own courses
    ✅ Delete their own courses
    ✅ Upload course thumbnail via Cloudinary
    ✅ Upload course video URL
    ✅ Trigger Gemini AI to generate subtitles + summary for their video

  Lectures & Attendance (own courses only):
    ✅ Create lecture sessions for their courses
    ✅ Mark attendance for students (bulk, per lecture)
    ✅ Update individual attendance records
    ✅ View full attendance matrix for their courses
    ✅ Export attendance data

  Exams (own courses only):
    ✅ Schedule exams (students auto-notified)
    ✅ Update exam details (students re-notified on date change)
    ✅ Enter bulk exam results for all students
    ✅ Update result entries
    ✅ System auto-computes grade (A+, A, B, C, D, F) + pass/fail

  Timetable:
    ✅ Create timetable entries for their own courses
    ✅ Update their timetable entries

  Feedback:
    ✅ View all feedback received from students
    ✅ Respond to feedback messages

  Analytics (own data only):
    ✅ View their own analytics dashboard
    ✅ See: total courses, enrolled students per course, average ratings
    ✅ See: total feedback received, exam pass rates
    ✅ View meetings they're part of

  Notifications:
    ✅ Receive: new feedback, meeting invites, attendance alerts (if any)

  General:
    ✅ Login / Logout / Refresh
    ✅ View + Update own profile
    ✅ Upload profile picture (Cloudinary)
    ✅ Use AI Chatbot
    ✅ View calendar (own lectures + exams + org events + holidays)

  CANNOT:
    ❌ Access /Admin/* or /SuperAdmin/* routes
    ❌ isTenantOwner check will FAIL for all tenant-owner routes
    ❌ Create/manage other users
    ❌ Create org-level meetings, events, holidays
    ❌ See students from other org
    ❌ View other teachers' data
    ❌ Rate courses (teacher cannot rate, only students can)

  ROUTES THEY ACCESS:
    /Auth/*              → Login, Logout, Refresh, GetMe
    /Course/Create       → Create own course
    /Course/Update/:id   → Update own course
    /Course/Delete/:id   → Delete own course
    /Course/All          → View all courses in org
    /Lecture/*           → Create + manage lectures (own courses)
    /Attendance/*        → Mark + update (own courses only)
    /Exam/*              → Schedule + enter results (own courses)
    /Timetable/*         → Create + update (own courses)
    /Feedback/Received   → See received feedback
    /Feedback/Respond    → Reply to feedback
    /Analytics/Teacher   → Own analytics
    /Notification/All    → View own notifications
    /Calendar/*          → View own schedule
    /Upload/ProfilePicture → Own profile picture
    /Upload/CourseThumbnail → Own course images
    /Chat/*              → AI Chatbot access


  ╔══════════════════════════════════════════════════════════════════╗
  ║  ROLE: student  (Users Table)                                   ║
  ║  Created By: Tenant Admin via POST /User/Signup                 ║
  ║  Middleware: authenticate + authorize("student")                ║
  ╚══════════════════════════════════════════════════════════════════╝

  WHO IS THIS?
    The end learner. They consume courses, get graded, and interact
    with the platform as a learner. Strictly view-only for most things.

  WHAT THEY CAN DO:
  ─────────────────────────────────────────────────────────────────
  Courses:
    ✅ View all available courses in their org
    ✅ View a specific course (details, description, tags)
    ✅ Enroll in a course
    ✅ View their enrolled courses
    ✅ View AI-generated subtitles + summary for enrolled course videos

  Attendance:
    ✅ View their OWN attendance records (by course)
    ✅ View their OWN attendance percentage per course
    ✅ See status indicators: 🟢 Safe (≥75%) | 🟡 Warning (60-75%) | 🔴 Danger (<60%)

  Exams & Results:
    ✅ View upcoming exams for their enrolled courses
    ✅ View their own exam results (marks, grade, pass/fail, teacher remarks)
    ✅ Receive notification when result is published

  Calendar & Schedule:
    ✅ View their personal timetable (from enrolled courses)
    ✅ View upcoming exams as calendar events
    ✅ View org events & holidays
    ✅ View today's schedule / current week's schedule

  Ratings:
    ✅ Rate a course they are enrolled in (1-5 stars, once per course)
    ✅ Rate a teacher whose course they enrolled in (once per teacher)
    ✅ Update their own rating
    ✅ Delete their own rating

  Feedback:
    ✅ Submit detailed feedback to a teacher or course
    ✅ Choose to submit anonymously
    ✅ View their own submitted feedback
    ✅ Receive notification if teacher responds

  AI Chatbot:
    ✅ Chat with the AI assistant
    ✅ Ask course-specific questions (AI gets context from course summary)
    ✅ View their chat history

  Notifications:
    ✅ Receive: exam scheduled, exam result published,
              attendance marked absent/excused,
              meeting invite, new course in org,
              feedback response from teacher

  General:
    ✅ Login / Logout / Refresh
    ✅ View + Update own profile
    ✅ Upload own profile picture (Cloudinary)

  CANNOT:
    ❌ Create/update/delete any course
    ❌ Access /Admin/* or /SuperAdmin/* routes
    ❌ Mark attendance
    ❌ Enter exam results
    ❌ See other students' data
    ❌ Create meetings, events, holidays
    ❌ View other students' attendance or results

  ROUTES THEY ACCESS:
    /Auth/*                        → Login, Logout, Refresh, GetMe
    /Course/All                    → View all org courses
    /Course/:id                    → View course details
    /Course/:id/Subtitles          → View AI subtitles + summary
    /Course/Rankings               → View top-rated courses
    /Attendance/MyAttendance       → Own attendance summary
    /Attendance/Student/:id        → Own records (blocked if not own id)
    /Exam/MyExams                  → Upcoming exams for enrolled courses
    /Exam/Results/MyResults        → Own exam results
    /Rating/Course (POST)          → Rate a course
    /Rating/Teacher (POST)         → Rate a teacher
    /Rating/Update / Delete        → Own ratings only
    /Feedback/Submit               → Submit feedback
    /Feedback/Mine                 → Own submitted feedback
    /Chat/Message                  → AI Chatbot
    /Chat/History                  → Chat history
    /Notification/All              → Own notifications
    /Notification/Read/:id         → Mark read
    /Calendar/Full                 → Own calendar view
    /Calendar/Week                 → This week's schedule
    /Calendar/Upcoming             → Next 7 days
    /Timetable/MySchedule          → Own timetable
    /Timetable/Today               → Today's classes
    /Upload/ProfilePicture         → Own profile picture


  ╔══════════════════════════════════════════════════════════════════╗
  ║  ROLE: admin  (Users Table — Sub-Admin / helper)                ║
  ║  Created By: Tenant Admin via POST /User/Signup                 ║
  ║  Middleware: authenticate + authorize("admin")                  ║
  ╚══════════════════════════════════════════════════════════════════╝

  WHO IS THIS?
    ⚠️ IMPORTANT: This is NOT the same as the tenant "admin".
    This "admin" is in the USERS table.
    They FAIL the isTenantOwner middleware check.
    They are a helper/staff role within an organization.

  CURRENT STATUS: This role has limited privileges compared to the
  tenant admin. It's a planned role for expansion.

  WHAT THEY CURRENTLY CAN DO (same as student + teacher combined):
    ✅ Everything a student can do
    ✅ (Future) View org users (if explicitly allowed in routes)
    ✅ (Future) Mark attendance with proper middleware updates

  WHAT THEY CURRENTLY CANNOT DO (due to isTenantOwner blocking):
    ❌ Create users (isTenantOwner blocks this)
    ❌ Access /Admin/* tenant-owner exclusive routes
    ❌ Create meetings, events, holidays
    ❌ View org-wide analytics
    ❌ Access /SuperAdmin/* routes

  FUTURE PLAN FOR THIS ROLE:
    → Add a new middleware: isUserAdmin
    → Allow user-level admins to:
       - View users in their org (read-only)
       - Mark attendance on behalf of a teacher
       - Manage their own assigned courses
    → They still CANNOT create users or access tenant-level actions
*/


// ================================================================
// QUICK COMPARISON TABLE — ALL ROLES SIDE BY SIDE
// ================================================================

/*
  Action                              superadmin  admin(T)  teacher  student  admin(U)
  ─────────────────────────────────────────────────────────────────────────────────────
  First platform registration         ✅         ❌       ❌      ❌      ❌
  Create tenant org accounts          ✅         ❌       ❌      ❌      ❌
  Promote / Demote tenants            ✅         ❌       ❌      ❌      ❌
  Suspend any tenant                  ✅         ❌       ❌      ❌      ❌
  View all orgs on platform           ✅         ❌       ❌      ❌      ❌
  View all users on platform          ✅         ❌       ❌      ❌      ❌
  Platform-wide stats                 ✅         ❌       ❌      ❌      ❌
  Platform-wide holidays              ✅         ❌       ❌      ❌      ❌
  Broadcast to all tenants            ✅         ❌       ❌      ❌      ❌
  ─────────────────────────────────────────────────────────────────────────────────────
  Create users (in own org)           ✅         ✅      ❌      ❌      ❌
  View own org users                  ✅         ✅      ❌      ❌      🔜
  Suspend/delete own org users        ✅         ✅      ❌      ❌      ❌
  ─────────────────────────────────────────────────────────────────────────────────────
  Create courses                      ✅         ✅      ✅      ❌      ❌
  Update/delete own courses           ✅         ✅      ✅      ❌      ❌
  Enroll in courses                   ❌         ❌      ❌      ✅      ❌
  View courses                        ✅         ✅      ✅      ✅      ✅
  ─────────────────────────────────────────────────────────────────────────────────────
  Create / manage lectures            ✅         ✅      ✅      ❌      ❌
  Mark attendance                     ✅         ✅      ✅      ❌      ❌
  Update attendance                   ✅         ✅      ✅      ❌      ❌
  View own attendance                 ❌         ❌      ❌      ✅      ✅
  Export attendance report            ✅         ✅      ✅      ❌      ❌
  ─────────────────────────────────────────────────────────────────────────────────────
  Schedule exams                      ✅         ✅      ✅      ❌      ❌
  Enter exam results                  ✅         ✅      ✅      ❌      ❌
  View own exam results               ❌         ❌      ❌      ✅      ✅
  ─────────────────────────────────────────────────────────────────────────────────────
  Rate a course / teacher             ❌         ❌      ❌      ✅      ❌
  Submit feedback                     ❌         ❌      ❌      ✅      ❌
  Respond to feedback                 ❌         ❌      ✅      ❌      ❌
  View all org feedback               ✅         ✅      ❌      ❌      ❌
  ─────────────────────────────────────────────────────────────────────────────────────
  Create meetings (Google Meet)       ✅         ✅      ❌      ❌      ❌
  Attend meetings                     ✅         ✅      ✅      ✅      ✅
  ─────────────────────────────────────────────────────────────────────────────────────
  Create org events                   ✅         ✅      ❌      ❌      ❌
  Create org holidays                 ✅         ✅      ❌      ❌      ❌
  View events & holidays              ✅         ✅      ✅      ✅      ✅
  ─────────────────────────────────────────────────────────────────────────────────────
  Platform analytics                  ✅         ❌      ❌      ❌      ❌
  Org analytics                       ✅         ✅      ❌      ❌      ❌
  Teacher analytics                   ❌         ❌      ✅      ❌      ❌
  Student analytics                   ❌         ❌      ❌      ✅      ❌
  ─────────────────────────────────────────────────────────────────────────────────────
  AI Chatbot                          ✅         ✅      ✅      ✅      ✅
  Gemini subtitles (trigger)          ❌         ❌      ✅      ❌      ❌
  Gemini subtitles (view)             ✅         ✅      ✅      ✅      ✅
  ─────────────────────────────────────────────────────────────────────────────────────
  Upload profile picture              ✅         ✅      ✅      ✅      ✅
  Upload org logo                     ✅         ✅      ❌      ❌      ❌
  Upload course thumbnail             ❌         ❌      ✅      ❌      ❌
  ─────────────────────────────────────────────────────────────────────────────────────
  (T) = Tenant Table  |  (U) = Users Table  |  🔜 = Planned future access
*/


// ================================================================
// ADDITIONAL FEATURES TO IMPLEMENT (Beyond #1–#15)
// ================================================================

/*
  Here are MORE features that would make EduVers a complete
  enterprise-grade EdTech platform:

  ─────────────────────────────────────────────────────────────────
  #16 — COURSE ENROLLMENT SYSTEM
  ─────────────────────────────────────────────────────────────────
  Currently there is no enrollment table (needed by rating, attendance,
  AI chatbot context, analytics). This must be built first.

  Key APIs:
    POST  /Course/Enroll/:courseId         Student enrolls in a course
    GET   /Course/MyEnrollments            Student sees their enrolled courses
    GET   /Course/:id/Students             Teacher sees enrolled students (own course)
    DELETE /Course/Unenroll/:courseId      Student withdraws from a course
    PATCH /Course/Progress/:courseId       Student updates progress %

  New Table: enrollments
    { id, tenant_id, student_id, course_id, progress(0-100), enrolled_at, completed_at }

  ─────────────────────────────────────────────────────────────────
  #17 — ASSIGNMENT SYSTEM
  ─────────────────────────────────────────────────────────────────
  Teachers create assignments for students. Students upload their
  submissions. Teacher grades them.

  Key APIs:
    POST  /Assignment/Create               Teacher creates assignment
    GET   /Assignment/Course/:courseId     All assignments for a course
    GET   /Assignment/MyAssignments        Student's pending + submitted
    POST  /Assignment/Submit/:id           Student submits (file URL via Cloudinary)
    PATCH /Assignment/Grade/:submissionId  Teacher grades a submission
    GET   /Assignment/Results/:id          View submissions for an assignment

  New Tables: assignments, assignment_submissions
    assignments: { id, course_id, teacher_id, tenant_id, title, description,
                   due_date, total_marks, attachment_url, status }
    submissions: { id, assignment_id, student_id, tenant_id, file_url,
                   submitted_at, marks, grade, teacher_remarks }

  ─────────────────────────────────────────────────────────────────
  #18 — LIVE CHAT / MESSAGING SYSTEM (Student ↔ Teacher)
  ─────────────────────────────────────────────────────────────────
  Direct messaging within the platform (NOT the AI chatbot).
  Students can message their course teacher. Teacher can reply.
  Admin can view conversations if needed.

  Technology: Socket.IO for real-time messaging

  Key APIs:
    POST  /Message/Send                    Send a message
    GET   /Message/Conversations           All conversations of logged-in user
    GET   /Message/Conversation/:userId    Messages between two users
    PATCH /Message/Read/:conversationId    Mark messages as read

  New Tables: conversations, messages
    conversations: { id, tenant_id, participant1_id, participant2_id, last_message_at }
    messages: { id, conversation_id, sender_id, content, is_read, created_at }

  ─────────────────────────────────────────────────────────────────
  #19 — COURSE CONTENT / MATERIAL MANAGEMENT
  ─────────────────────────────────────────────────────────────────
  Teachers can upload multiple files/materials for a course:
  PDFs, slides, notes, additional videos, links.
  Students download or view them.

  Key APIs:
    POST  /Material/Upload                 Teacher uploads file/link
    GET   /Material/Course/:courseId       All materials for a course
    DELETE /Material/Delete/:id            Teacher/Admin deletes
    GET   /Material/:id                    Download / View material

  New Table: course_materials
    { id, tenant_id, course_id, teacher_id, title, type("pdf"|"video"|"link"|"slides"),
      file_url, size, is_free(bool), created_at }

  ─────────────────────────────────────────────────────────────────
  #20 — PAYMENT / SUBSCRIPTION SYSTEM (Future Monetization)
  ─────────────────────────────────────────────────────────────────
  If EduVers wants to charge tenants (SaaS pricing), or if orgs
  want to charge students for premium courses:

  Key Features:
    - Subscription plans for tenants (Basic, Pro, Enterprise)
    - Per-course payment for premium courses
    - Payment history + invoice generation
    - Razorpay / Stripe integration

  Key APIs:
    POST  /Payment/Checkout                Create payment intent
    POST  /Payment/Webhook                 Razorpay/Stripe webhook
    GET   /Payment/History                 User's payment history
    GET   /Payment/Invoices                Download invoice PDF

  New Tables: subscriptions, payments, invoices

  ─────────────────────────────────────────────────────────────────
  #21 — CERTIFICATE GENERATION (PDF)
  ─────────────────────────────────────────────────────────────────
  When a student completes a course (100% progress) or passes a
  final exam, auto-generate a completion certificate as a PDF.

  Technology: pdfkit or puppeteer (HTML → PDF)

  Key APIs:
    POST  /Certificate/Generate/:courseId  Generate certificate for student
    GET   /Certificate/My                  View / download own certificates
    GET   /Certificate/Verify/:code        Public URL to verify a certificate

  New Table: certificates
    { id, tenant_id, student_id, course_id, certificate_code(unique),
      issued_at, pdf_url(Cloudinary) }

  ─────────────────────────────────────────────────────────────────
  #22 — VIDEO CONFERENCING (WebRTC / Daily.co / Agora)
  ─────────────────────────────────────────────────────────────────
  Beyond Google Meet links — an embedded live class within the
  platform itself. Teacher starts a live class, students join
  without leaving the EduVers dashboard.

  Technology: Daily.co API or Agora.io SDK

  Key APIs:
    POST  /LiveClass/Start                 Teacher starts a live class room
    GET   /LiveClass/Join/:roomId          Student gets join token
    PATCH /LiveClass/End                   Teacher ends the class
    GET   /LiveClass/Recordings            View past recorded sessions

  ─────────────────────────────────────────────────────────────────
  #23 — ANNOUNCEMENT / NOTICE BOARD
  ─────────────────────────────────────────────────────────────────
  Admin posts announcements visible on all users' dashboards.
  Different from notifications (those are event-triggered).
  This is manual broadcast posts like a digital notice board.

  Key APIs:
    POST  /Notice/Post                     Admin posts notice
    GET   /Notice/All                      All users view notices (org-scoped)
    PATCH /Notice/Pin/:id                  Pin important notices
    DELETE /Notice/Delete/:id              Admin deletes

  New Table: notices
    { id, tenant_id, posted_by, title, content, is_pinned,
      target_role("all"|"student"|"teacher"), expires_at, created_at }

  ─────────────────────────────────────────────────────────────────
  #24 — STUDENT PROGRESS TRACKING (Learning Path)
  ─────────────────────────────────────────────────────────────────
  Track exactly which lectures a student has watched/completed
  within a course. Show % progress per lecture.

  Key APIs:
    PATCH /Progress/Lecture/:lectureId     Mark lecture as watched
    GET   /Progress/Course/:courseId       Get detailed progress for a course
    GET   /Progress/MyAll                  Overall progress across all courses

  New Table: lecture_progress
    { id, tenant_id, student_id, lecture_id, course_id,
      watched_duration(seconds), is_completed, watched_at }

  ─────────────────────────────────────────────────────────────────

  FULL FEATURE COUNT SUMMARY:
  ─────────────────────────────────────────────────────────────────
  Already Planned (#1–#15):   15 features
  Additional (#16–#24):        9 features
  ─────────────────────────────────────────────────────────────────
  TOTAL FEATURES:              24 features

  TOTAL NEW TABLES (all features combined):
  enrollments, ratings, feedback, notifications, chat_messages,
  meetings, meeting_attendees, activity_logs, lectures, attendance,
  timetable, events, holidays, exams, exam_results,
  assignments, assignment_submissions, conversations, messages,
  course_materials, subscriptions, payments, certificates,
  notices, lecture_progress
  → 25 new database tables total

  TOTAL NEW ROUTE GROUPS:
  /Auth /User /Tenant /Course /Contact /SuperAdmin (existing = 6)
  /Admin /Upload /Meeting /Notification /Chat /Rating /Feedback
  /Analytics /AI /Lecture /Attendance /Timetable /Event /Holiday
  /Exam /Calendar /Progress /Assignment /Material /Notice
  /Message /Certificate /LiveClass /Payment
  → 24 new route groups (30 total)
*/


// ================================================================
// END OF DOCUMENTATION
// ================================================================
