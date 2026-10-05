import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      trim: true,
      unique: true,
      lowercase: true,
    },
    subCategory: {
      type: String,
      required: [true, 'Category subcategory is required'],
      trim: true,
    },
    subCategories: {
      type: [String],
      default: [],
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
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
