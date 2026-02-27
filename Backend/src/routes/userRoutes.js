const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authorize, authenticate, isTenantOwner } = require("../middlewares/authMiddleware");
const tenantScope = require("../middlewares/tenantScope.middleware");

// Only tenant owners (from tenants table) can create users — user-level admins cannot
// router.post("/Signup", authenticate, isTenantOwner, authorize("admin", "superadmin"), userController.CreateUser);
router.post("/Signup", userController.CreateUser);
router.get("/Details/:email", authenticate, userController.getuserDetails);
router.get("/AllUsers", authenticate, tenantScope, authorize("admin", "superadmin"), userController.getAllUsers);
router.patch("/Update/:id", authenticate, userController.UpdateUsers);
router.delete("/Delete", authenticate, tenantScope, authorize("admin", "superadmin"), userController.DeleteUser);
module.exports = router;
