const Category = require('../models/Category');
const Product = require('../models/Product');
const ErrorHandler = require('../utils/errorHandler');

// @desc    Create a new category
// @route   POST /api/v1/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;

    if (!name || !description) {
      return next(new ErrorHandler('Category name and description are required', 400));
    }

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return next(new ErrorHandler('Category with this name already exists', 400));
    }

    const category = await Category.create({
      name,
      description,
      image: image || ''
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single category by slug
// @route   GET /api/v1/categories/:slug
// @access  Public
exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      return next(new ErrorHandler('Category not found', 404));
    }

    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ErrorHandler('Category not found', 404));
    }

    // Generate slug manually if name changes (mongoose pre-save hook handles it, but findByIdAndUpdate bypasses pre-save, so we use document save or manually assign)
    if (req.body.name) {
      category.name = req.body.name;
    }
    if (req.body.description) {
      category.description = req.body.description;
    }
    if (req.body.image !== undefined) {
      category.image = req.body.image;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ErrorHandler('Category not found', 404));
    }

    // Check if any products are associated with this category
    const productsCount = await Product.countDocuments({ category: category._id });
    if (productsCount > 0) {
      return next(
        new ErrorHandler(
          `Cannot delete category. There are ${productsCount} products assigned to it.`,
          400
        )
      );
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
