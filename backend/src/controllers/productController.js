import Product from '../models/Product.js';
import Category from '../models/Category.js';

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

const fallbackProducts = [
  {
    id: 'fallback-men-1',
    name: 'Ocean Blue Polo',
    sku: 'ZR-MEN-001',
    price: 1899,
    discountPrice: 1499,
    category: 'Men',
    subCategory: 'Shirts',
    stock: 12,
    description: 'Premium cotton polo for everyday elegance.',
    images: [
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    ],
    variants: {
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Blue', value: '#2563EB' }],
    },
    status: 'Active',
  },
  {
    id: 'fallback-women-1',
    name: 'Summer Linen Blouse',
    sku: 'ZR-WOM-001',
    price: 2499,
    discountPrice: 1999,
    category: 'Women',
    subCategory: 'Blouses',
    stock: 8,
    description: 'Lightweight linen blouse with a clean silhouette.',
    images: [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800',
    ],
    variants: {
      sizes: ['S', 'M', 'L'],
      colors: [{ name: 'Cream', value: '#F5E7DA' }],
    },
    status: 'Active',
  },
  {
    id: 'fallback-kids-1',
    name: 'Colorful T-Shirt Set',
    sku: 'ZR-KID-001',
    price: 1299,
    discountPrice: 999,
    category: 'Kids',
    subCategory: 'T-Shirts',
    stock: 15,
    description: 'Comfortable and playful everyday wear for kids.',
    images: [
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=800',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
    ],
    variants: {
      sizes: ['2Y', '3Y', '4Y'],
      colors: [{ name: 'Multi', value: '#F59E0B' }],
    },
    status: 'Active',
  },
  {
    id: 'fallback-arrival-1',
    name: 'New Arrival Linen Shirt',
    sku: 'ZR-NEW-001',
    price: 2899,
    discountPrice: 2299,
    category: 'New Arrivals',
    subCategory: 'Trending',
    stock: 7,
    description: 'Fresh seasonal styling with premium fabric.',
    images: [
      'https://images.unsplash.com/photo-1596362051780-e7f40e5a90a9?w=800',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
    ],
    variants: {
      sizes: ['S', 'M', 'L'],
      colors: [{ name: 'Sand', value: '#D6C4A1' }],
    },
    status: 'Active',
  },
];

const toProductResponse = (product) => {
  if (!product) return null;

  if (product.toObject) {
    const doc = product.toObject();
    doc.id = doc._id.toString();
    delete doc._id;

    doc.images = (doc.images || []).filter((img) => typeof img === 'string' && !img.startsWith('blob:'));
    doc.image = doc.images[0] || '';
    doc.colors = doc.variants?.colors || [];
    doc.sizes = doc.variants?.sizes || [];
    doc.subCategory = doc.subCategory || '';
    doc.discount = doc.discount || 0;
    doc.brand = doc.brand || 'HAIERAH';
    doc.rating = doc.rating || 4.8;
    doc.reviews = doc.reviews || 248;
    doc.material = doc.material || 'Premium Fabric';
    doc.description = doc.description || 'Premium quality product crafted for style and comfort.';
    return doc;
  }

  return {
    ...product,
    images: (product.images || []).filter((img) => typeof img === 'string' && !img.startsWith('blob:')),
    image: (Array.isArray(product.images) ? product.images[0] : '') || '',
    colors: product.variants?.colors || [],
    sizes: product.variants?.sizes || [],
    subCategory: product.subCategory || '',
    discount: product.discount || 0,
    brand: product.brand || 'HAIERAH',
    rating: product.rating || 4.8,
    reviews: product.reviews || 248,
    material: product.material || 'Premium Fabric',
    description: product.description || 'Premium quality product crafted for style and comfort.',
    variants: product.variants || { sizes: [], colors: [] },
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

    if (Array.isArray(value) && value.length === 0) {
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
    ? updatePayload.images.filter((img) => typeof img === 'string' && img.trim() && !img.startsWith('blob:'))
    : (Array.isArray(existingData.images) ? existingData.images : []);

  if (updatePayload.variants && typeof updatePayload.variants === 'object') {
    updatePayload.variants = {
      sizes: Array.isArray(updatePayload.variants.sizes) ? updatePayload.variants.sizes.filter(Boolean) : [],
      colors: Array.isArray(updatePayload.variants.colors) ? updatePayload.variants.colors.filter((color) => color && (color.name || color.hex)) : [],
    };
  }

  return updatePayload;
};

const getProductsFromStore = async () => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return products.map(toProductResponse);
  } catch (error) {
    return fallbackProducts.map(toProductResponse);
  }
};

export const listProducts = async (_req, res) => {
  try {
    const products = await getProductsFromStore();
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(200).json({ success: true, products: fallbackProducts.map(toProductResponse) });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (product) {
      return res.status(200).json({ success: true, product: toProductResponse(product) });
    }

    const matchedProduct = fallbackProducts.find((item) => item.id === id);
    if (matchedProduct) {
      return res.status(200).json({ success: true, product: toProductResponse(matchedProduct) });
    }

    return res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    const matchedProduct = fallbackProducts.find((item) => item.id === id);
    if (matchedProduct) {
      return res.status(200).json({ success: true, product: toProductResponse(matchedProduct) });
    }

    return res.status(404).json({ message: 'Product not found' });
  }
};

const sendProductError = (res, error) => {
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
    res.status(201).json({ success: true, product: toProductResponse(product) });
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

    res.status(200).json({ success: true, product: toProductResponse(updatedProduct) });
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
