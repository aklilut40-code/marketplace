require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Category = require("./models/Category");
const Product = require("./models/Product");
const Review = require("./models/Review");
const Cart = require("./models/Cart");
const Order = require("./models/Order");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/marketplace");
    console.log("Connected to MongoDB for seeding...");

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Review.deleteMany({}),
      Cart.deleteMany({}),
      Order.deleteMany({}),
    ]);
    console.log("Cleared existing data.");

    // Seed Users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("password123", salt);

    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: passwordHash,
      role: "admin",
    });

    const seller = await User.create({
      name: "Acme Store (Seller)",
      email: "seller@example.com",
      password: passwordHash,
      role: "seller",
    });

    const customer = await User.create({
      name: "John Customer",
      email: "customer@example.com",
      password: passwordHash,
      role: "customer",
    });

    console.log("Created users (password: password123):");
    console.log(" - Admin: admin@example.com");
    console.log(" - Seller: seller@example.com");
    console.log(" - Customer: customer@example.com");

    // Seed Categories
    const electronics = await Category.create({
      name: "Electronics",
      description: "Gadgets, audio, computing and mobile accessories",
    });

    const home = await Category.create({
      name: "Home & Kitchen",
      description: "Furniture, appliances, and home decor",
    });

    const books = await Category.create({
      name: "Books",
      description: "Fiction, non-fiction, technical and art books",
    });

    // Seed Products
    const p1 = await Product.create({
      name: "Wireless Noise-Cancelling Headphones",
      description: "Premium over-ear headphones with active noise cancellation and 40h battery life.",
      price: 199.99,
      quantity: 25,
      category: electronics._id,
      seller: seller._id,
      images: [],
    });

    const p2 = await Product.create({
      name: "Mechanical Keyboard Pro",
      description: "Compact 75% hot-swappable mechanical keyboard with RGB backlighting.",
      price: 129.5,
      quantity: 15,
      category: electronics._id,
      seller: seller._id,
      images: [],
    });

    const p3 = await Product.create({
      name: "Pour-Over Coffee Maker",
      description: "Borosilicate glass carafe with permanent stainless steel mesh filter.",
      price: 34.99,
      quantity: 40,
      category: home._id,
      seller: seller._id,
      images: [],
    });

    const p4 = await Product.create({
      name: "Clean Code Handbook",
      description: "Classic guide on software craftsmanship, readable code, and best practices.",
      price: 42.0,
      quantity: 50,
      category: books._id,
      seller: admin._id,
      images: [],
    });

    console.log("Created sample categories and products.");

    // Seed Review
    await Review.create({
      product: p1._id,
      user: customer._id,
      rating: 5,
      comment: "Incredible sound quality and battery lasts for days!",
    });
    console.log("Created initial review.");

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedData();

