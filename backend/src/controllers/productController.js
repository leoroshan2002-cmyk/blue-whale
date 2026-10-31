import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

const publicProductImagesStage = {
  $set: {
    images: {
      $map: {
        input: { $ifNull: ['$images', []] },
        as: 'image',
        in: {
          $cond: [
            { $regexMatch: { input: '$$image', regex: /^data:/i } },
            '__PUBLIC_PRODUCT_IMAGE__',
            '$$image',
          ],
        },
      },
    },
  },
};

const isPublicProductRoute = (req) => req.baseUrl === '/api/products';

const categorySubcategories = {
  Men: ['T-Shirts', 'Shirts', 'Jackets', 'Hoodies', 'Jeans', 'Footwear'],
  Women: ['Blouses', 'Dresses', 'Jeans', 'Tops', 'Handbags'],
  Kids: ['T-Shirts', 'Hoodies', 'Boys', 'Girls', 'Toys'],
  'New Arrivals': ['Trending', 'Best Sellers'],
  Unisex: ['T-Shirts', 'Hoodies', 'Jackets', 'Jeans', 'Footwear', 'Accessories', 'Bags'],
};

const isSubcategoryValid = async (category, subCategory) => {
  const categoryDoc = await Category.findOne({ name: category });
  if (categoryDoc) {
    const validList = Array.isArray(categoryDoc.subCategories) && categoryDoc.subCategories.length > 0
      ? categoryDoc.subCategories
      : categoryDoc.subCategory
        ? [categoryDoc.subCategory]
        : [];
    return validList.length === 0 || validList.includes(subCategory);
  }

  const validList = categorySubcategories[category];
  return !validList || validList.length === 0 || validList.includes(subCategory);
};

