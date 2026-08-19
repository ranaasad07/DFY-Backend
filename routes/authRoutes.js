// // routes/authRoutes.js
// // ------------------------------------------------------------------
// // Defines the URL endpoints and connects each one to a controller
// // function. Keeping routes separate from logic (controllers) makes
// // the codebase easier to navigate for new devs.
// // ------------------------------------------------------------------

// const express = require("express");
// const router = express.Router();
// const {
//   registerUser,
//   loginUser,
//   googleAuth,
//   logoutUser,
//   getMe,
// } = require("../controllers/authController");
// const { protect } = require("../middleware/authMiddleware");

// // Public routes (no login required)
// router.post("/signup", registerUser);
// router.post("/login", loginUser);
// router.post("/google", googleAuth);
// router.post("/logout", logoutUser);

// // Protected route - "protect" middleware runs first
// router.get("/me", protect, getMe);

// module.exports = router;

const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  googleAuth,
  logoutUser,
  getMe,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Google Login
router.post("/google", googleAuth);

// Logout
router.post("/logout", logoutUser);

// Current user
router.get("/me", authMiddleware, getMe);

module.exports = router;
