const productService = require("../services/productService");

// GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const products = await productService.getAllProducts({ category, search });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id
const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// POST /api/products  (seller or admin)
const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body, req.user._id);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id  (seller or admin)
const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body, req.user);
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// POST /api/products/:id/images  (seller or admin)
const uploadProductImage = async (req, res, next) => {
  try {
    const filename = req.file ? req.file.filename : null;
    const product = await productService.addProductImage(req.params.id, filename, req.user);
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id  (seller or admin)
const deleteProduct = async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  uploadProductImage,
  deleteProduct,
};
