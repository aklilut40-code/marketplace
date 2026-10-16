require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// --- Register Mongoose models ---
require("./models/User");
require("./models/Category");
require("./models/Product");
require("./models/Cart");
require("./models/Order");
require("./models/Review");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// --- Core middleware ---
// CORS: allow common local dev origins by default, and allow overriding via CLIENT_URLS env var
const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://marketplace-frontend-cm21.onrender.com",
];

const allowedOrigins = (process.env.CLIENT_URLS && process.env.CLIENT_URLS.trim() !== ""
  ? process.env.CLIENT_URLS
  : defaultOrigins.join(",")
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  express.json()
);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (curl, mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy: origin not allowed"), false);
    },
    credentials: true,
  })
);

// --- Static file serving for uploads ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Routes ---
app.get("/", (req, res) => res.send("Marketplace API is running"));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

// new routes: conversations & deals
const conversationRoutes = require('./routes/conversationRoutes');
const dealRoutes = require('./routes/dealRoutes');
app.use('/api/conversations', conversationRoutes);
app.use('/api/deals', dealRoutes);

// --- Error handling (must come after routes) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start listening if run directly
if (process.env.NODE_ENV !== "test") {
  const http = require('http');
  const { initSocket } = require('./socket');

  connectDB().then(() => {
    const server = http.createServer(app);
    const io = initSocket(server);
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}

module.exports = app;
