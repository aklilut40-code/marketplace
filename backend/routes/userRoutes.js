const express = require("express");
const router = express.Router();
const { getMe, updateMe, getAllUsers } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.get("/", protect, authorize("admin"), getAllUsers);

module.exports = router;
