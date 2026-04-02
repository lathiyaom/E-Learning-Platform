const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticate, isTenantOwner, authorize } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");
const { 
  validateAdminUserCreate, 
  validateUserUpdate, 
  validateIdParam 
} = require("../middlewares/validation.middleware");

// All admin routes require authentication, tenant ownership, and admin/superadmin role
router.use(authenticate);
router.use(isTenantOwner);
router.use(tenantScope);
router.use(authorize("admin", "superadmin"));

// GET /Admin/MyUsers - Get all users within tenant
router.get("/MyUsers", adminController.getMyUsers);

// GET /Admin/MyUsers/:id - Get specific user by ID
router.get("/MyUsers/:id", validateIdParam, adminController.getUserById);

// POST /Admin/CreateUser - Create a new user
router.post("/CreateUser", validateAdminUserCreate, adminController.createUser);

// PATCH /Admin/UpdateUser/:id - Update user details
router.patch("/UpdateUser/:id", validateIdParam, validateUserUpdate, adminController.updateUser);

// PATCH /Admin/SuspendUser/:id - Suspend a user
router.patch("/SuspendUser/:id", validateIdParam, adminController.suspendUser);

// PATCH /Admin/ActivateUser/:id - Activate a suspended user
router.patch("/ActivateUser/:id", validateIdParam, adminController.activateUser);

// DELETE /Admin/DeleteUser/:id - Delete a user
router.delete("/DeleteUser/:id", validateIdParam, adminController.deleteUser);

module.exports = router;
