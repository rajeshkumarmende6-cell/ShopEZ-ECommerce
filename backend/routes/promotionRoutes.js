const express = require('express');
const {
  getActivePromotions,
  getPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion
} = require('../controllers/promotionController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public route for homepage carousel
router.get('/active', getActivePromotions);

// Admin dashboard routes (secured)
router.route('/')
  .get(protect, authorize('admin'), getPromotions)
  .post(protect, authorize('admin'), upload.fields([
    { name: 'desktopBanner', maxCount: 1 },
    { name: 'mobileBanner', maxCount: 1 }
  ]), createPromotion);

router.route('/:id')
  .get(protect, authorize('admin'), getPromotionById)
  .put(protect, authorize('admin'), upload.fields([
    { name: 'desktopBanner', maxCount: 1 },
    { name: 'mobileBanner', maxCount: 1 }
  ]), updatePromotion)
  .delete(protect, authorize('admin'), deletePromotion);

module.exports = router;
