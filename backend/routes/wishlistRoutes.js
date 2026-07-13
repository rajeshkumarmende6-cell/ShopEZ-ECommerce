const express = require('express');
const { getWishlist, toggleWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Secure all routes

router.route('/')
  .get(getWishlist);

router.route('/toggle')
  .post(toggleWishlist);

module.exports = router;
