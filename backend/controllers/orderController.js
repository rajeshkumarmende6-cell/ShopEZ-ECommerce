const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const User = require('../models/User');
const ErrorHandler = require('../utils/errorHandler');
const { createPaymentIntent, confirmPaymentIntent } = require('../services/stripeService');
const { createRazorpayOrder, verifyPaymentSignature } = require('../services/razorpayService');
const sendEmail = require('../services/emailService');
const { generateOrderEmailHtml } = require('../utils/emailTemplates');

// @desc    Create a new order and generate payment intent
// @route   POST /api/v1/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, orderNotes } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return next(new ErrorHandler('No order items provided', 400));
    }

    if (!shippingAddress) {
      return next(new ErrorHandler('Shipping address is required', 400));
    }

    // Calculate prices
    let itemsPrice = 0;
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return next(new ErrorHandler(`Product not found: ${item.name}`, 404));
      }
      if (product.stock < item.quantity) {
        return next(new ErrorHandler(`Product ${product.name} does not have enough stock.`, 400));
      }
      const price = product.discountPrice > 0 ? product.discountPrice : product.price;
      itemsPrice += price * item.quantity;
    }

    const shippingPrice = itemsPrice > 99 ? 0.0 : 9.99;
    const taxPrice = Number((itemsPrice * 0.08).toFixed(2)); // 8% tax rate
    const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

    // 1. Generate Payment Intent / Razorpay Order
    let paymentIntentId = 'COD_PAYMENT';
    let clientSecret = '';
    let razorpayOrderData = null;

    if (paymentMethod === 'Stripe') {
      const paymentIntent = await createPaymentIntent(totalPrice);
      paymentIntentId = paymentIntent.id;
      clientSecret = paymentIntent.clientSecret;
    } else if (paymentMethod === 'Razorpay') {
      razorpayOrderData = await createRazorpayOrder(totalPrice, req.user._id);
      paymentIntentId = razorpayOrderData.id;
    }

    // 2. Save Order in pending state
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentInfo: {
        id: paymentIntentId,
        status: 'pending',
        method: paymentMethod
      },
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      orderStatus: 'Processing',
      orderNotes: orderNotes || ''
    });

    res.status(201).json({
      success: true,
      orderId: order._id,
      clientSecret,
      razorpayOrder: razorpayOrderData,
      totalPrice
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm payment intent and finalize order
// @route   POST /api/v1/orders/:id/confirm
// @access  Private
exports.confirmOrderPayment = async (req, res, next) => {
  try {
    const { paymentIntentId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

    if (!order) {
      return next(new ErrorHandler('Order not found', 404));
    }

    // Validate payment status based on method
    if (order.paymentInfo.method === 'Stripe') {
      if (!paymentIntentId) {
        return next(new ErrorHandler('Payment Intent ID is required', 400));
      }

      const checkPayment = await confirmPaymentIntent(paymentIntentId);
      if (checkPayment.status !== 'succeeded') {
        order.paymentInfo.status = 'failed';
        await order.save();
        return next(new ErrorHandler(`Payment verification failed: Status is ${checkPayment.status}`, 400));
      }

      order.paymentInfo.id = paymentIntentId;
      order.paymentInfo.status = 'succeeded';
    } else if (order.paymentInfo.method === 'Razorpay') {
      if (!razorpayPaymentId) {
        return next(new ErrorHandler('Razorpay Payment ID is required', 400));
      }

      const isVerified = await verifyPaymentSignature({
        razorpayPaymentId,
        razorpayOrderId: razorpayOrderId || order.paymentInfo.id,
        razorpaySignature
      });

      if (!isVerified) {
        order.paymentInfo.status = 'failed';
        await order.save();
        return next(new ErrorHandler('Razorpay payment verification failed', 400));
      }

      order.paymentInfo.id = razorpayPaymentId;
      order.paymentInfo.status = 'succeeded';
    } else {
      // COD payment confirmation
      order.paymentInfo.status = 'pending';
    }

    await order.save();

    // 3. Deduct product stocks
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }

    // 4. Clear user cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    // 5. Send Notification Email to Admin & Confirmation to Customer
    try {
      const populatedOrder = await Order.findById(order._id).populate('user', 'name email');
      
      // Send to Customer
      if (populatedOrder.user && populatedOrder.user.email) {
        const customerHtml = generateOrderEmailHtml(populatedOrder, populatedOrder.user, false);
        await sendEmail({
          email: populatedOrder.user.email,
          subject: `ShopEZ Order Confirmation - #${populatedOrder._id}`,
          message: `Thank you for your order, ${populatedOrder.shippingAddress.fullName || populatedOrder.user.name}! Your order #${populatedOrder._id} is confirmed and is now being processed.`,
          html: customerHtml
        });
        console.log(`Confirmation email sent successfully to customer ${populatedOrder.user.email} for order ${order._id}`);
      }

      // Send to Admin(s)
      const admins = await User.find({ role: 'admin' });
      const adminEmails = admins.map(a => a.email);
      if (!adminEmails.includes('rajeshkumarmende6@gmail.com')) {
        adminEmails.push('rajeshkumarmende6@gmail.com');
      }

      const adminHtml = generateOrderEmailHtml(populatedOrder, populatedOrder.user || { name: 'Guest', email: 'N/A' }, true);
      for (const email of adminEmails) {
        await sendEmail({
          email: email,
          subject: `[ShopEZ Admin] New Order Placed - #${populatedOrder._id}`,
          message: `Hello Admin, a new order #${populatedOrder._id} has been placed.`,
          html: adminHtml
        });
        console.log(`Admin notification email sent successfully to ${email} for order ${order._id}`);
      }
    } catch (emailErr) {
      console.error('Failed to send order notification emails:', emailErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and order finalized successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order details
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getSingleOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');

    if (!order) {
      return next(new ErrorHandler('Order not found', 404));
    }

    // Access check: Only allow if admin or order owner
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ErrorHandler('Not authorized to access this order', 403));
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/v1/orders/me
// @access  Private
exports.myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/v1/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    let totalAmount = 0;
    orders.forEach((order) => {
      if (order.paymentInfo.status === 'succeeded') {
        totalAmount += order.totalPrice;
      }
    });

    res.status(200).json({
      success: true,
      totalAmount,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status / shipping (Admin only)
// @route   PUT /api/v1/orders/:id
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler('Order not found', 404));
    }

    if (order.orderStatus === 'Delivered') {
      return next(new ErrorHandler('This order is already delivered', 400));
    }

    const { status } = req.body;
    if (!status) {
      return next(new ErrorHandler('Please specify new order status', 400));
    }

    order.orderStatus = status;
    
    if (status === 'Shipped') {
      order.shippedAt = Date.now();
    }
    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
      // If COD, mark paid upon delivery
      if (order.paymentInfo.method === 'COD') {
        order.paymentInfo.status = 'succeeded';
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    next(error);
  }
};
