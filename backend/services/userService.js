const User = require("../models/User");

const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const updateUserProfile = async (userId, { name, email }) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (email && email !== user.email) {
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing && existing._id.toString() !== userId.toString()) {
      const error = new Error("Email is already taken");
      error.statusCode = 400;
      throw error;
    }
    user.email = email.toLowerCase().trim();
  }

  if (name) {
    user.name = name.trim();
  }

  await user.save();
  return user;
};

const getAllUsers = async () => {
  return User.find().select("-password").sort({ createdAt: -1 });
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
};

