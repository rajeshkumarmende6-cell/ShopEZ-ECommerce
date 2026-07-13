const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const ErrorHandler = require('../utils/errorHandler');
const { uploadImage, deleteImage } = require('../services/cloudinaryService');

// @desc    Create a new product
// @route   POST /api/v1/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, discountPrice, category, brand, stock, isFeatured, isBestSeller } = req.body;

    if (!name || !description || !price || !category || !brand) {
      return next(new ErrorHandler('Please fill in all required fields', 400));
    }

    // Validate category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return next(new ErrorHandler('Selected category does not exist', 404));
    }

    // Handle uploaded files
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadImage(file.path, 'shopez/products');
        images.push({
          public_id: uploadResult.public_id,
          url: uploadResult.url
        });
      }
    } else {
      return next(new ErrorHandler('Please upload at least one product image', 400));
    }

    const product = await Product.create({
      name,
      description,
      price,
      discountPrice: discountPrice || 0,
      images,
      category,
      brand,
      stock: stock || 0,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isBestSeller: isBestSeller === 'true' || isBestSeller === true,
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    // If saving fails, make sure we delete local uploaded files
    if (req.files) {
      req.files.forEach((file) => {
        if (require('fs').existsSync(file.path)) {
          require('fs').unlinkSync(file.path);
        }
      });
    }
    next(error);
  }
};

// @desc    Get all products (Filtered, Sorted, Paginated)
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const query = {};

    // 1. Text Search (Keyword search)
    if (req.query.keyword) {
      query.$or = [
        { name: { $regex: req.query.keyword, $options: 'i' } },
        { description: { $regex: req.query.keyword, $options: 'i' } },
        { brand: { $regex: req.query.keyword, $options: 'i' } }
      ];
    }

    // 2. Category Filter (comma separated values or single value)
    if (req.query.category) {
      const categories = req.query.category.split(',');
      query.category = { $in: categories };
    }

    // 3. Brand Filter
    if (req.query.brand) {
      const brands = req.query.brand.split(',');
      query.brand = { $in: brands.map(b => new RegExp('^' + b + '$', 'i')) };
    }

    // 4. Price range Filter (minPrice & maxPrice)
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) {
        query.price.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query.price.$lte = Number(req.query.maxPrice);
      }
    }

    // 5. Ratings Filter
    if (req.query.ratings) {
      query.ratings = { $gte: Number(req.query.ratings) };
    }

    // 6. Featured and Best Seller Filter
    if (req.query.isFeatured) {
      query.isFeatured = req.query.isFeatured === 'true';
    }
    if (req.query.isBestSeller) {
      query.isBestSeller = req.query.isBestSeller === 'true';
    }

    // Count total matching products before paging
    const totalProductsCount = await Product.countDocuments(query);

    // 7. Sorting
    let sortBy = { createdAt: -1 }; // Default: Newest first
    if (req.query.sort) {
      if (req.query.sort === 'priceAsc') {
        sortBy = { price: 1 };
      } else if (req.query.sort === 'priceDesc') {
        sortBy = { price: -1 };
      } else if (req.query.sort === 'ratings') {
        sortBy = { ratings: -1 };
      } else if (req.query.sort === 'reviews') {
        sortBy = { numOfReviews: -1 };
      } else if (req.query.sort === 'newest') {
        sortBy = { createdAt: -1 };
      }
    }

    // 8. Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: products.length,
      totalProductsCount,
      totalPages: Math.ceil(totalProductsCount / limit),
      currentPage: page,
      limit,
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product details
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('user', 'name');

    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product (Admin only)
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    const { name, description, price, discountPrice, category, brand, stock, isFeatured, isBestSeller } = req.body;

    if (category) {
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        return next(new ErrorHandler('Selected category does not exist', 404));
      }
      product.category = category;
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (discountPrice !== undefined) product.discountPrice = discountPrice;
    if (brand) product.brand = brand;
    if (stock !== undefined) product.stock = stock;
    if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (isBestSeller !== undefined) product.isBestSeller = isBestSeller === 'true' || isBestSeller === true;

    // Handle new image uploads if files exist
    if (req.files && req.files.length > 0) {
      // Replaces all old images (if requested or by default, let's delete old images in Cloudinary)
      for (const img of product.images) {
        await deleteImage(img.public_id);
      }
      
      const newImages = [];
      for (const file of req.files) {
        const uploadResult = await uploadImage(file.path, 'shopez/products');
        newImages.push({
          public_id: uploadResult.public_id,
          url: uploadResult.url
        });
      }
      product.images = newImages;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    if (req.files) {
      req.files.forEach((file) => {
        if (require('fs').existsSync(file.path)) {
          require('fs').unlinkSync(file.path);
        }
      });
    }
    next(error);
  }
};

// @desc    Delete a product (Admin only)
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    // Delete associated images from Cloudinary
    for (const img of product.images) {
      await deleteImage(img.public_id);
    }

    // Delete associated reviews
    await Review.deleteMany({ product: product._id });

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product and associated reviews deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create / Update product review
// @route   POST /api/v1/products/:id/reviews
// @access  Private
exports.createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    if (!rating || !comment) {
      return next(new ErrorHandler('Rating and comment are required', 400));
    }

    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    // Check if user already reviewed this product
    let review = await Review.findOne({ product: productId, user: req.user._id });

    if (review) {
      // Update review
      review.rating = Number(rating);
      review.comment = comment;
      review.name = req.user.name;
      await review.save();
      
      res.status(200).json({
        success: true,
        message: 'Review updated successfully'
      });
    } else {
      // Create new review
      review = await Review.create({
        user: req.user._id,
        product: productId,
        name: req.user.name,
        rating: Number(rating),
        comment
      });

      res.status(201).json({
        success: true,
        message: 'Review added successfully'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews of a single product
// @route   GET /api/v1/products/:id/reviews
// @access  Public
exports.getProductReviews = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    const reviews = await Review.find({ product: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product review
// @route   DELETE /api/v1/products/:id/reviews
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const review = await Review.findOne({ product: productId, user: req.user._id });
    if (!review) {
      return next(new ErrorHandler('Review not found for this user', 404));
    }

    // We call deleteOne on the document to trigger post-deleteOne hook
    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
