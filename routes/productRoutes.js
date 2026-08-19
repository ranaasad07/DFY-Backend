const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  seedProducts,
} = require("../controllers/productController");

router.get("/", getProducts);
router.get("/seed", seedProducts);
router.get("/:id", getProductById);

module.exports = router;
