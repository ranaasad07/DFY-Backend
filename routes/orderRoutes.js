const express = require("express");
const router = express.Router();
const { createOrder, getMyOrders } = require("../controllers/orderController");
const protect = require("../middleware/authMiddleware");

// Create order can be called by logged in user or guest
router.post(
  "/",
  (req, res, next) => {
    // Optional protect middleware check
    if (req.cookies && req.cookies.token) {
      return protect(req, res, next);
    }
    next();
  },
  createOrder,
);

router.get("/my-orders", protect, getMyOrders);

module.exports = router;
