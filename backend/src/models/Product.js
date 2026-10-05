import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      trim: true,
      unique: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    discountPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    subCategory: {
      type: String,
      required: [true, 'Subcategory is required'],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: 0,
      default: 0,
    },
    description: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    variants: {
      sizes: { type: [String], default: [] },
      colors: {
        type: [mongoose.Schema.Types.Mixed],
        default: [],
      },
    },
    status: {
      type: String,
      default: 'Active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
