const express = require('express');
const { getDashboardStats, getAllUsers, updateUserRole } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // Secure all routes for Admin only

// Analytics stats
router.get('/stats', getDashboardStats);

// Users management routes
router.route('/users')
  .get(getAllUsers);

router.route('/users/:id')
  .put(updateUserRole);

module.exports = router;
