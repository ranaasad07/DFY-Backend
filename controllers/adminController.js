// const User = require("../models/User");
// const Order = require("../models/Order");
// const Product = require("../models/Product");

// exports.getDashboardStats = async (req, res) => {
//   const users = await User.countDocuments();

//   const products = await Product.countDocuments();

//   const orders = await Order.countDocuments();

//   res.json({
//     users,
//     products,
//     orders,
//   });
// };

// exports.getAllUsers = async (req, res) => {
//   const users = await User.find().select("-password");

//   res.json(users);
// };

// exports.deleteUser = async (req, res) => {
//   await User.findByIdAndDelete(req.params.id);

//   res.json({
//     message: "User deleted",
//   });
// };

const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Contact = require("../models/Contact");

// Dashboard cards
exports.getDashboardStats = async (req, res) => {
  try {
    const [users, products, orders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
    ]);

    res.json({
      users,
      products,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed loading stats",
    });
  }
};

// All users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed loading users",
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "User deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Delete failed",
    });
  }
};

// All orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed loading orders" });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Order status is required" });
    }

    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed updating order status" });
  }
};

// All contacts
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Failed loading contacts" });
  }
};

// Update contact status
exports.updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Contact status is required" });
    }

    const validStatuses = ["unread", "read", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid contact status" });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: "Failed updating contact status" });
  }
};

// All products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed loading products" });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const {
      id,
      name,
      category,
      price,
      discountPrice,
      rating,
      reviews,
      stock,
      sizes,
      colors,
      image,
      featured,
      isNew,
      description,
      subCategory,
      brand,
    } = req.body;

    if (!name || !category || !price) {
      return res
        .status(400)
        .json({ message: "Name, category, and price are required" });
    }

    let productId = id;
    if (!productId) {
      const lastProduct = await Product.findOne().sort({ id: -1 }).select("id");
      productId = lastProduct ? lastProduct.id + 1 : 1;
    }

    const product = await Product.create({
      id: productId,
      name,
      category,
      price,
      discountPrice,
      rating,
      reviews,
      stock,
      sizes,
      colors,
      image,
      featured,
      isNewProduct: isNew,
      description,
      subCategory,
      brand,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed creating product" });
  }
};

const resolveProductFilter = (id) => {
  if (!id) return null;
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    return { _id: id };
  }
  return { id: Number(id) };
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.isNew !== undefined) {
      updates.isNewProduct = updates.isNew;
      delete updates.isNew;
    }

    const filter = resolveProductFilter(req.params.id);
    const product = await Product.findOneAndUpdate(filter, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed updating product" });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const filter = resolveProductFilter(req.params.id);
    const product = await Product.findOneAndDelete(filter);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed deleting product" });
  }
};
