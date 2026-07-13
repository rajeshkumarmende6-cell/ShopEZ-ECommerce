const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary if keys are present
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'shopez-cloud';

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('✓ Cloudinary Service Configured');
} else {
  console.log('⚠️  Cloudinary credentials missing or default. Using mock image uploads.');
}

/**
 * Upload an image to Cloudinary (or return mock URL if not configured)
 * @param {string} filePath Local path to the file
 * @param {string} folder Target folder name on Cloudinary
 * @returns {Promise<{public_id: string, url: string}>}
 */
exports.uploadImage = async (filePath, folder = 'shopez') => {
  try {
    if (!isCloudinaryConfigured) {
      // Mock upload: Wait 100ms and return a high-quality placeholder URL from unsplash
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Clean up local temp file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Generate a nice random product image query from unsplash
      const randomQueries = ['product', 'sneaker', 'watch', 'electronics', 'apparel', 'gadget'];
      const query = randomQueries[Math.floor(Math.random() * randomQueries.length)];
      const mockId = `mock_id_${Math.random().toString(36).substring(2, 11)}`;
      const mockUrl = `https://images.unsplash.com/photo-${mockId === 'product' ? '1523275335684-37898b6baf30' : '1505740420928-5e560c06d30e'}?auto=format&fit=crop&w=600&q=80`;

      return {
        public_id: mockId,
        url: mockUrl
      };
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'image'
    });

    // Remove local file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      public_id: result.public_id,
      url: result.secure_url
    };
  } catch (error) {
    // Make sure temp file is cleaned up even on failure
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId Cloudinary public_id
 * @returns {Promise<any>}
 */
exports.deleteImage = async (publicId) => {
  if (!isCloudinaryConfigured || publicId.startsWith('mock_id_')) {
    return { result: 'ok' };
  }
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw error;
  }
};
