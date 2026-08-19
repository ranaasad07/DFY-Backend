const Order = require("../models/Order");

// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { customerName, customerEmail, items, totalAmount, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order must contain at least one item." });
    }

    if (!customerName || !customerEmail || !shippingAddress) {
      return res.status(400).json({ success: false, message: "Missing shipping or customer details." });
    }

    const order = await Order.create({
      user: req.user ? req.user.userId : null,
      customerName,
      customerEmail,
      items,
      totalAmount,
      shippingAddress,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order,
    });
  } catch (error) {
    console.error("createOrder error:", error);
    return res.status(500).json({ success: false, message: "Failed to place order." });
  }
};

// GET /api/orders/my-orders
const getMyOrders = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const orders = await Order.find({ user: req.user.userId }).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    console.error("getMyOrders error:", error);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};

module.exports = { createOrder, getMyOrders };
