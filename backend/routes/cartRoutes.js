const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeItemFromCart,
  clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Secure all routes under this file

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route('/:itemId')
  .put(updateCartItem)
  .delete(removeItemFromCart);

module.exports = router;
