# Marketplace Backend API

A production-grade RESTful API for a full-stack Marketplace application built with Node.js, Express, MongoDB, and Mongoose.

## Architecture & Flow

Strict multi-tiered architecture is enforced for every single request:

```
React Frontend → HTTP Request → Express Server → Middleware → Router → Controller → Service → Mongoose Model → MongoDB
                                                                                                      │
React Frontend ← HTTP Response ← Express Server ← Error Middleware ← Controller ← Service ◄───────────┘
```

- **Router**: Maps HTTP methods and paths to controller functions with zero logic.
- **Controller**: Reads `req`, calls exactly one service function, shapes `res`.
- **Service**: Encapsulates all business logic, data validation, calculations, multi-model coordination, and Mongoose queries. Throws plain `Error` objects with `.statusCode` properties.
- **Model**: Mongoose schemas only with field validation, references, and `{ timestamps: true }`.
- **Centralized Error Middleware**: Intercepts any error forwarded via `next(error)` and returns `{ message, stack }`.

## Prerequisites

- **Node.js**: v18+ (tested on Node v24)
- **MongoDB**: Running locally on `mongodb://localhost:27017` or a remote MongoDB Atlas URI.

## Setup & Installation

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Variables in `.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/marketplace
   JWT_SECRET=marketplace_secret_jwt_key_2026_secure
   NODE_ENV=development
   ```

4. Seed the Database with Demo Data:
   ```bash
   npm run seed
   ```
   This creates demo accounts:
   - **Admin**: `admin@example.com` / `password123`
   - **Seller**: `seller@example.com` / `password123`
   - **Customer**: `customer@example.com` / `password123`

5. Start the Development Server:
   ```bash
   npm run dev
   ```
   The server will start listening on `http://localhost:5000`.

6. Run the Automated Integration Test Suite:
   ```bash
   NODE_ENV=test node test_api.js
   ```

## API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new customer or seller (`name`, `email`, `password`, `role`) |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT token (`email`, `password`) |

### Products (`/api/products`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | Fetch products. Supports `?category=` and `?search=` filters |
| `GET` | `/api/products/:id` | Public | Fetch product details by ID |
| `POST` | `/api/products` | Seller, Admin | Create a new product listing |
| `PUT` | `/api/products/:id` | Seller, Admin | Update an existing product listing |
| `POST` | `/api/products/:id/images` | Seller, Admin | Upload product image (`multipart/form-data`, field: `image`) |
| `DELETE` | `/api/products/:id` | Seller, Admin | Delete a product listing |

### Reviews (`/api/products/:productId/reviews`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products/:productId/reviews` | Public | Retrieve all reviews for a product |
| `POST` | `/api/products/:productId/reviews` | Logged in | Submit review (`rating`: 1-5, `comment`). Enforces 1 review per user |
| `DELETE` | `/api/products/:productId/reviews/:reviewId` | Owner, Admin | Delete a review |

### Cart (`/api/cart`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/cart` | Logged in | Retrieve user's cart (auto-creates empty cart if none exists) |
| `POST` | `/api/cart` | Logged in | Add/update item quantity (`product`, `quantity`) |
| `DELETE` | `/api/cart/:productId` | Logged in | Remove an item from the cart |

### Orders (`/api/orders`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/orders` | Logged in | Create order. Validates stock, decrements quantity, snapshots price/name |
| `GET` | `/api/orders` | Logged in | Fetch logged-in user's order history |
| `GET` | `/api/orders/:id` | Logged in | Retrieve order receipt details |
| `PUT` | `/api/orders/:id/status` | Seller, Admin | Update order fulfillment status (`pending`, `paid`, `shipped`, `delivered`, `cancelled`) |

### Users (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users/me` | Logged in | Fetch current user profile |
| `PUT` | `/api/users/me` | Logged in | Update current user profile (`name`, `email`) |
| `GET` | `/api/users` | Admin only | Fetch all registered users in system |

## File Uploads & Static Assets
- Uploaded files are stored in `backend/uploads/` via Multer.
- Images are served statically from `http://localhost:5000/uploads/<filename>`.

