const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  uploadProductImage,
  deleteProduct,
} = require("../controllers/productController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const reviewRoutes = require("./reviewRoutes");

// Re-route into other resource routers
router.use("/:productId/reviews", reviewRoutes);

router.get("/", getProducts);
router.get("/:id", getProduct);

router.post("/", protect, authorize("seller", "admin"), createProduct);
router.put("/:id", protect, authorize("seller", "admin"), updateProduct);
router.post(
  "/:id/images",
  protect,
  authorize("seller", "admin"),
  upload.single("image"),
  uploadProductImage
);
router.delete("/:id", protect, authorize("seller", "admin"), deleteProduct);

module.exports = router;
