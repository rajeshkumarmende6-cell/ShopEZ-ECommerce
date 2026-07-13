const Address = require('../models/Address');
const ErrorHandler = require('../utils/errorHandler');

// @desc    Get user's addresses
// @route   GET /api/v1/addresses
// @access  Private
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: addresses.length,
      addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new address
// @route   POST /api/v1/addresses
// @access  Private
exports.createAddress = async (req, res, next) => {
  try {
    const { fullName, phoneNumber, streetAddress, city, state, postalCode, country, isDefault } = req.body;

    if (!fullName || !phoneNumber || !streetAddress || !city || !state || !postalCode) {
      return next(new ErrorHandler('Please provide all required address details', 400));
    }

    // Check if this is the first address, if so, set it as default anyway
    const addressCount = await Address.countDocuments({ user: req.user._id });
    const setDefault = addressCount === 0 ? true : (isDefault === 'true' || isDefault === true);

    const address = await Address.create({
      user: req.user._id,
      fullName,
      phoneNumber,
      streetAddress,
      city,
      state,
      postalCode,
      country: country || 'India',
      isDefault: setDefault
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update address details
// @route   PUT /api/v1/addresses/:id
// @access  Private
exports.updateAddress = async (req, res, next) => {
  try {
    let address = await Address.findOne({ _id: req.params.id, user: req.user._id });

    if (!address) {
      return next(new ErrorHandler('Address not found', 404));
    }

    const { fullName, phoneNumber, streetAddress, city, state, postalCode, country, isDefault } = req.body;

    if (fullName) address.fullName = fullName;
    if (phoneNumber) address.phoneNumber = phoneNumber;
    if (streetAddress) address.streetAddress = streetAddress;
    if (city) address.city = city;
    if (state) address.state = state;
    if (postalCode) address.postalCode = postalCode;
    if (country) address.country = country;
    if (isDefault !== undefined) {
      address.isDefault = isDefault === 'true' || isDefault === true;
    }

    await address.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      address
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an address
// @route   DELETE /api/v1/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

    if (!address) {
      return next(new ErrorHandler('Address not found', 404));
    }

    const wasDefault = address.isDefault;
    await address.deleteOne();

    // If we deleted the default address, set another address as default if they exist
    if (wasDefault) {
      const anotherAddress = await Address.findOne({ user: req.user._id });
      if (anotherAddress) {
        anotherAddress.isDefault = true;
        await anotherAddress.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
