const orderService = require("../services/orderService");

// POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const { items } = req.body;
    const order = await orderService.createOrder(req.user._id, items);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getOrdersByUser(req.user._id);
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id
const getOrder = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user);
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// PUT /api/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getMyOrders, getOrder, updateOrderStatus };
