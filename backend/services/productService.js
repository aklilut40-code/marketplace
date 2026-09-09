const Product = require("../models/Product");

const getAllProducts = async (filters = {}) => {
  const query = {};

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }

  return Product.find(query)
    .populate("category", "name")
    .populate("seller", "name email role")
    .sort({ createdAt: -1 });
};

const getProductById = async (id) => {
  const product = await Product.findById(id)
    .populate("category", "name description")
    .populate("seller", "name email role");

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  return product;
};

const createProduct = async (data, sellerId) => {
  if (!data.name || data.price === undefined) {
    const error = new Error("Product name and price are required");
    error.statusCode = 400;
    throw error;
  }

  return Product.create({ ...data, seller: sellerId });
};

const updateProduct = async (id, data, user) => {
  const product = await Product.findById(id);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  if (user && user.role !== "admin" && product.seller.toString() !== user._id.toString()) {
    const error = new Error("Not authorized to update this product");
    error.statusCode = 403;
    throw error;
  }

  Object.assign(product, data);
  await product.save();
  return product;
};

const addProductImage = async (id, filename, user) => {
  if (!filename) {
    const error = new Error("No image file provided");
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(id);
  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  if (user && user.role !== "admin" && product.seller.toString() !== user._id.toString()) {
    const error = new Error("Not authorized to update this product");
    error.statusCode = 403;
    throw error;
  }

  product.images.push(filename);
  await product.save();
  return product;
};

const deleteProduct = async (id, user) => {
  const product = await Product.findById(id);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  if (user && user.role !== "admin" && product.seller.toString() !== user._id.toString()) {
    const error = new Error("Not authorized to delete this product");
    error.statusCode = 403;
    throw error;
  }

  await Product.findByIdAndDelete(id);
  return { message: "Product deleted" };
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  addProductImage,
  deleteProduct,
};
