const express = require('express');
const {
  createOrder,
  confirmOrderPayment,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Secure all order routes

// User specific list
router.get('/me', myOrders);

// Order creation and confirmation
router.post('/', createOrder);
router.post('/:id/confirm', confirmOrderPayment);

// Single order details (owner or admin)
router.get('/:id', getSingleOrder);

// Admin dashboard routes
router.get('/', authorize('admin'), getAllOrders);
router.put('/:id', authorize('admin'), updateOrderStatus);

module.exports = router;
