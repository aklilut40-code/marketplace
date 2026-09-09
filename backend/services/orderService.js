const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

const createOrder = async (userId, items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    const error = new Error("Order must contain at least one item");
    error.statusCode = 400;
    throw error;
  }

  let totalPrice = 0;
  const orderItems = [];

  for (const item of items) {
    if (!item.product || !item.quantity || item.quantity < 1) {
      const error = new Error("Invalid item format in order");
      error.statusCode = 400;
      throw error;
    }

    const product = await Product.findById(item.product);
    if (!product) {
      const error = new Error(`Product ${item.product} not found`);
      error.statusCode = 404;
      throw error;
    }

    if (product.quantity < item.quantity) {
      const error = new Error(
        `Not enough stock for "${product.name}". Available: ${product.quantity}, requested: ${item.quantity}`
      );
      error.statusCode = 400;
      throw error;
    }

    // Snapshot name and price at purchase time
    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    });

    totalPrice += product.price * item.quantity;

    // Decrement stock
    product.quantity -= item.quantity;
    await product.save();
  }

  const order = await Order.create({
    user: userId,
    items: orderItems,
    totalPrice: Math.round(totalPrice * 100) / 100,
    status: "pending",
  });

  // Clear ordered items from the user's cart if any
  const cart = await Cart.findOne({ user: userId });
  if (cart) {
    const orderedProductIds = items.map((i) => i.product.toString());
    cart.items = cart.items.filter(
      (cartItem) => !orderedProductIds.includes(cartItem.product.toString())
    );
    await cart.save();
  }

  return order;
};

const getOrdersByUser = async (userId) => {
  return Order.find({ user: userId }).sort({ createdAt: -1 });
};

const getOrderById = async (id, user) => {
  const order = await Order.findById(id).populate("user", "name email");
  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  if (
    user &&
    user.role !== "admin" &&
    user.role !== "seller" &&
    order.user._id.toString() !== user._id.toString()
  ) {
    const error = new Error("Not authorized to view this order");
    error.statusCode = 403;
    throw error;
  }

  return order;
};

const updateOrderStatus = async (id, status) => {
  const validStatuses = ["pending", "paid", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    const error = new Error(
      `Invalid order status. Allowed: ${validStatuses.join(", ")}`
    );
    error.statusCode = 400;
    throw error;
  }

  const order = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).populate("user", "name email");

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  return order;
};

module.exports = {
  createOrder,
  getOrdersByUser,
  getOrderById,
  updateOrderStatus,
};
