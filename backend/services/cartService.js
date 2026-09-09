const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

const addToCart = async (userId, { product: productId, quantity = 1 }) => {
  if (!productId) {
    const error = new Error("Product ID is required");
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const parsedQty = Math.max(1, parseInt(quantity, 10) || 1);

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity = parsedQty;
  } else {
    cart.items.push({ product: productId, quantity: parsedQty });
  }

  await cart.save();
  return Cart.findById(cart._id).populate("items.product");
};

const removeFromCart = async (userId, productId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    const error = new Error("Cart not found");
    error.statusCode = 404;
    throw error;
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId.toString()
  );

  await cart.save();
  return Cart.findById(cart._id).populate("items.product");
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
};

