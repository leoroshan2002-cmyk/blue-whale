import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, Edit, UploadCloud, X, RefreshCw, FileSpreadsheet, Check, Eye } from 'lucide-react';
import { normalizeImageList } from '../../utils/productImages';

export const ProductsView = ({
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct
}) => {
  // STATE
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All'); // 'All' | 'Low' | 'OutOfStock'
  const [sortBy, setSortBy] = useState('latest'); // 'latest' | 'priceAsc' | 'priceDesc' | 'stockAsc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // INLINE EDITING STATE
  const [inlineEditingId, setInlineEditingId] = useState(null);
  const [inlinePrice, setInlinePrice] = useState('');
  const [inlineStock, setInlineStock] = useState('');

  // MODALS
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [activeView, setActiveView] = useState('list');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [detailDraft, setDetailDraft] = useState(null);
  const isDetailOpen = activeView === 'detail' && Boolean(selectedProductId);

  // FORM BINDINGS
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDiscountPrice, setFormDiscountPrice] = useState('');
  const [formCategory, setFormCategory] = useState('Women');
  const [formSubCategory, setFormSubCategory] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImages, setFormImages] = useState([]);
  const previewUrlsRef = useRef([]);

  const categorySubcategories = {
    Men: ['T-Shirts', 'Shirts', 'Jackets', 'Hoodies', 'Jeans', 'Footwear'],
    Women: ['Blouses', 'Dresses', 'Jeans', 'Tops', 'Handbags'],
    Kids: ['T-Shirts', 'Hoodies', 'Boys', 'Girls', 'Toys'],
    'New Arrivals': ['Trending', 'Best Sellers'],
    Unisex: ['T-Shirts', 'Hoodies', 'Jackets', 'Jeans', 'Footwear', 'Accessories', 'Bags'],
  };

  const normalizedCategories = Array.isArray(categories) ? categories : [];
  const fallbackProductImage = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80';

  const getCategoryByName = (categoryName) => {
    return normalizedCategories.find((cat) => (typeof cat === 'string' ? cat === categoryName : cat.name === categoryName));
  };


  const normalizeVariantColors = (variants = {}) => {
    const colors = Array.isArray(variants?.colors) ? variants.colors : [];
    return colors
      .filter(Boolean)
      .map((color) => {
        if (typeof color === 'string') {
          return { name: color, hex: '#cbd5e1' };
        }

        return {
          name: color?.name || 'Color',
          hex: color?.hex || '#cbd5e1'
        };
      });
  };

  const normalizeVariantSizes = (variants = {}) => {
    const sizes = Array.isArray(variants?.sizes) ? variants.sizes : [];
    return sizes
      .filter((size) => size != null && String(size).trim())
      .map((size) => String(size));
  };

  const resolveImageUrl = (imageValue) => {
    if (!imageValue || typeof imageValue !== 'string') return fallbackProductImage;

    const trimmedValue = imageValue.trim();
    if (!trimmedValue) return fallbackProductImage;
    if (/^https?:\/\//i.test(trimmedValue) || trimmedValue.startsWith('data:') || trimmedValue.startsWith('blob:')) {
      return trimmedValue;
    }

    const normalizedValue = trimmedValue.replace(/\\/g, '/');
    if (normalizedValue.startsWith('/')) return normalizedValue;
    if (normalizedValue.startsWith('uploads/')) return `/${normalizedValue}`;
    if (normalizedValue.startsWith('public/')) return `/${normalizedValue}`;
    return `/${normalizedValue}`;
  };

  const getProductDisplayImage = (images = []) => {
    const normalized = normalizeImageList(images);
    const persistent = normalized.find((url) => !url.startsWith('blob:')) || normalized[0] || '';
    return persistent ? resolveImageUrl(persistent) : fallbackProductImage;
  };

  const currentSubcategories = (() => {
    const category = getCategoryByName(formCategory);
    if (category) {
      if (Array.isArray(category.subCategories) && category.subCategories.length > 0) {
        return category.subCategories;
      }
      if (category.subCategory) {
        return [category.subCategory];
      }
    }
    return categorySubcategories[formCategory] || ['General'];
  })();
  const categoryOptions = normalizedCategories.map((cat) => (typeof cat === 'string' ? cat : cat.name));
  const [formImageFiles, setFormImageFiles] = useState([]);
  const [imageInputVal, setImageInputVal] = useState('');
  const [formSizes, setFormSizes] = useState(['S', 'M', 'L']);
  const [formColors, setFormColors] = useState([]);
  
  // Custom color creator inside form
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  
  // Active color for image preview
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  
  // Image-to-Color Association: maps image URL to color index
  const [imageColorMap, setImageColorMap] = useState({});

  // Bulk input
  const [bulkText, setBulkText] = useState('');
  const [bulkError, setBulkError] = useState(null);

  useEffect(() => {
    if (!formSubCategory || !currentSubcategories.includes(formSubCategory)) {
      setFormSubCategory(currentSubcategories[0]);
    }
  }, [currentSubcategories, formSubCategory]);

  // SEARCH AND PLOT FILTERING
  const safeProducts = useMemo(() => Array.isArray(products) ? products.filter(Boolean) : [], [products]);

  const filteredProducts = useMemo(() => {
    return safeProducts.filter((p) => {
      const productName = String(p?.name || '').toLowerCase();
      const productSku = String(p?.sku || '').toLowerCase();
      const searchText = String(searchTerm || '').toLowerCase();

      const matchesSearch = productName.includes(searchText) || productSku.includes(searchText);
      const matchesCategory = categoryFilter === 'All' || p?.category === categoryFilter;

      let matchesStock = true;
      const stockValue = Number(p?.stock ?? 0);
      if (stockFilter === 'Low') {
        matchesStock = stockValue > 0 && stockValue <= 5;
      } else if (stockFilter === 'OutOfStock') {
        matchesStock = stockValue === 0;
      }

      return matchesSearch && matchesCategory && matchesStock;
    }).sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime();
      }
      if (sortBy === 'priceAsc') {
        return Number(a?.price || 0) - Number(b?.price || 0);
      }
      if (sortBy === 'priceDesc') {
        return Number(b?.price || 0) - Number(a?.price || 0);
      }
      if (sortBy === 'stockAsc') {
        return Number(a?.stock || 0) - Number(b?.stock || 0);
      }
      return 0;
    });
  }, [safeProducts, searchTerm, categoryFilter, stockFilter, sortBy]);

  // PAGINATION
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return safeProducts.find((product) => (product.id || product._id) === selectedProductId) || null;
  }, [safeProducts, selectedProductId]);

  const detailImages = useMemo(() => normalizeImageList(selectedProduct?.images), [selectedProduct?.images]);
  const detailVariantColors = useMemo(() => normalizeVariantColors(selectedProduct?.variants), [selectedProduct?.variants]);
  const detailVariantSizes = useMemo(() => normalizeVariantSizes(selectedProduct?.variants), [selectedProduct?.variants]);

  const buildDetailDraft = (product) => ({
    name: product?.name || '',
    sku: product?.sku || '',
    price: product?.price ?? '',
    discountPrice: product?.discountPrice ?? '',
    category: product?.category || categoryOptions[0] || 'Women',
    subCategory: product?.subCategory || '',
    stock: product?.stock ?? '',
    description: product?.description || ''
  });

  useEffect(() => {
    if (selectedProduct) {
      setDetailDraft((prev) => {
        if (prev && prev.name === selectedProduct.name && prev.sku === selectedProduct.sku) {
          return prev;
        }
        return buildDetailDraft(selectedProduct);
      });
    }
  }, [selectedProduct, categoryOptions]);

  // SKU GENERATOR
  const autoGenerateSku = () => {
    const brandPattern = 'ZR';
    const catShort = formCategory ? formCategory.substring(0, 3).toUpperCase() : 'WMR';
    const randCode = Math.floor(100 + Math.random() * 900);
    const suffix = 'MS';
    setFormSku(`${brandPattern}-${catShort}-${randCode}-${suffix}`);
  };

  // GENERATE IMAGE NAME BASED ON COLOR
  const generateImageNameForColor = (colorName, colorIndex) => {
    const cleanName = formName.toUpperCase().replace(/\s+/g, '-').substring(0, 20);
    const cleanColor = colorName.toUpperCase().replace(/\s+/g, '-');
    const skuPart = formSku.substring(0, 8);
    return `${cleanName}-${cleanColor}-${skuPart}-${colorIndex + 1}`;
  };

  // EXTRACT DOMINANT COLOR FROM IMAGE
  const extractColorFromImage = (imageUrl) => {
    return new Promise((resolve) => {
      if (!imageUrl || typeof imageUrl !== 'string') {
        resolve('#808080');
        return;
      }

      const isRemoteImage = /^https?:\/\//i.test(imageUrl) || imageUrl.startsWith('data:');
      if (isRemoteImage) {
        resolve('#808080');
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve('#808080');
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const colors = {};

          for (let i = 0; i < data.length; i += 16) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a < 200) continue;

            const isGrayscale = Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && Math.abs(r - b) < 30;
            if (isGrayscale) continue;

            const hexColor = `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0').toUpperCase()}`;
            colors[hexColor] = (colors[hexColor] || 0) + 1;
          }

          const dominantColor = Object.keys(colors).reduce((a, b) => colors[a] > colors[b] ? a : b, '#808080');
          resolve(dominantColor);
        } catch {
          resolve('#808080');
        }
      };
      img.onerror = () => resolve('#808080');
      img.src = imageUrl;
    });
  };

  // EXTRACT AND ADD COLORS FROM ALL IMAGES
  const extractColorsFromImages = async () => {
    if (formImages.length === 0) {
      alert('Please upload at least one image first.');
      return;
    }
    
    const newColors = [];
    const newColorMap = { ...imageColorMap };
    
    for (let idx = 0; idx < formImages.length; idx++) {
      const imageUrl = formImages[idx];
      const hexColor = await extractColorFromImage(imageUrl);
      
      // Check if this color already exists
      const existingColorIndex = formColors.findIndex(c => c.hex.toUpperCase() === hexColor.toUpperCase());
      
      if (existingColorIndex >= 0) {
        // Color exists, associate image with it
        newColorMap[imageUrl] = existingColorIndex;
      } else {
        // New color, add it
        const colorName = hexToColorName(hexColor);
        const newColorIndex = formColors.length + newColors.length;
        newColors.push({ name: colorName, hex: hexColor });
        // Associate image with new color
        newColorMap[imageUrl] = newColorIndex;
      }
    }
    
    if (newColors.length > 0) {
      setFormColors([...formColors, ...newColors]);
      setImageColorMap(newColorMap);
      alert(` Added ${newColors.length} color(s) from images!\n\nImages are now organized by color.`);
    } else {
      // Update color associations even if no new colors
      setImageColorMap(newColorMap);
      alert('All image colors already exist! Images have been organized by their matching colors.');
    }
  };

  // HEX TO COLOR NAME CONVERSION
  const hexToColorName = (hex) => {
    const colorNames = {
      '#000000': 'Pure Black',
      '#FFFFFF': 'Pure White',
      '#FF0000': 'Crimson Red',
      '#00FF00': 'Lime Green',
      '#0000FF': 'Royal Blue',
      '#FFFF00': 'Golden Yellow',
      '#FF00FF': 'Magenta',
      '#00FFFF': 'Cyan',
      '#808080': 'Neutral Gray',
      '#FFA500': 'Warm Orange',
      '#800080': 'Deep Purple',
      '#FFC0CB': 'Blush Pink',
      '#A52A2A': 'Rich Brown',
    };
    
    // Check exact match first
    if (colorNames[hex.toUpperCase()]) {
      return colorNames[hex.toUpperCase()];
    }
    
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Find closest named color
    let closestName = 'Custom Color';
    let closestDistance = Infinity;
    
    Object.entries(colorNames).forEach(([color, name]) => {
      const cr = parseInt(color.slice(1, 3), 16);
      const cg = parseInt(color.slice(3, 5), 16);
      const cb = parseInt(color.slice(5, 7), 16);
      const distance = Math.sqrt((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestName = name;
      }
    });
    
    return closestName;
  };

  const openProductDetails = (p) => {
    setSelectedProductId(p.id || p._id);
    setDetailDraft(buildDetailDraft(p));
    setActiveView('detail');
  };

  const closeProductDetails = () => {
    setActiveView('list');
    setSelectedProductId(null);
    setDetailDraft(null);
  };

  const handleDeleteSelectedProduct = () => {
    if (!selectedProduct) return;
    if (confirm(`Confirm deletion of garment listing "${selectedProduct.name}"?`)) {
      onDeleteProduct(selectedProduct.id || selectedProduct._id);
      closeProductDetails();
    }
  };

  const handleEditSelectedProduct = () => {
    if (!selectedProduct) return;
    openEditForm(selectedProduct);
  };

  const handleSaveSelectedProduct = (e) => {
    e.preventDefault();
    if (!selectedProduct || !detailDraft) return;

    const nextPrice = parseFloat(detailDraft.price);
    const nextDiscountPrice = detailDraft.discountPrice === '' || detailDraft.discountPrice == null ? null : parseFloat(detailDraft.discountPrice);
    const nextStock = parseInt(detailDraft.stock, 10);

    if (!detailDraft.name || !detailDraft.sku || Number.isNaN(nextPrice) || Number.isNaN(nextStock)) {
      alert('Please complete the name, SKU, price, and stock before saving.');
      return;
    }

    onUpdateProduct({
      ...selectedProduct,
      name: detailDraft.name,
      sku: detailDraft.sku,
      price: Number.isNaN(nextPrice) ? selectedProduct.price : nextPrice,
      discountPrice: Number.isNaN(nextDiscountPrice) ? null : nextDiscountPrice,
      category: detailDraft.category,
      subCategory: detailDraft.subCategory,
      stock: Number.isNaN(nextStock) ? selectedProduct.stock : nextStock,
      description: detailDraft.description,
      images: selectedProduct.images || [],
      variants: selectedProduct.variants || { sizes: [], colors: [] }
    });
  };

  const detailCurrentSubcategories = useMemo(() => {
    const category = getCategoryByName(detailDraft?.category || 'Women');
    if (category) {
      if (Array.isArray(category.subCategories) && category.subCategories.length > 0) return category.subCategories;
      if (category.subCategory) return [category.subCategory];
    }
    return categorySubcategories[detailDraft?.category || 'Women'] || ['General'];
  }, [detailDraft?.category, categorySubcategories]);

  // OPEN EDITOR Modal FOR ADD
  const openAddForm = () => {
    setEditingProduct(null);
    const categoryName = categoryOptions[0] || 'Women';
    const category = getCategoryByName(categoryName);
    const defaultSubcategory = category?.subCategories?.[0] || category?.subCategory || categorySubcategories[categoryName]?.[0] || 'General';

    setFormName('');
    setFormSku('');
    setFormPrice('');
    setFormDiscountPrice('');
    setFormCategory(categoryName);
    setFormSubCategory(defaultSubcategory);
    setFormStock('');
    setFormDescription('');
    setFormImages([]);
    setFormImageFiles([]);
    setFormSizes(['S', 'M', 'L']);
    setFormColors([
      
    ]);
    setActiveColorIndex(0);
    setImageColorMap({});
    setIsEditorOpen(true);
  };

  // OPEN EDITOR For EDIT
  const openEditForm = (p) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSku(p.sku);
    setFormPrice(p.price.toString());
    setFormDiscountPrice(p.discountPrice ? p.discountPrice.toString() : '');
    setFormCategory(p.category);
    const category = getCategoryByName(p.category);
    setFormSubCategory(
      p.subCategory || category?.subCategories?.[0] || category?.subCategory || categorySubcategories[p.category]?.[0] || ''
    );
    setFormStock(p.stock.toString());
    setFormDescription(p.description);
    setFormImages(Array.isArray(p.images) ? p.images : []);
    setFormImageFiles([]);
    setFormSizes(p.variants?.sizes || []);
    setFormColors(p.variants?.colors || []);
    setActiveColorIndex(0);
    setImageColorMap({});
    setIsEditorOpen(true);
  };

  // SAVE PRODUCT
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!formName || !formSku || !formPrice || !formStock || !formSubCategory) {
      alert('Please fill out Name, SKU, Price, Stock and Subcategory parameters.');
      return;
    }

    const priceNum = parseFloat(formPrice);
    const discountNum = formDiscountPrice ? parseFloat(formDiscountPrice) : null;
    const stockNum = parseInt(formStock, 10);
    const normalizedImages = normalizeImageList(formImages);
    const normalizedSizes = Array.isArray(formSizes) ? formSizes.filter(Boolean) : [];
    const normalizedColors = Array.isArray(formColors) ? formColors.filter((color) => color && (color.name || color.hex)) : [];

    const productPayload = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: formName,
      sku: formSku,
      price: isNaN(priceNum) ? 0 : priceNum,
      discountPrice: discountNum && !isNaN(discountNum) ? discountNum : null,
      category: formCategory,
      subCategory: formSubCategory.trim(),
      stock: isNaN(stockNum) ? 0 : stockNum,
      images: normalizedImages,
      imageFiles: formImageFiles,
      variants: {
        sizes: normalizedSizes,
        colors: normalizedColors
      },
      description: formDescription || 'Premium luxury designed item belonging to the new Hyra apparel drops.',
      status: 'Active',
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
    };

    if (editingProduct) {
      onUpdateProduct(productPayload);
    } else {
      onAddProduct(productPayload);
    }
    setIsEditorOpen(false);
  };

  // ADD IMAGES
  const addImageUrl = () => {
    if (imageInputVal.trim()) {
      const newImageUrl = imageInputVal.trim();
      setFormImages([...formImages, newImageUrl]);
      // Associate image with active color
      setImageColorMap(prev => ({
        ...prev,
        [newImageUrl]: activeColorIndex
      }));
      setImageInputVal('');
    }
  };

  const removeImageUrl = (imageUrl) => {
    setFormImages(formImages.filter(img => img !== imageUrl));
    // Remove from color map
    setImageColorMap(prev => {
      const newMap = { ...prev };
      delete newMap[imageUrl];
      return newMap;
    });
    if (imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl);
      previewUrlsRef.current = previewUrlsRef.current.filter((url) => url !== imageUrl);
    }
  };

  const handleImageFiles = (event) => {
    const files = Array.from(event.target.files || []);
    
    // Convert files to URLs and add to formImages
    files.forEach(file => {
      const preview = URL.createObjectURL(file);
      previewUrlsRef.current.push(preview);
      setFormImages(current => [...current, preview]);
      // Associate file preview with active color
      setImageColorMap(prev => ({
        ...prev,
        [preview]: activeColorIndex
      }));
    });
    
    // Keep track of uploaded files for form submission
    setFormImageFiles((current) => [...current, ...files]);
    event.target.value = '';
  };

  // GET IMAGES FOR A SPECIFIC COLOR
  const getImagesForColor = (colorIndex) => {
    return formImages.filter(img => imageColorMap[img] === colorIndex);
  };

  // GET ALL IMAGES FOR ACTIVE COLOR
  const activeColorImages = getImagesForColor(activeColorIndex);

  // MULTIPLE SIZES TOGGLE
  const toggleSize = (size) => {
    if (formSizes.includes(size)) {
      setFormSizes(formSizes.filter(s => s !== size));
    } else {
      setFormSizes([...formSizes, size]);
    }
  };

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
      previewUrlsRef.current = [];
    };
  }, []);

  // COLORS ADD / REMOVE
  const addFormColor = () => {
    if (newColorName.trim()) {
      setFormColors([...formColors, { name: newColorName.trim(), hex: newColorHex }]);
      setNewColorName('');
    }
  };

  const removeFormColor = (index) => {
    setFormColors(formColors.filter((_, l) => l !== index));
  };

  // INLINE PRICE & STOCK MODIFICATION
  const startInlineEditing = (p) => {
    setInlineEditingId(p.id);
    setInlinePrice(p.price.toString());
    setInlineStock(p.stock.toString());
  };

  const saveInlineEditing = (p) => {
    const updatedPrice = parseFloat(inlinePrice);
    const updatedStock = parseInt(inlineStock, 10);

    onUpdateProduct({
      ...p,
      price: isNaN(updatedPrice) ? p.price : updatedPrice,
      stock: isNaN(updatedStock) ? p.stock : updatedStock
    });
    setInlineEditingId(null);
  };

  // BULK BATCH PARSING
  const handleBulkUpload = () => {
    setBulkError(null);
    if (!bulkText.trim()) {
      setBulkError('Please paste either a JSON array or CSV text list.');
      return;
    }

    try {
      if (bulkText.trim().startsWith('[')) {
        const parsed = JSON.parse(bulkText);
        if (Array.isArray(parsed)) {
          parsed.forEach((item, idx) => {
            const product = {
              id: item.id || `prod-bulk-${Date.now()}-${idx}`,
              name: item.name || `Imported Item #${idx + 1}`,
              sku: item.sku || `ZR-BLK-${Math.floor(100 + Math.random() * 900)}`,
              price: Number(item.price) || 49.90,
              discountPrice: item.discountPrice ? Number(item.discountPrice) : null,
              category: item.category || 'New Arrivals',
              subCategory: item.subCategory ? String(item.subCategory).trim() : 'General',
              stock: Number(item.stock) || 12,
              images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [
                'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80'
              ],
              variants: item.variants || {
                sizes: ['S', 'M', 'L'],
                colors: [{ name: 'Sandal Beige', hex: '#E5D3BE' }]
              },
              description: item.description || 'Raw imported boutique apparel.',
              status: 'Active',
              createdAt: new Date().toISOString()
            };
            onAddProduct(product);
          });
          setIsBulkOpen(false);
          setBulkText('');
          return;
        }
      }

      const lines = bulkText.split('\n');
      let count = 0;
      lines.forEach((line) => {
        const parts = line.split(',');
        if (parts.length >= 4 && parts[0].trim() !== 'Name') {
          const name = parts[0].trim();
          const sku = parts[1].trim();
          const price = parseFloat(parts[2].trim());
          const category = parts[3].trim();
          const stock = parts[4] ? parseInt(parts[4].trim(), 10) : 10;

          if (name && sku && !isNaN(price)) {
            const product = {
              id: `prod-csv-${Date.now()}-${count}`,
              name,
              sku,
              price,
              discountPrice: null,
              category: categories.includes(category) ? category : (categories[0] || 'Women'),
              subCategory: 'General',
              stock: isNaN(stock) ? 8 : stock,
              images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80'],
              variants: {
                sizes: ['S', 'M', 'L'],
                colors: [{ name: 'Neutral Stone', hex: '#D6CFC7' }]
              },
              description: 'Quick CSV Batch Import listing.',
              status: 'Active',
              createdAt: new Date().toISOString()
            };
            onAddProduct(product);
            count++;
          }
        }
      });

      if (count > 0) {
        setIsBulkOpen(false);
        setBulkText('');
      } else {
        setBulkError('Format incorrect. Use CSV format "Name, SKU, Price, Category, Stock" or JSON array.');
      }
    } catch (e) {
      setBulkError(`Parsing exception: ${e.message}`);
    }
  };

  if (activeView === 'detail' && selectedProduct && detailDraft) {
    return (
      <div className="space-y-6" id="product-detail-view">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <button
              onClick={closeProductDetails}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              ← Back to product list
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">{selectedProduct.name}</h2>
            <p className="text-xs text-slate-500 mt-1">Manage this product from its dedicated detail page.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDeleteSelectedProduct}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-xs font-semibold"
            >
              Delete Listing
            </button>
            <button
              onClick={handleEditSelectedProduct}
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-semibold"
            >
              Edit Full Details
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-sm">
              <img
                src={getProductDisplayImage(detailImages)}
                alt={selectedProduct.name}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = fallbackProductImage;
                }}
              />
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900 shadow-sm">
              <div className="text-[10px] uppercase tracking-[0.25em] font-semibold text-slate-400">Product overview</div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-400">SKU</p>
                  <p className="mt-1 font-semibold text-slate-700 dark:text-slate-200">{selectedProduct.sku}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-400">Category</p>
                  <p className="mt-1 font-semibold text-slate-700 dark:text-slate-200">{selectedProduct.category}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-400">Status</p>
                  <p className="mt-1 font-semibold text-slate-700 dark:text-slate-200">{selectedProduct.status || 'Active'}</p>
                </div>
              </div>
              <div className="mt-5 rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/80 dark:bg-slate-950/50">
                <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-400">Description</div>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {selectedProduct.description || 'No description provided for this listing.'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900 shadow-sm">
            <div className="text-[10px] uppercase tracking-[0.25em] font-semibold text-slate-400">Quick update</div>
            <form onSubmit={handleSaveSelectedProduct} className="mt-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Product Name</label>
                <input
                  type="text"
                  value={detailDraft.name}
                  onChange={(e) => setDetailDraft((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">SKU</label>
                <input
                  type="text"
                  value={detailDraft.sku}
                  onChange={(e) => setDetailDraft((prev) => ({ ...prev, sku: e.target.value }))}
                  className="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none font-mono"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Base Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={detailDraft.price}
                    onChange={(e) => setDetailDraft((prev) => ({ ...prev, price: e.target.value }))}
                    className="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Sale Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={detailDraft.discountPrice}
                    onChange={(e) => setDetailDraft((prev) => ({ ...prev, discountPrice: e.target.value }))}
                    className="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Category</label>
                  <select
                    value={detailDraft.category}
                    onChange={(e) => setDetailDraft((prev) => ({ ...prev, category: e.target.value, subCategory: '' }))}
                    className="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none"
                  >
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Subcategory</label>
                  <select
                    value={detailDraft.subCategory}
                    onChange={(e) => setDetailDraft((prev) => ({ ...prev, subCategory: e.target.value }))}
                    className="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none"
                  >
                    {detailCurrentSubcategories.map((subcat) => (
                      <option key={subcat} value={subcat}>{subcat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Stock</label>
                <input
                  type="number"
                  value={detailDraft.stock}
                  onChange={(e) => setDetailDraft((prev) => ({ ...prev, stock: e.target.value }))}
                  className="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Description</label>
                <textarea
                  rows={5}
                  value={detailDraft.description}
                  onChange={(e) => setDetailDraft((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="products-tab-panel">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-dark">Product Management</h2>
          <p className="text-xs text-slate-500 mt-1">Configure listings, categories mapping, sizing variants, and retail pricing.</p>
        </div>
        <div className="flex gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setIsBulkOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Bulk Paste
          </button>
          
          <button
            onClick={openAddForm}
            className="flex items-center gap-1.5 px-4 font-bold py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Garment
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full text-xs font-medium pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 dark:text-white"
          />
        </div>

        {/* Action Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Section:</span>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white rounded-md font-bold focus:outline-none"
            >
              <option value="All">All Categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Stock:</span>
            <select
              value={stockFilter}
              onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white rounded-md font-bold focus:outline-none"
            >
              <option value="All">All Inventory</option>
              <option value="Low">Low Stock (&le; 5)</option>
              <option value="OutOfStock">Out of Stock (0)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Order:</span>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white rounded-md font-bold focus:outline-none"
            >
              <option value="latest">Newest Releases</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="stockAsc">Critical Low Stock First</option>
            </select>
          </div>
        </div>
      </div>

      {/* MASTER GARMENTS TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-black tracking-widest text-slate-400 bg-slate-50/50 dark:bg-slate-950/20">
                <th className="py-4 px-4">Garment</th>
                <th className="py-4 px-3">SKU</th>
                <th className="py-4 px-3">Category</th>
                <th className="py-4 px-3">Pricing Details</th>
                <th className="py-4 px-3">Fulfillment Stock</th>
                <th className="py-4 px-3">Variants</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No garments match the current filters. Add a new listing to start.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p, index) => {
                  const isEditingThis = inlineEditingId === p.id;
                  const productKey = `${p.id || 'product'}-${p.sku || 'sku'}-${index}`;
                  const variantData = p.variants || {};
                  const colorList = normalizeVariantColors(variantData);
                  const sizeList = normalizeVariantSizes(variantData);
                  
                  return (
                    <tr key={productKey} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-all group">
                      {/* Image + Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={getProductDisplayImage(p.images)}
                            className="w-12 h-14 object-cover rounded shadow-sm border border-slate-100 dark:border-slate-800"
                            alt={p.name}
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = fallbackProductImage;
                            }}
                          />
                          <div className="max-w-[200px]">
                            <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{p.name}</h4>
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5 max-w-full space-x-1.5">
                              <span className="font-bold text-slate-500">{colorList.length} Colors</span>
                              <span>&bull;</span>
                              <span className="font-bold text-slate-500">{sizeList.join(', ') || 'No sizes'}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 font-bold">{p.sku}</td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-bold text-[10px]">
                            {p.category}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 rounded text-[9px]">
                            {p.subCategory || 'General'}
                          </span>
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="py-3 px-3">
                        {isEditingThis ? (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 font-bold">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              value={inlinePrice}
                              onChange={(e) => setInlinePrice(e.target.value)}
                              className="w-16 p-1 border rounded bg-slate-50 text-xs font-mono dark:bg-slate-950 dark:text-white focus:outline-none"
                            />
                          </div>
                        ) : (
                          <div>
                            {p.discountPrice ? (
                              <div className="flex flex-col">
                                <span className="font-black text-rose-600">₹{p.discountPrice}</span>
                                <span className="text-[10px] text-slate-400 line-through">₹{p.price}</span>
                              </div>
                            ) : (
                              <span className="font-black text-slate-800 dark:text-slate-200">₹{p.price}</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Stock Level */}
                      <td className="py-3 px-3">
                        {isEditingThis ? (
                          <input
                            type="number"
                            value={inlineStock}
                            onChange={(e) => setInlineStock(e.target.value)}
                            className="w-16 p-1 border rounded bg-slate-50 text-xs font-mono dark:bg-slate-950 dark:text-white focus:outline-none"
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${
                              p.stock === 0 ? 'bg-rose-600' : p.stock <= 5 ? 'bg-amber-500' : 'bg-teal-500'
                            }`} />
                            <span className="font-bold font-mono text-[11px] text-slate-700 dark:text-slate-300">
                              {p.stock} units
                            </span>
                            {p.stock === 0 && <span className="text-[9px] font-mono text-rose-500 font-black uppercase">OUT</span>}
                            {p.stock > 0 && p.stock <= 5 && <span className="text-[9px] font-mono text-amber-500 font-bold uppercase">LOW</span>}
                          </div>
                        )}
                      </td>

                      {/* Color dots preview */}
                      <td className="py-3 px-3">
                        <div className="flex gap-1">
                          {colorList.map((c, i) => (
                            <span
                              key={`${productKey}-color-${i}-${c.name || 'color'}`}
                              style={{ backgroundColor: c.hex || '#e2e8f0' }}
                              className="w-3 h-3 rounded-full border border-slate-300 inline-block shadow-sm"
                              title={c.name || 'Color'}
                            />
                          ))}
                        </div>
                      </td>

                      {/* Inline Actions */}
                      <td className="py-3 px-4 text-right">
                        {isEditingThis ? (
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => saveInlineEditing(p)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded"
                              title="Commit Inline State"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setInlineEditingId(null)}
                              className="p-1 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => startInlineEditing(p)}
                              className="inline-flex self-center px-1.5 py-0.5 border border-slate-200 text-[10px] text-slate-500 rounded hover:bg-slate-50 dark:hover:bg-slate-850 font-bold mr-1.5 focus:outline-none"
                            >
                              Quick Edit
                            </button>
                            <button
                              onClick={() => openProductDetails(p)}
                              className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded focus:outline-none"
                              title="View Product Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditForm(p)}
                              className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded focus:outline-none"
                              title="Full Edit Details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Confirm deletion of garment listing "${p.name}"?`)) {
                                  onDeleteProduct(p.id || p._id);
                                }
                              }}
                              className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded focus:outline-none"
                              title="Delete Listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION PANEL */}
        {filteredProducts.length > itemsPerPage && (
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50/50 dark:bg-slate-950/20 text-xs text-left">
            <span className="text-slate-500">
              Showing <span className="font-bold text-slate-800 dark:text-slate-200">{(currentPage - 1) * itemsPerPage + 1}</span>-
              <span className="font-bold text-slate-800 dark:text-slate-200">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> of{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">{filteredProducts.length}</span> garments
            </span>

            <div className="flex gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-2.5 py-1.5 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-40 text-[11px] font-bold"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={`page-${i}`}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 flex items-center justify-center border rounded font-black text-[11px] ${
                    currentPage === i + 1 ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-white border-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2.5 py-1.5 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-40 text-[11px] font-bold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PRODUCT DETAILS MODAL */}
      {isDetailOpen && selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <div className="flex justify-between items-start gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                    {selectedProduct.category}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/20 text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                    {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedProduct.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">SKU {selectedProduct.sku}</p>
                </div>
              </div>
              <button onClick={closeProductDetails} className="p-1 px-2 border border-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <img
                    src={getProductDisplayImage(selectedProduct.images)}
                    alt={selectedProduct.name}
                    className="w-full h-72 object-cover"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = fallbackProductImage;
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Description</div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-6">
                    {selectedProduct.description || 'No description provided for this listing.'}
                  </p>
                </div>
                {detailImages.length > 1 && (
                  <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Gallery</div>
                    <div className="grid grid-cols-3 gap-2">
                      {detailImages.slice(0, 6).map((image, index) => (
                        <img
                          key={`${selectedProduct.id || selectedProduct._id}-detail-${index}`}
                          src={resolveImageUrl(image)}
                          alt={`${selectedProduct.name} ${index + 1}`}
                          className="h-24 w-full object-cover rounded-lg border border-slate-200 dark:border-slate-800"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = fallbackProductImage;
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-950/40">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Pricing</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    {selectedProduct.discountPrice ? (
                      <>
                        <span className="text-xl font-black text-rose-600">₹{selectedProduct.discountPrice}</span>
                        <span className="text-sm text-slate-400 line-through">₹{selectedProduct.price}</span>
                      </>
                    ) : (
                      <span className="text-xl font-black text-slate-900 dark:text-white">₹{selectedProduct.price}</span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-950/40 space-y-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Subcategory</div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{selectedProduct.subCategory || 'General'}</p>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Sizes</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {detailVariantSizes.map((size) => (
                        <span key={`${selectedProduct.id || selectedProduct._id}-size-${size}`} className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Colors</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {detailVariantColors.map((color, index) => (
                        <span key={`${selectedProduct.id || selectedProduct._id}-color-${color.name || index}`} className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          <span className="w-2.5 h-2.5 rounded-full border border-slate-300" style={{ backgroundColor: color.hex || '#cbd5e1' }} />
                          {color.name || `Color ${index + 1}`}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-6 flex flex-wrap justify-end gap-2.5">
              <button
                onClick={closeProductDetails}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={handleDeleteSelectedProduct}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-xs font-semibold"
              >
                Delete Listing
              </button>
              <button
                onClick={handleEditSelectedProduct}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-semibold"
              >
                Edit Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL RECORD EDITOR DIALOG / SLIDE-OVER MODAL */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" id="garment-form-modal">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <div className="text-left">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingProduct ? 'Update Luxury Listing' : 'Introduce New Garment'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Configure retail specification parameters & catalog listing options.</p>
              </div>
              <button onClick={() => setIsEditorOpen(false)} className="p-1 px-2 border border-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5 text-left text-xs font-medium">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Apparel Title</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Linen Linen Pleated Trousers"
                    className="w-full border border-slate-200 p-2 rounded-lg bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">SKU Identity Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      placeholder="ZR-PT-076-OL"
                      className="w-full border border-slate-200 p-2 rounded-lg font-mono text-xs bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={autoGenerateSku}
                      className="px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg"
                      title="Auto Create SKU"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Retail Base Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="79.00"
                    className="w-full border border-slate-200 p-2 rounded-lg bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Discounted Price (₹) - Optional</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formDiscountPrice}
                    onChange={(e) => setFormDiscountPrice(e.target.value)}
                    placeholder="e.g. 59.90 (Leave blank if full price)"
                    className="w-full border border-slate-200 p-2 rounded-lg bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Category Section Assignment</label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      const selectedCategory = e.target.value;
                      setFormCategory(selectedCategory);
                      const category = getCategoryByName(selectedCategory);
                      const nextSub = category?.subCategories?.[0] || category?.subCategory || categorySubcategories[selectedCategory]?.[0] || 'General';
                      setFormSubCategory(nextSub);
                    }}
                    className="w-full border border-slate-200 p-2 rounded-lg bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none font-bold"
                  >
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Subcategory</label>
                  <select
                    required
                    value={formSubCategory}
                    onChange={(e) => setFormSubCategory(e.target.value)}
                    className="w-full border border-slate-200 p-2 rounded-lg bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none font-bold"
                  >
                    {currentSubcategories.map((subcat, index) => (
                      <option key={`${formCategory || 'category'}-${subcat}-${index}`} value={subcat}>{subcat}</option>
                    ))}
                  </select>
                  <p className="text-[9px] text-slate-500">Select the store page subcategory so user category routes filter correctly.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Starting Stock quantity</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    placeholder="25"
                    className="w-full border border-slate-200 p-2 rounded-lg bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">E-commerce Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detail the materials used (linen weave, cashmere density), closures, lapels, and fits of the Hyra styled item..."
                  className="w-full border border-slate-200 p-2 rounded-lg bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Active Sizing Options (Multiple selection)</label>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', '2Y', '4Y', '6Y', '8Y'].map(size => {
                    const active = formSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-3 py-1.5 border rounded-lg font-black transition-all text-[11px] focus:outline-none ${
                          active ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ===== INTEGRATED COLORS & GALLERY ===== */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Fabric Colors & Media Gallery ({formColors.length} colors • {formImages.length} images)</label>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
                  
                  {/* COLOR PALETTE SECTION */}
                  <div className="space-y-2.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Color Palette</div>
                    
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {formColors.map((col, index) => {
                        const imagesInColor = getImagesForColor(index).length;
                        const isActive = activeColorIndex === index;
                        return (
                          <button
                            key={`${formName || 'product'}-color-${col.name || index}-${index}`}
                            type="button"
                            onClick={() => setActiveColorIndex(index)}
                            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg transition-all border-2 ${
                              isActive
                                ? 'border-amber-500 bg-white dark:bg-slate-800 shadow-md scale-105'
                                : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600'
                            }`}
                            title={`${col.name} (${imagesInColor} image${imagesInColor !== 1 ? 's' : ''})`}
                          >
                            <div className="flex items-center gap-1">
                              <span 
                                className="w-5 h-5 rounded-full border-2 border-white shadow" 
                                style={{ backgroundColor: col.hex }}
                              />
                              {isActive && <span className="text-amber-500 font-black text-xs">✓</span>}
                            </div>
                            <span className="text-[8px] font-bold text-slate-700 dark:text-slate-300 text-center line-clamp-2 max-w-full">
                              {col.name}
                            </span>
                            <span className="text-[7px] font-black text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
                              {imagesInColor}
                            </span>
                          </button>
                        );
                      })}
                      
                      {/* Add Color Button */}
                      {formColors.length < 12 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (newColorName.trim()) {
                              addFormColor();
                            }
                          }}
                          className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all text-slate-400 hover:text-amber-600"
                          title="Add new color"
                        >
                          <span className="text-lg font-bold">+</span>
                          <span className="text-[7px] font-bold uppercase tracking-wider">New</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ACTIVE COLOR INFO & IMAGE GALLERY */}
                  <div className="border-t border-slate-300 dark:border-slate-700 pt-4 space-y-3">
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-white shadow"
                          style={{ backgroundColor: formColors[activeColorIndex]?.hex || '#808080' }}
                        />
                        <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300">
                          {formColors[activeColorIndex]?.name || 'No Color'}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          {activeColorImages.length} image{activeColorImages.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500">
                        {generateImageNameForColor(formColors[activeColorIndex]?.name || 'default', activeColorIndex)}.jpg
                      </span>
                    </div>

                    {/* GALLERY FOR ACTIVE COLOR */}
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {activeColorImages.map((img, index) => (
                        <div key={`${activeColorIndex}-${img}-${index}`} className="relative group rounded-lg border-2 border-amber-300 dark:border-amber-700 overflow-hidden aspect-[4/5] bg-slate-200 dark:bg-slate-800 shadow-md">
                          <img src={img} className="w-full h-full object-cover" alt={formColors[activeColorIndex]?.name} />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
                          <button
                            type="button"
                            onClick={() => removeImageUrl(img)}
                            className="absolute top-1 right-1 p-1 bg-rose-500/80 hover:bg-rose-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                            title="Remove this image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {/* Upload Zone for Active Color */}
                      <label className="border-2 border-dashed border-slate-400 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center p-2 cursor-pointer text-slate-500 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 aspect-[4/5] transition-all">
                        <UploadCloud className="w-5 h-5" />
                        <span className="text-[7px] font-bold uppercase mt-1 text-center">Add to {formColors[activeColorIndex]?.name}</span>
                        <input type="file" accept="image/*" multiple onChange={handleImageFiles} className="sr-only" />
                      </label>
                    </div>

                    {activeColorImages.length === 0 && (
                      <div className="text-center py-6 text-slate-400 text-[10px]">
                        No images for this color yet. Upload images above or add URLs below.
                      </div>
                    )}
                  </div>

                  {/* URL INPUT & ACTIONS */}
                  <div className="border-t border-slate-300 dark:border-slate-700 pt-3 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={imageInputVal}
                        onChange={(e) => setImageInputVal(e.target.value)}
                        placeholder="Paste image URL..."
                        className="flex-1 border border-slate-300 dark:border-slate-700 p-2 rounded-lg bg-white dark:bg-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={addImageUrl}
                        className="px-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-bold transition-all"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex gap-2">
                      {formImages.length > 0 && (
                        <button
                          type="button"
                          onClick={extractColorsFromImages}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
                          title="Analyze all images and auto-assign colors"
                        >
                          <span> Extract & Organize by Color</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ADD NEW COLOR SECTION
                  {formColors.length < 12 && (
                    <div className="border-t border-slate-300 dark:border-slate-700 pt-3 space-y-2">
                      <div className="text-[9px] font-black uppercase text-slate-500">Add New Color</div>
                      <div className="flex gap-2 items-end">
                        <div className="flex-grow">
                          <input
                            type="text"
                            value={newColorName}
                            onChange={(e) => setNewColorName(e.target.value)}
                            placeholder="Color name..."
                            className="w-full border border-slate-300 dark:border-slate-700 p-1.5 bg-white dark:bg-slate-900 dark:text-white rounded text-xs focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="color"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer"
                          />
                          <span className="font-mono text-[9px] font-bold text-slate-600 dark:text-slate-400">{newColorHex}</span>
                        </div>
                        <button
                          type="button"
                          onClick={addFormColor}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded transition-all"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )} */}

                  ALL IMAGES OVERVIEW
                  {formImages.length > 0 && (
                    <div className="border-t border-slate-300 dark:border-slate-700 pt-3 space-y-2">
                      <div className="text-[9px] font-black uppercase text-slate-500 flex items-center justify-between">
                        <span>All Images Overview ({formImages.length} total)</span>
                        {formImages.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Clear all images? This cannot be undone.')) {
                                previewUrlsRef.current.forEach((url) => {
                                  if (url.startsWith('blob:')) URL.revokeObjectURL(url);
                                });
                                previewUrlsRef.current = [];
                                setFormImages([]);
                                setImageColorMap({});
                                setFormImageFiles([]);
                              }
                            }}
                            className="text-rose-500 hover:text-rose-700 text-[10px] font-bold"
                            title="Clear all images"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      <div className="max-h-48 overflow-y-auto bg-slate-100 dark:bg-slate-950 rounded p-2 space-y-1">
                        {formColors.map((color, colorIdx) => {
                          const colorImages = getImagesForColor(colorIdx);
                          if (colorImages.length === 0) return null;
                          return (
                            <div key={colorIdx} className="text-[9px] space-y-1">
                              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                <span 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: color.hex }}
                                />
                                <span>{color.name}</span>
                                <span className="bg-slate-200 dark:bg-slate-800 px-1.5 rounded text-[8px] font-black">
                                  {colorImages.length}
                                </span>
                              </div>
                              <div className="ml-4 space-y-0.5">
                                {colorImages.map((img, index) => (
                                  <div key={`${colorIdx}-${img}-${index}`} className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-1 rounded text-[8px] text-slate-600 dark:text-slate-400 group hover:bg-rose-50 dark:hover:bg-rose-950/20">
                                    <span className="truncate font-mono max-w-xs">
                                      {img.substring(0, 40)}...
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeImageUrl(img)}
                                      className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 font-black text-xs"
                                      title="Remove"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-6 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 text-xs shadow"
                >
                  Confirm Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK UPLOAD MODAL */}
      {isBulkOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" id="bulk-upload-modal">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 w-full max-w-lg shadow-2xl p-6 relative animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="text-left">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Bulk CSV/JSON Imports</h3>
                <p className="text-xs text-slate-400 mt-1">Paste formatted rows to introduce garment logs at volume.</p>
              </div>
              <button onClick={() => setIsBulkOpen(false)} className="p-1 px-2 border border-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4 text-left">
              <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 text-slate-700 dark:text-slate-300 text-[10.5px]">
                <p className="font-bold">Supported Formats:</p>
                <ol className="list-decimal pl-4 mt-1.5 space-y-1 font-mono">
                  <li>CSV style (excluding headers):<br />Name, SKU, Price, Category, Stock</li>
                  <li>Standard JSON Array containing Product attributes</li>
                </ol>
              </div>

              <textarea
                rows={8}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Paste your e-commerce export list text here..."
                className="w-full border border-slate-200 p-2.5 rounded-lg font-mono text-xs bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none"
              />

              {bulkError && <p className="text-[10px] font-black text-rose-500 font-mono mt-1">{bulkError}</p>}

              <div className="flex justify-end gap-2.5 mt-4">
                <button
                  onClick={() => setIsBulkOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
                >
                  Discard
                </button>
                <button
                  onClick={handleBulkUpload}
                  className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-lg hover:bg-slate-800 text-xs shadow"
                >
                  Execute Batch Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
