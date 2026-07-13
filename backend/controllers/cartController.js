const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ErrorHandler = require('../utils/errorHandler');

// @desc    Get current user's cart
// @route   GET /api/v1/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price discountPrice images stock brand'
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/v1/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity) || 1;

    if (!productId) {
      return next(new ErrorHandler('Product ID is required', 400));
    }

    // Verify product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    if (product.stock < qty) {
      return next(new ErrorHandler(`Only ${product.stock} items left in stock`, 400));
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Check if product is already in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Product exists, update quantity
      const newQty = cart.items[itemIndex].quantity + qty;
      if (product.stock < newQty) {
        return next(new ErrorHandler(`Cannot add more. Total in cart exceeds available stock (${product.stock})`, 400));
      }
      cart.items[itemIndex].quantity = newQty;
    } else {
      // Add new item
      cart.items.push({ product: productId, quantity: qty });
    }

    await cart.save();

    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price discountPrice images stock brand'
    });

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/v1/cart/:itemId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const qty = Number(quantity);

    if (isNaN(qty) || qty < 1) {
      return next(new ErrorHandler('Quantity must be at least 1', 400));
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return next(new ErrorHandler('Cart not found', 404));
    }

    // Find the item index by item schema subdoc _id
    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === req.params.itemId
    );

    if (itemIndex === -1) {
      return next(new ErrorHandler('Item not found in cart', 404));
    }

    // Verify stock availability
    const productId = cart.items[itemIndex].product;
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    if (product.stock < qty) {
      return next(new ErrorHandler(`Only ${product.stock} items available in stock`, 400));
    }

    cart.items[itemIndex].quantity = qty;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price discountPrice images stock brand'
    });

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/:itemId
// @access  Private
exports.removeItemFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return next(new ErrorHandler('Cart not found', 404));
    }

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== req.params.itemId
    );

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price discountPrice images stock brand'
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all items in cart
// @route   DELETE /api/v1/cart
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    } else {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart
    });
  } catch (error) {
    next(error);
  }
};