const toProductResponse = (product, { useImageEndpoint = false } = {}) => {
  if (!product) return null;

  const doc = product.toObject ? product.toObject() : { ...product };
  doc.id = String(doc.id || doc._id);
  delete doc._id;
  doc.images = (doc.images || [])
    .map((img, index) => (img === '__PUBLIC_PRODUCT_IMAGE__' || /^data:image\//i.test(img)) && useImageEndpoint
      ? `/api/products/${doc.id}/image/${index}`
      : img)
    .filter((img) => typeof img === 'string' && img && !img.startsWith('blob:'));
  doc.image = doc.images[0] || (useImageEndpoint ? `/api/products/${doc.id}/image` : '');
  doc.colors = doc.variants?.colors || [];
  doc.sizes = doc.variants?.sizes || [];
  doc.subCategory = doc.subCategory || '';
  return {
    ...doc,
    variants: doc.variants || { sizes: [], colors: [] },
  };
};

const getUploadedFileUrl = (file) => {
  if (!file) return '';

  if (file.path || file.secure_url || file.url || file.location) {
    return file.path || file.secure_url || file.url || file.location;
  }

  if (file.buffer && file.mimetype) {
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  }

  return '';
};

const parseProductAttributes = (attributes, fieldName) => {
  let parsedAttributes = attributes;

  if (typeof parsedAttributes === 'string') {
    try {
      parsedAttributes = JSON.parse(parsedAttributes);
    } catch {
      const error = new Error(`${fieldName} must be a valid list of label and value pairs.`);
      error.statusCode = 400;
      throw error;
    }
  }

  if (!Array.isArray(parsedAttributes)) {
    const error = new Error(`${fieldName} must be a list of label and value pairs.`);
    error.statusCode = 400;
    throw error;
  }

  return parsedAttributes
    .map((attribute) => ({
      label: String(attribute?.label || '').trim(),
      value: String(attribute?.value || '').trim(),
    }))
    .filter((attribute) => attribute.label);
};

const parseProductPayload = (body, files = []) => {
  const payload = { ...body };

  for (const field of ['price', 'discountPrice', 'stock']) {
    if (payload[field] === '' || payload[field] === undefined) {
      delete payload[field];
    } else if (payload[field] === 'null' || payload[field] === null) {
      payload[field] = null;
    } else if (payload[field] !== null) {
      payload[field] = Number(payload[field]);
    }
  }

  if (payload.subCategory === null || payload.subCategory === undefined || payload.subCategory === 'null' || payload.subCategory === 'undefined') {
    payload.subCategory = '';
  } else {
    payload.subCategory = String(payload.subCategory).trim();
  }

  if (typeof payload.variants === 'string') {
    try {
      payload.variants = JSON.parse(payload.variants);
    } catch {
      payload.variants = { sizes: [], colors: [] };
    }
  }

  if (!payload.variants || typeof payload.variants !== 'object') {
    payload.variants = { sizes: [], colors: [] };
  }

  payload.variants = {
    sizes: Array.isArray(payload.variants.sizes) ? payload.variants.sizes.filter(Boolean) : [],
    colors: Array.isArray(payload.variants.colors) ? payload.variants.colors.filter((color) => color && (color.name || color.hex)) : [],
  };

  for (const field of ['highlights', 'additionalDetails']) {
    if (payload[field] !== undefined) {
      payload[field] = parseProductAttributes(payload[field], field === 'highlights' ? 'Highlights' : 'Additional details');
    }
  }

  const imageInput = payload.images ?? payload.imageUrls;
  let parsedImages = [];

  if (Array.isArray(imageInput)) {
    parsedImages = imageInput;
  } else if (typeof imageInput === 'string') {
    const trimmed = imageInput.trim();
    if (trimmed) {
      try {
        const parsed = JSON.parse(trimmed);
        parsedImages = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        parsedImages = trimmed
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }
  }

  const uploadedImages = files
    .map(getUploadedFileUrl)
    .filter((url) => typeof url === 'string' && url.trim());

  const normalizedImages = Array.isArray(parsedImages)
    ? parsedImages.filter((img) => typeof img === 'string' && img.trim() && !img.startsWith('blob:'))
    : [];

  payload.images = [...new Set([...normalizedImages, ...uploadedImages])];
  delete payload.imageUrls;
  return payload;
};

export const buildProductUpdatePayload = (existingProduct, body, files = []) => {
  const existingData = existingProduct?.toObject ? existingProduct.toObject() : { ...(existingProduct || {}) };
  const incomingPayload = parseProductPayload(body, files);
  const updatePayload = { ...existingData };

  Object.entries(incomingPayload).forEach(([key, value]) => {
    if (key === '_id' || key === 'id') {
      return;
    }

    if (value === undefined || value === null) {
      return;
    }

    if (typeof value === 'string' && value.trim() === '') {
      return;
    }

    if (Array.isArray(value) && value.length === 0 && !['highlights', 'additionalDetails'].includes(key)) {
      return;
    }

    if (key === 'variants' && value && typeof value === 'object' && !Array.isArray(value)) {
      const hasVariantData = Array.isArray(value.sizes) ? value.sizes.some(Boolean) : false;
      const hasColorData = Array.isArray(value.colors) ? value.colors.some((color) => color && (color.name || color.hex)) : false;
      if (!hasVariantData && !hasColorData) {
        return;
      }
    }

    if (value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
      return;
    }

    updatePayload[key] = value;
  });

  updatePayload.images = (Array.isArray(updatePayload.images) && updatePayload.images.length > 0)
    ? updatePayload.images
      .filter((img) => typeof img === 'string' && img.trim() && !img.startsWith('blob:'))
      .map((img) => {
        const imageEndpoint = img.match(/(?:^|\/)api\/products\/([^/]+)\/image(?:\/(\d+))?\/?$/i);
        const productId = String(existingData._id || existingData.id || '');
        if (imageEndpoint?.[1] !== productId) return img;

        const imageIndex = Number(imageEndpoint[2] || 0);
        const existingImage = existingData.images?.[imageIndex];
        return typeof existingImage === 'string' ? existingImage : img;
      })
    : (Array.isArray(existingData.images) ? existingData.images : []);

  if (updatePayload.variants && typeof updatePayload.variants === 'object') {
    updatePayload.variants = {
      sizes: Array.isArray(updatePayload.variants.sizes) ? updatePayload.variants.sizes.filter(Boolean) : [],
      colors: Array.isArray(updatePayload.variants.colors) ? updatePayload.variants.colors.filter((color) => color && (color.name || color.hex)) : [],
    };
  }

  return updatePayload;
};

export const listProducts = async (req, res) => {
  try {
    const rawProducts = isPublicProductRoute(req)
      ? await Product.aggregate([
          { $sort: { createdAt: -1 } },
          publicProductImagesStage,
        ])
      : await Product.find().sort({ createdAt: -1 });
    const products = rawProducts.map((product) => toProductResponse(product, { useImageEndpoint: true }));
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('Failed to load products:', error);
    res.status(500).json({ success: false, message: 'Unable to load products.' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = isPublicProductRoute(req)
      ? (mongoose.isValidObjectId(id)
          ? (await Product.aggregate([
              { $match: { _id: new mongoose.Types.ObjectId(id) } },
              publicProductImagesStage,
            ]))[0]
          : null)
      : await Product.findById(id);

    if (product) {
      return res.status(200).json({
        success: true,
        product: toProductResponse(product, { useImageEndpoint: true }),
      });
    }

    return res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    console.error('Failed to load product:', error);
    if (error?.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(500).json({ message: 'Unable to load product.' });
  }
};

export const getProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    const imageIndex = req.params.index === undefined ? 0 : Number(req.params.index);
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ message: 'Product image not found' });
    }
    if (!Number.isInteger(imageIndex) || imageIndex < 0) {
      return res.status(404).json({ message: 'Product image not found' });
    }

    const product = await Product.findById(id)
      .select({ images: { $slice: [imageIndex, 1] } })
      .lean();
    const image = product?.images?.[0];
    const match = typeof image === 'string'
      ? image.match(/^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=\r\n]+)$/i)
      : null;

    if (!match) {
      return res.status(404).json({ message: 'Product image not found' });
    }

    res
      .status(200)
      .set('Content-Type', match[1])
      .set('Cache-Control', 'public, max-age=3600')
      .send(Buffer.from(match[2], 'base64'));
  } catch (error) {
    console.error('Failed to load product image:', error);
    return res.status(500).json({ message: 'Unable to load product image.' });
  }
};

