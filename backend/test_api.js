require("dotenv").config();
const http = require("http");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const app = require("./server");

let server;
let port;
let baseUrl;

const request = (method, urlPath, headers = {}, body = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { ...headers },
    };

    let payload = null;
    if (body) {
      if (headers["Content-Type"]?.includes("multipart/form-data")) {
        payload = body;
      } else if (typeof body === "object") {
        payload = JSON.stringify(body);
        options.headers["Content-Type"] = "application/json";
        options.headers["Content-Length"] = Buffer.byteLength(payload);
      }
    }

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch (_) {}
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
};

const runTests = async () => {
  console.log("Starting API Integration Test Suite...\n");
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/marketplace");

  server = app.listen(0);
  port = server.address().port;
  baseUrl = `http://localhost:${port}`;
  console.log(`Test server running on ${baseUrl}\n`);

  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  };

  try {
    // 1. Auth Tests
    console.log("1. Testing Auth Endpoints...");
    const regRes = await request("POST", "/api/auth/register", {}, {
      name: "Test Seller",
      email: `seller_${Date.now()}@test.com`,
      password: "password123",
      role: "seller",
    });
    assert(regRes.status === 201, "Register seller returns 201");
    assert(regRes.body.token, "Register response includes JWT token");
    assert(regRes.body.user.role === "seller", "User registered with seller role");
    const sellerToken = regRes.body.token;
    const sellerId = regRes.body.user.id;

    const custRes = await request("POST", "/api/auth/register", {}, {
      name: "Test Customer",
      email: `customer_${Date.now()}@test.com`,
      password: "password123",
      role: "customer",
    });
    assert(custRes.status === 201, "Register customer returns 201");
    const customerToken = custRes.body.token;

    const loginRes = await request("POST", "/api/auth/login", {}, {
      email: custRes.body.user.email,
      password: "password123",
    });
    assert(loginRes.status === 200, "Login returns 200");
    assert(loginRes.body.token, "Login returns token");

    // 2. Product Tests
    console.log("\n2. Testing Product Endpoints...");
    const createProdRes = await request(
      "POST",
      "/api/products",
      { Authorization: `Bearer ${sellerToken}` },
      {
        name: "Test Wireless Headphones",
        description: "Great sound",
        price: 89.99,
        quantity: 10,
      }
    );
    assert(createProdRes.status === 201, "Create product returns 201 for seller");
    const productId = createProdRes.body._id;

    const getProdsRes = await request("GET", "/api/products?search=Wireless");
    assert(getProdsRes.status === 200, "Get products with search query returns 200");
    assert(Array.isArray(getProdsRes.body) && getProdsRes.body.length > 0, "Found matching product in search");

    const getProdRes = await request("GET", `/api/products/${productId}`);
    assert(getProdRes.status === 200, "Get single product returns 200");
    assert(getProdRes.body.name === "Test Wireless Headphones", "Product name matches");

    const updateProdRes = await request(
      "PUT",
      `/api/products/${productId}`,
      { Authorization: `Bearer ${sellerToken}` },
      { price: 79.99 }
    );
    assert(updateProdRes.status === 200, "Update product returns 200");
    assert(updateProdRes.body.price === 79.99, "Price successfully updated");

    // Test multipart image upload
    const boundary = "----WebKitFormBoundaryTest123456";
    const sampleImageContent = Buffer.from([0xff, 0xd8, 0xff, 0xe0]); // Minimal JPEG header
    const multipartBody = Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="sample.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`
      ),
      sampleImageContent,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const uploadRes = await request(
      "POST",
      `/api/products/${productId}/images`,
      {
        Authorization: `Bearer ${sellerToken}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": multipartBody.length,
      },
      multipartBody
    );
    assert(uploadRes.status === 200, "Upload product image returns 200");
    assert(uploadRes.body.images?.length > 0, "Product images list updated with uploaded file");

    // 3. Review Tests (nested under /api/products/:productId/reviews)
    console.log("\n3. Testing Review Endpoints...");
    const createRevRes = await request(
      "POST",
      `/api/products/${productId}/reviews`,
      { Authorization: `Bearer ${customerToken}` },
      { rating: 5, comment: "Awesome headphones!" }
    );
    assert(createRevRes.status === 201, "Create review returns 201");
    assert(createRevRes.body.rating === 5, "Review rating is 5");
    const reviewId = createRevRes.body._id;

    // Enforce 1 review per user per product
    const dupRevRes = await request(
      "POST",
      `/api/products/${productId}/reviews`,
      { Authorization: `Bearer ${customerToken}` },
      { rating: 4, comment: "Another review should fail" }
    );
    assert(dupRevRes.status === 400, "Duplicate review returns 400 (one review per user enforced)");

    const getRevsRes = await request("GET", `/api/products/${productId}/reviews`);
    assert(getRevsRes.status === 200, "Get product reviews returns 200");
    assert(getRevsRes.body.length === 1, "Review found in listing");

    // 4. Cart Tests
    console.log("\n4. Testing Cart Endpoints...");
    const getCartRes = await request("GET", "/api/cart", {
      Authorization: `Bearer ${customerToken}`,
    });
    assert(getCartRes.status === 200, "Get cart auto-creates and returns 200");

    const addCartRes = await request(
      "POST",
      "/api/cart",
      { Authorization: `Bearer ${customerToken}` },
      { product: productId, quantity: 2 }
    );
    assert(addCartRes.status === 200, "Add to cart returns 200");
    assert(addCartRes.body.items?.length === 1, "Cart contains 1 item");
    assert(addCartRes.body.items[0].quantity === 2, "Cart item quantity is 2");

    // 5. Order Tests
    console.log("\n5. Testing Order Endpoints...");
    const createOrderRes = await request(
      "POST",
      "/api/orders",
      { Authorization: `Bearer ${customerToken}` },
      { items: [{ product: productId, quantity: 2 }] }
    );
    assert(createOrderRes.status === 201, "Create order returns 201");
    assert(createOrderRes.body.totalPrice === 159.98, "Order totalPrice correctly calculated (79.99 * 2 = 159.98)");
    assert(createOrderRes.body.items[0].name === "Test Wireless Headphones", "Product name snapshotted in order line item");
    assert(createOrderRes.body.items[0].price === 79.99, "Product price snapshotted in order line item");
    const orderId = createOrderRes.body._id;

    // Check stock was decremented from 10 to 8
    const checkStockProd = await request("GET", `/api/products/${productId}`);
    assert(checkStockProd.body.quantity === 8, "Product quantity decremented from 10 to 8");

    const getOrdersRes = await request("GET", "/api/orders", {
      Authorization: `Bearer ${customerToken}`,
    });
    assert(getOrdersRes.status === 200, "Get user orders returns 200");
    assert(getOrdersRes.body.length === 1, "Found placed order in history");

    const getSingleOrderRes = await request("GET", `/api/orders/${orderId}`, {
      Authorization: `Bearer ${customerToken}`,
    });
    assert(getSingleOrderRes.status === 200, "Get single order returns 200");

    const updateStatusRes = await request(
      "PUT",
      `/api/orders/${orderId}/status`,
      { Authorization: `Bearer ${sellerToken}` },
      { status: "shipped" }
    );
    assert(updateStatusRes.status === 200, "Seller updates order status to shipped");
    assert(updateStatusRes.body.status === "shipped", "Order status is now shipped");

    // 6. User Endpoints
    console.log("\n6. Testing User Endpoints...");
    const getMeRes = await request("GET", "/api/users/me", {
      Authorization: `Bearer ${customerToken}`,
    });
    assert(getMeRes.status === 200, "Get /api/users/me returns 200");
    assert(getMeRes.body.name === "Test Customer", "User profile matches");

    const updateMeRes = await request(
      "PUT",
      "/api/users/me",
      { Authorization: `Bearer ${customerToken}` },
      { name: "Updated Customer Name" }
    );
    assert(updateMeRes.status === 200, "Update /api/users/me returns 200");
    assert(updateMeRes.body.name === "Updated Customer Name", "User name updated");

    // Clean up review and product
    console.log("\n7. Testing Deletion Permissions...");
    const delRevRes = await request(
      "DELETE",
      `/api/products/${productId}/reviews/${reviewId}`,
      { Authorization: `Bearer ${customerToken}` }
    );
    assert(delRevRes.status === 200, "Owner deletes review successfully");

    const delProdRes = await request(
      "DELETE",
      `/api/products/${productId}`,
      { Authorization: `Bearer ${sellerToken}` }
    );
    assert(delProdRes.status === 200, "Seller deletes product successfully");

    console.log(`\n========================================`);
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    server.close();
    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Test execution failed:", err);
    if (server) server.close();
    await mongoose.connection.close();
    process.exit(1);
  }
};

runTests();
