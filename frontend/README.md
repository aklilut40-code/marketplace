# React + Vite
# Marketplace Frontend Application

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.
A modern single-page application for the full-stack Marketplace web application built with React, Vite, React Router, Context API, and Axios.

Currently, two official plugins are available:
## Features

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)
- **Product Catalog & Search**: Filter products by category, search by name/description in real-time.
- **Product Details & Reviews**: View high-resolution image galleries, stock status, ratings breakdown, submit reviews (1 review per product enforced), and delete own reviews.
- **Cart Management**: Synchronized with `/api/cart`, item quantity stepper, real-time totals, line removal.
- **Order Checkout & Receipts**: Place orders with inventory checks, view snapshotted line items (name and price preserved from purchase time), track status.
- **Seller Management Dashboard**: Dedicated `/my-products` interface for sellers and admins to create, edit, delete listings and upload product images (`multipart/form-data`).
- **Authentication**: JWT token management with persistence in `localStorage`, role-based route guards (`customer`, `seller`, `admin`).

## React Compiler
## Prerequisites

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).
- **Node.js**: v18+
- **Backend Server**: Running at `http://localhost:5000`

## Expanding the Oxlint configuration
## Setup & Installation

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables (Optional):
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Variables in `.env`:
   ```env
   # Optional: Only needed if targeting a non-localhost backend
   VITE_API_URL=http://localhost:5000
   ```

4. Start Vite Development Server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.
   Requests to `/api/*` are automatically proxied to `http://localhost:5000` via `vite.config.js`.

5. Build for Production:
   ```bash
   npm run build
   ```

## Frontend Folder Structure

```
frontend/
├── src/
│   ├── api/                    # 1:1 mapped backend route callers
│   │   ├── authApi.js          # POST /api/auth/register, POST /api/auth/login
│   │   ├── productApi.js       # GET/POST/PUT/DELETE /api/products, POST /api/products/:id/images
│   │   ├── cartApi.js          # GET/POST/DELETE /api/cart
│   │   ├── orderApi.js         # POST/GET /api/orders, GET /api/orders/:id, PUT /api/orders/:id/status
│   │   ├── reviewApi.js        # GET/POST /api/products/:productId/reviews, DELETE .../:reviewId
│   │   ├── userApi.js          # GET/PUT /api/users/me, GET /api/users
│   │   └── client.js           # Axios instance + JWT interceptor + resolveImageUrl()
│   ├── context/
│   │   ├── AuthContext.jsx     # User state, token persistence, login/register/logout
│   │   └── CartContext.jsx     # Cart state synchronized with /api/cart
│   ├── components/
│   │   ├── Navbar.jsx          # Top navigation with cart counter & role badges
│   │   ├── ProductCard.jsx     # Catalog card with image preview & Add to Cart
│   │   └── PrivateRoute.jsx    # Route guard with optional role authorization
│   ├── pages/
│   │   ├── Home.jsx            # Product feed with hero banner & filters
│   │   ├── ProductDetail.jsx   # Product info, gallery & reviews
│   │   ├── Cart.jsx            # Cart overview & checkout
│   │   ├── Orders.jsx          # User purchase history
│   │   ├── OrderDetail.jsx     # Snapshotted receipt & seller status update
│   │   ├── Login.jsx           # User login with demo credentials
│   │   ├── Register.jsx        # Account registration with role selection
│   │   └── MyProducts.jsx      # Seller dashboard with product & image uploads
│   ├── App.jsx                 # Route definitions
│   ├── main.jsx                # Application root with context providers
│   └── index.css               # Design system & styles
├── vite.config.js               # Dev-server proxy configuration
└── package.json
```

## API Client & Image Resolution

- **API Client (`src/api/client.js`)**: Base Axios client with an interceptor that automatically attaches `Authorization: Bearer <token>` from `localStorage` to all authenticated requests.
- **Image Resolution (`resolveImageUrl(imagePath)`)**: Resolves static uploaded images served from the backend's `/uploads` path separately from the `/api` proxy.
