const Promotion = require('../models/Promotion');
const ErrorHandler = require('../utils/errorHandler');
const { uploadImage, deleteImage } = require('../services/cloudinaryService');

// @desc    Get active promotions for homepage carousel
// @route   GET /api/v1/promotions/active
// @access  Public
exports.getActivePromotions = async (req, res, next) => {
  try {
    const now = new Date();
    const promotions = await Promotion.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ priority: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: promotions.length,
      promotions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all promotions
// @route   GET /api/v1/promotions
// @access  Private/Admin
exports.getPromotions = async (req, res, next) => {
  try {
    // Sort by priority descending and then newest first
    const promotions = await Promotion.find().sort({ priority: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: promotions.length,
      promotions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single promotion details
// @route   GET /api/v1/promotions/:id
// @access  Private/Admin
exports.getPromotionById = async (req, res, next) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return next(new ErrorHandler('Promotion not found', 404));
    }

    res.status(200).json({
      success: true,
      promotion
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new promotion
// @route   POST /api/v1/promotions
// @access  Private/Admin
exports.createPromotion = async (req, res, next) => {
  try {
    const {
      title,
      subtitle,
      description,
      eventType,
      offerPercentage,
      couponCode,
      countdownTimer,
      ctaText,
      ctaUrl,
      bgColor,
      priority,
      startDate,
      endDate,
      isActive
    } = req.body;

    if (!title || !description || !eventType || !startDate || !endDate) {
      return next(new ErrorHandler('Please fill in all required fields (title, description, eventType, startDate, endDate)', 400));
    }

    // Verify files were uploaded
    if (!req.files || !req.files.desktopBanner || !req.files.mobileBanner) {
      return next(new ErrorHandler('Please upload both desktop and mobile banners', 400));
    }

    const desktopFile = req.files.desktopBanner[0];
    const mobileFile = req.files.mobileBanner[0];

    // Upload desktop banner
    const desktopUpload = await uploadImage(desktopFile.path, 'shopez/promotions');
    // Upload mobile banner
    const mobileUpload = await uploadImage(mobileFile.path, 'shopez/promotions');

    const promotion = await Promotion.create({
      title,
      subtitle,
      description,
      eventType,
      desktopBanner: {
        public_id: desktopUpload.public_id,
        url: desktopUpload.url
      },
      mobileBanner: {
        public_id: mobileUpload.public_id,
        url: mobileUpload.url
      },
      offerPercentage: offerPercentage ? Number(offerPercentage) : undefined,
      couponCode,
      countdownTimer: countdownTimer ? new Date(countdownTimer) : undefined,
      ctaText,
      ctaUrl,
      bgColor,
      priority: priority ? Number(priority) : 0,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: isActive === 'true' || isActive === true
    });

    res.status(201).json({
      success: true,
      message: 'Promotion created successfully',
      promotion
    });
  } catch (error) {
    // Delete temp local files on failure
    if (req.files) {
      if (req.files.desktopBanner && req.files.desktopBanner[0]) {
        const path = req.files.desktopBanner[0].path;
        if (require('fs').existsSync(path)) require('fs').unlinkSync(path);
      }
      if (req.files.mobileBanner && req.files.mobileBanner[0]) {
        const path = req.files.mobileBanner[0].path;
        if (require('fs').existsSync(path)) require('fs').unlinkSync(path);
      }
    }
    next(error);
  }
};

// @desc    Update promotion
// @route   PUT /api/v1/promotions/:id
// @access  Private/Admin
exports.updatePromotion = async (req, res, next) => {
  try {
    let promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return next(new ErrorHandler('Promotion not found', 404));
    }

    const {
      title,
      subtitle,
      description,
      eventType,
      offerPercentage,
      couponCode,
      countdownTimer,
      ctaText,
      ctaUrl,
      bgColor,
      priority,
      startDate,
      endDate,
      isActive
    } = req.body;

    // Build update object
    const updateData = {
      title,
      subtitle,
      description,
      eventType,
      couponCode,
      ctaText,
      ctaUrl,
      bgColor,
      priority: priority ? Number(priority) : promotion.priority,
      startDate: startDate ? new Date(startDate) : promotion.startDate,
      endDate: endDate ? new Date(endDate) : promotion.endDate,
      isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : promotion.isActive
    };

    if (offerPercentage !== undefined) {
      updateData.offerPercentage = offerPercentage ? Number(offerPercentage) : null;
    }
    if (countdownTimer !== undefined) {
      updateData.countdownTimer = countdownTimer ? new Date(countdownTimer) : null;
    }

    // Handle desktop banner update if uploaded
    if (req.files && req.files.desktopBanner && req.files.desktopBanner[0]) {
      const desktopFile = req.files.desktopBanner[0];
      // Upload new image
      const desktopUpload = await uploadImage(desktopFile.path, 'shopez/promotions');
      // Delete old image
      if (promotion.desktopBanner && promotion.desktopBanner.public_id) {
        await deleteImage(promotion.desktopBanner.public_id);
      }
      updateData.desktopBanner = {
        public_id: desktopUpload.public_id,
        url: desktopUpload.url
      };
    }

    // Handle mobile banner update if uploaded
    if (req.files && req.files.mobileBanner && req.files.mobileBanner[0]) {
      const mobileFile = req.files.mobileBanner[0];
      // Upload new image
      const mobileUpload = await uploadImage(mobileFile.path, 'shopez/promotions');
      // Delete old image
      if (promotion.mobileBanner && promotion.mobileBanner.public_id) {
        await deleteImage(promotion.mobileBanner.public_id);
      }
      updateData.mobileBanner = {
        public_id: mobileUpload.public_id,
        url: mobileUpload.url
      };
    }

    promotion = await Promotion.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Promotion updated successfully',
      promotion
    });
  } catch (error) {
    // Delete temp local files on failure
    if (req.files) {
      if (req.files.desktopBanner && req.files.desktopBanner[0]) {
        const path = req.files.desktopBanner[0].path;
        if (require('fs').existsSync(path)) require('fs').unlinkSync(path);
      }
      if (req.files.mobileBanner && req.files.mobileBanner[0]) {
        const path = req.files.mobileBanner[0].path;
        if (require('fs').existsSync(path)) require('fs').unlinkSync(path);
      }
    }
    next(error);
  }
};

// @desc    Delete promotion
// @route   DELETE /api/v1/promotions/:id
// @access  Private/Admin
exports.deletePromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return next(new ErrorHandler('Promotion not found', 404));
    }

    // Delete banners from Cloudinary/Mock
    if (promotion.desktopBanner && promotion.desktopBanner.public_id) {
      await deleteImage(promotion.desktopBanner.public_id);
    }
    if (promotion.mobileBanner && promotion.mobileBanner.public_id) {
      await deleteImage(promotion.mobileBanner.public_id);
    }

    await promotion.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Promotion deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
