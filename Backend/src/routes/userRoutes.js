const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authorize, authenticate, isTenantOwner } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");
const { validateUserSignup, validateUserUpdate, validateIdParam, validateEmailParam } = require("../middlewares/validation.middleware");

// Public signup - only tenant owners can create users via admin panel
router.post("/Signup", validateUserSignup, userController.CreateUser);
router.get("/Details/:email", validateEmailParam, authenticate, userController.getuserDetails);
router.get("/AllUsers", authenticate, tenantScope, authorize("admin", "superadmin"), userController.getAllUsers);
router.patch("/Update/:id", validateIdParam, validateUserUpdate, authenticate, userController.UpdateUsers);
router.delete("/Delete", authenticate, tenantScope, authorize("admin", "superadmin"), userController.DeleteUser);
module.exports = router;
