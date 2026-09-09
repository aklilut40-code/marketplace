const cartService = require("../services/cartService");

// GET /api/cart
const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user._id);
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

// POST /api/cart
const addToCart = async (req, res, next) => {
  try {
    const { product, quantity } = req.body;
    const cart = await cartService.addToCart(req.user._id, { product, quantity });
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/:productId
const removeFromCart = async (req, res, next) => {
  try {
    const cart = await cartService.removeFromCart(req.user._id, req.params.productId);
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
};

