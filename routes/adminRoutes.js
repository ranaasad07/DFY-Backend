// const express = require("express");

// const router = express.Router();

// const {
//   getDashboardStats,
//   getAllUsers,
//   deleteUser,
// } = require("../controllers/adminController");

// const authMiddleware = require("../middleware/authMiddleware");
// const adminMiddleware = require("../middleware/adminMiddleware");

// // Every route below requires:
// // 1. valid JWT
// // 2. admin role

// router.use(authMiddleware);
// router.use(adminMiddleware);

// // Dashboard statistics
// router.get(
//   "/stats",
//   getDashboardStats
// );

// // Get all users
// router.get(
//   "/users",
//   getAllUsers
// );

// // Delete user
// router.delete(
//   "/users/:id",
//   deleteUser
// );

// module.exports = router;

const express = require("express");

const router = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
  getAllContacts,
  updateContactStatus,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// protection
router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

router.get("/orders", getAllOrders);
router.patch("/orders/:id", updateOrderStatus);

router.get("/contacts", getAllContacts);
router.patch("/contacts/:id", updateContactStatus);

router.get("/products", getAllProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

module.exports = router;
