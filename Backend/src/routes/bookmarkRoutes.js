const express = require("express");
const router = express.Router();
const bookmarkController = require("../controllers/bookmarkController");
const { authenticate } = require("../middlewares/authMiddleware");

// Require authentication for all bookmark routes
router.use(authenticate);

router.post("/add", bookmarkController.addBookmark);
router.post("/remove", bookmarkController.removeBookmark);
router.get("/my-bookmarks", bookmarkController.getUserBookmarks);
router.get("/check/:courseId", bookmarkController.isBookmarked);

module.exports = router;
