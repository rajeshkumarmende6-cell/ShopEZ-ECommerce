# ShopEZ - Premium Production-Ready E-Commerce Platform

ShopEZ is a robust, full-stack, production-grade e-commerce application built using modern web development practices. It provides a secure shopping experience with JWT authentication, a responsive product catalog, dynamic address management, live wishlist/cart synchronizations, and Stripe payment gateway checkout flows.

---

## 🚀 Key Features

### 🔐 Authentication & Security
- Secure Email/Password registration with **bcrypt** hashing.
- One-Time-Password (OTP) email verification using **Nodemailer**.
- Access tokens managed via **JWT** cookies.
- Password retrieval/reset flows.
- API security middlewares: **helmet** headers protection, **express-rate-limit** requests throttling, **mongo-sanitize** injection locks, and **cors** options.

### 🛍️ Shopper Experience
- Responsive product catalog with advanced keyword search, price sliders, category routing, and paginations.
- Dynamic gallery thumbnail view.
- 5-star product reviews with average ratings recalculations.
- Guest shopping carts saved in `localStorage` which seamlessly sync to user database records upon login.
- Default address selection with automatic toggles.

### 💳 Checkout & Payments
- Stripe payment gateway integration with simulated test card support.
- Live order status updates (Processing, Shipped, Delivered, Cancelled).
- Automatic stock deduction upon successful purchases.
- Secured item verification against inventory boundaries.

### 📊 Admin Operations
- Summary dashboard metrics: total revenue, order count, product count, user count.
- Low-stock inventory alert banners.
- Categories CRUD management (automatic slugs generation).
- Product listings CRUD management with multiple image attachment support.
- System accounts management & administrative role escalation toggles.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS v4.0, React Router DOM, React Hook Form, Axios, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB, Mongoose ODM.
- **Mail Services**: Nodemailer (via Gmail or SMTP).
- **Payment Gateway**: Stripe.

---

## 📂 Folder Structure

```
ShopEZ/
├── backend/
│   ├── config/              # DB connection and configurations
│   ├── controllers/         # Express controllers (Auth, Products, Cart, Orders, Admin)
│   ├── middleware/          # JWT protect and admin role guards
│   ├── models/              # Mongoose DB schemas (User, Product, Cart, Address, Order, Review)
│   ├── routes/              # Express Router mapping
│   ├── services/            # Stripe & Nodemailer drivers
│   ├── utils/               # Custom ErrorHandler classes
│   ├── app.js               # Express application config
│   └── server.js            # Server listener entry point
└── frontend/
    ├── src/
    │   ├── assets/          # Static assets & icons
    │   ├── components/      # Common UI components (Navbar, Footer, Skeletons)
    │   ├── context/         # Auth, Theme, Cart, and Wishlist React providers
    │   ├── hooks/           # Custom helpers (useAuth, useCart, useWishlist)
    │   ├── layouts/         # MainLayout & AdminLayout templates
    │   ├── pages/           # Store pages (Home, Products, Details, Checkout, Orders)
    │   │   └── admin/       # Admin console pages
    │   ├── services/        # Axios API client wrapper
    │   ├── App.jsx          # Route registry
    │   ├── index.css        # Tailwind directives
    │   └── main.jsx         # App bootstrapping
    ├── vite.config.js       # Vite configuration
    └── package.json
```

---

## ⚙️ Setting Up Locally

### Prerequisites
- Node.js installed.
- MongoDB running locally (`mongodb://127.0.0.1:27017/shopez`).

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/shopez
   JWT_SECRET=yoursecretkey123456789
   JWT_EXPIRE=30d
   COOKIE_EXPIRE=30
   
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SERVICE=gmail
   SMTP_MAIL=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   
   STRIPE_SECRET_KEY=sk_test_mockstripekey5173abcdefghijk
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 🔌 API Endpoints Reference

### 🔐 Authentication Routes (`/api/v1/auth`)
- `POST /register`: Registers new user account (returns verification OTP email).
- `POST /login`: Logs in user (sets HTTP-only cookie with JWT).
- `GET /logout`: Clears login cookies.
- `POST /forgot-password`: Generates reset token and sends link.
- `PUT /reset-password/:token`: Overwrites password with new credentials.
- `GET /verify-email/:token`: Activates account status.

### 🛍️ Storefront Routes
- `GET /products`: Fetches product grid (supports query parameters `keyword`, `category`, `price`, `page`, `sort`).
- `GET /products/:id`: Retrieves individual item specs.
- `POST /products/:id/reviews`: Submits a customer product review (1-5 stars).
- `GET /categories`: Lists categories.

### 🛒 Cart & Wishlist Routes (Protected)
- `GET /cart` & `POST /cart`: Manages cart items.
- `PUT /cart/:itemId`: Updates product purchase quantity.
- `DELETE /cart/:itemId`: Removes item.
- `DELETE /cart`: Empties cart.
- `POST /wishlist/toggle`: Likes/unlikes a product.

### 📦 Order & Checkout Routes (Protected)
- `POST /orders`: Initializes order and returns Stripe PaymentIntent clientSecret.
- `POST /orders/:id/confirm`: Confirms Stripe PaymentIntent, deducts stock, and clears cart.
- `GET /orders/me`: Lists customer's orders history.
- `GET /orders/:id`: Fetches specific transaction receipt.

### 📊 Admin Console Routes (Restricted)
- `GET /admin/stats`: Retrieves revenue totals, inventory alerts, and category shares.
- `GET /admin/users` & `PUT /admin/users/:id`: Manages registered profiles and updates roles.
- `POST /products` & `PUT /products/:id`: Uploads new products (multipart image support).
- `POST /categories` & `PUT /categories/:id`: Manages catalog categories.
- `PUT /orders/:id`: Updates shipment coordinates (Shipped/Delivered).
