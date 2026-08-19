const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    subCategory: {
      type: String,
      default: "",
    },
    brand: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    discountPrice: {
      type: Number,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      default: 10,
    },
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      default: "/products/imgimg.png",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    // "isNew" is a reserved mongoose pathname; use `isNewProduct` instead.
    isNewProduct: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Product", productSchema);
