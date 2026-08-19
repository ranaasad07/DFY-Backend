require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const contactRoutes = require("./routes/contactRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const Product = require("./models/Product");

// 1. Connect to MongoDB
connectDB();

const app = express();

// 2. Global middleware

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow Postman/mobile/no origin
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
// 2. Global middleware
// app.use(express.json());
// app.use(cookieParser());

// const allowedOrigins = [
//   process.env.CLIENT_URL || 'http://localhost:3000',
//   'http://localhost:3000',
//   'http://127.0.0.1:3000',
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//         callback(null, true);
//       } else {
//         callback(null, true); // Allow during development
//       }
//     },
//     credentials: true,
//   })
// );

// Auto-seed products if DB collection is empty
const autoSeedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      const jsonPath = path.join(
        __dirname,
        "../dfy-store/data/allproducts.json",
      );
      if (fs.existsSync(jsonPath)) {
        const rawData = fs.readFileSync(jsonPath, "utf-8");
        const productsData = JSON.parse(rawData);
        await Product.insertMany(productsData);
        console.log(`Auto-seeded ${productsData.length} products into MongoDB`);
      }
    }
  } catch (err) {
    console.error("Auto-seed products error:", err.message);
  }
};
autoSeedProducts();

// 3. API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "DFY Store API is running" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
