const express = require('express');
const {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress
} = require('../controllers/addressController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Secure all address routes

router.route('/')
  .get(getAddresses)
  .post(createAddress);

router.route('/:id')
  .put(updateAddress)
  .delete(deleteAddress);

module.exports = router;
