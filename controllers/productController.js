const Product = require("../models/Product");
const path = require("path");
const fs = require("fs");

// Seed products from initial json data if DB is empty
const seedProducts = async (req, res) => {
  try {
    const jsonPath = path.join(
      __dirname,
      "../../dfy-store/data/allproducts.json",
    );
    if (fs.existsSync(jsonPath)) {
      const rawData = fs.readFileSync(jsonPath, "utf-8");
      const productsData = JSON.parse(rawData);

      await Product.deleteMany({});
      const seeded = await Product.insertMany(productsData);
      return res.status(201).json({
        message: "Products seeded successfully",
        count: seeded.length,
        products: seeded,
      });
    } else {
      return res
        .status(404)
        .json({ message: "Seed data file allproducts.json not found" });
    }
  } catch (error) {
    console.error("Seed products error:", error);
    return res.status(500).json({ message: "Error seeding products" });
  }
};

// GET /api/products
// Query parameters: category, search, featured, isNew
const getProducts = async (req, res) => {
  try {
    const { category, search, featured, isNew } = req.query;

    const query = {};

    if (category && category.toLowerCase() !== "all") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (featured === "true") {
      query.featured = true;
    }

    if (isNew === "true") {
      // Frontend sends `isNew`; store uses `isNewProduct` to avoid mongoose reserved key
      query.isNewProduct = true;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (error) {
    console.error("getProducts error:", error);
    return res.status(500).json({ message: "Failed to fetch products" });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    let product;
    // Check if numeric id or Mongo ObjectId
    if (!isNaN(Number(id))) {
      product = await Product.findOne({ id: Number(id) });
    } else {
      product = await Product.findById(id);
    }

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("getProductById error:", error);
    return res.status(500).json({ message: "Error loading product" });
  }
};

module.exports = {
  seedProducts,
  getProducts,
  getProductById,
};
