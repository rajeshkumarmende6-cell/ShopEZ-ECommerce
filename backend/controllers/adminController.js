const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');
const ErrorHandler = require('../utils/errorHandler');

// @desc    Get dashboard analytics stats
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total Sales (Succeeded orders only)
    const salesData = await Order.aggregate([
      { $match: { 'paymentInfo.status': 'succeeded' } },
      { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }
    ]);
    const totalSales = salesData.length > 0 ? salesData[0].totalSales : 0;

    // 2. Count metrics
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();

    // 3. Low stock alerts (Stock less than 10)
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .select('name price brand stock')
      .limit(5);

    // 4. Recent orders list
    const recentOrders = await Order.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // 5. Category Distribution
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Populate category names manually or via map
    const categoryDistribution = [];
    for (const stat of categoryStats) {
      if (stat._id) {
        const cat = await Category.findById(stat._id);
        if (cat) {
          categoryDistribution.push({
            name: cat.name,
            value: stat.count
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      stats: {
        totalSales: Math.round(totalSales * 100) / 100,
        totalOrders,
        totalProducts,
        totalUsers,
        lowStockProducts,
        recentOrders,
        categoryDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list (Admin only)
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }

    // Prevent changing own role
    if (user._id.toString() === req.user._id.toString()) {
      return next(new ErrorHandler('You cannot modify your own administrative role', 400));
    }

    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
      return next(new ErrorHandler('Please provide a valid role (user or admin)', 400));
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully`,
      user
    });
  } catch (error) {
    next(error);
  }
};
