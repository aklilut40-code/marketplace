const userService = require("../services/userService");

// GET /api/users/me
const getMe = async (req, res, next) => {
  try {
    const user = await userService.getUserProfile(req.user._id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/me
const updateMe = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await userService.updateUserProfile(req.user._id, { name, email });
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// GET /api/users  (admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMe, updateMe, getAllUsers };
