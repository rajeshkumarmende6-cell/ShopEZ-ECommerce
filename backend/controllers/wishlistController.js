const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const ErrorHandler = require('../utils/errorHandler');

// @desc    Get user's wishlist
// @route   GET /api/v1/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      select: 'name price discountPrice images stock brand ratings numOfReviews'
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.status(200).json({
      success: true,
      wishlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product in wishlist (Add / Remove)
// @route   POST /api/v1/wishlist/toggle
// @access  Private
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return next(new ErrorHandler('Product ID is required', 400));
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const exists = wishlist.products.includes(productId);
    let message = '';

    if (exists) {
      // Remove
      wishlist.products = wishlist.products.filter(
        (id) => id.toString() !== productId
      );
      message = 'Product removed from wishlist';
    } else {
      // Add
      wishlist.products.push(productId);
      message = 'Product added to wishlist';
    }

    await wishlist.save();

    const updatedWishlist = await Wishlist.findById(wishlist._id).populate({
      path: 'products',
      select: 'name price discountPrice images stock brand ratings'
    });

    res.status(200).json({
      success: true,
      message,
      wishlist: updatedWishlist
    });
  } catch (error) {
    next(error);
  }
};
