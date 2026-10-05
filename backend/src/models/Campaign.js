import mongoose from 'mongoose';

const campaignItemSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: [true, 'Item id is required'],
    },
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    buttonText: {
      type: String,
      default: '',
    },
    button: {
      type: String,
      default: '',
    },
    link: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const campaignSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Campaign category is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      default: '',
      trim: true,
    },
    name: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 'Active',
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    slider: {
      type: [campaignItemSchema],
      default: [],
    },
    promoCards: {
      type: [campaignItemSchema],
      default: [],
    },
    bottomPromoCards: {
      type: [campaignItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Campaign', campaignSchema);
