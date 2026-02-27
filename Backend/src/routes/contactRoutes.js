const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

router.post("/Create", contactController.CreateContact);
router.get("/Comments", authenticate, authorize("admin", "superadmin"), contactController.GetComments);
router.delete("/delete/:id", authenticate, authorize("admin", "superadmin"), contactController.DeleteContact);

module.exports = router;