const sendProductError = (res, error) => {
  if (error?.statusCode === 400) {
    return res.status(400).json({ success: false, message: error.message });
  }

  if (error && error.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern || error.keyValue || {})[0] || 'field';
    const message = duplicateField === 'sku'
      ? 'SKU already exists. Please provide a unique SKU.'
      : `Duplicate value for ${duplicateField}. Please use a different value.`;
    return res.status(400).json({ success: false, message });
  }

  if (error && error.name === 'ValidationError') {
    const firstError = Object.values(error.errors || {})[0];
    return res.status(400).json({ success: false, message: firstError ? firstError.message : 'Invalid product data.' });
  }

  return res.status(500).json({ message: 'Server error', error: error.message });
};

export const createProduct = async (req, res) => {
  try {
    const payload = parseProductPayload(req.body, req.files);
    if (!payload.sku) {
      payload.sku = `ZR-${Date.now()}`;
    }

    if (!(await isSubcategoryValid(payload.category, payload.subCategory))) {
      return res.status(400).json({
        success: false,
        message: `Invalid subcategory "${payload.subCategory}" for category "${payload.category}".`
      });
    }

    const product = await Product.create(payload);
    res.status(201).json({ success: true, product: toProductResponse(product, { useImageEndpoint: true }) });
  } catch (error) {
    return sendProductError(res, error);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const payload = buildProductUpdatePayload(existingProduct, req.body, req.files);
    const category = payload.category || existingProduct.category;
    const subCategory = payload.subCategory || existingProduct.subCategory || '';

    const validSubcategory = await isSubcategoryValid(category, subCategory);
    if (!validSubcategory) {
      return res.status(400).json({
        success: false,
        message: `Invalid subcategory "${subCategory}" for category "${category}".`
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ success: true, product: toProductResponse(updatedProduct, { useImageEndpoint: true }) });
  } catch (error) {
    return sendProductError(res, error);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
