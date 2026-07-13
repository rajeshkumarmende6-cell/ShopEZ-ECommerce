const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a promotion title'],
      trim: true
    },
    subtitle: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a promotion description']
    },
    eventType: {
      type: String,
      required: [true, 'Please select an event type'],
      enum: {
        values: [
          'Festival Offers',
          'Flash Sales',
          "Today's Deals",
          'Mega Sale Events',
          'Seasonal Offers',
          'Brand Campaigns',
          'New Product Launches',
          'Limited-Time Discounts',
          'Clearance Sales',
          'Custom Promotional Events'
        ],
        message: '{VALUE} is not a valid event type'
      }
    },
    desktopBanner: {
      public_id: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      }
    },
    mobileBanner: {
      public_id: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      }
    },
    offerPercentage: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%']
    },
    couponCode: {
      type: String,
      trim: true
    },
    countdownTimer: {
      type: Date
    },
    ctaText: {
      type: String,
      default: 'Shop Now'
    },
    ctaUrl: {
      type: String,
      default: '/products'
    },
    bgColor: {
      type: String,
      default: '#111827'
    },
    priority: {
      type: Number,
      default: 0
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide a start date & time']
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide an end date & time']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Ensure index on dates and active status for fast retrieval
promotionSchema.index({ isActive: 1, startDate: 1, endDate: 1, priority: -1 });

module.exports = mongoose.model('Promotion', promotionSchema);
