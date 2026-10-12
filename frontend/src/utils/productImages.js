export const DEFAULT_IMAGE_FALLBACK = '/products/shirt.jpg';

export const normalizeImageList = (images = []) => {
  if (Array.isArray(images)) {
    return images.filter((image) => typeof image === 'string' && image.trim() && !image.startsWith('blob:'));
  }

  if (typeof images === 'string' && images.trim()) {
    const trimmedValue = images.trim();
    return trimmedValue.startsWith('blob:') ? [] : [trimmedValue];
  }

  return [];
};

export const getSafeImageUrl = (image, fallback = DEFAULT_IMAGE_FALLBACK) => {
  if (typeof image !== 'string') {
    return fallback;
  }

  const trimmedValue = image.trim();
  if (!trimmedValue || trimmedValue.startsWith('blob:')) {
    return fallback;
  }

  return trimmedValue;
};

export const getSafeImageProps = (image, fallback = DEFAULT_IMAGE_FALLBACK) => ({
  src: getSafeImageUrl(image, fallback),
  onError: (event) => {
    const nextTarget = event?.currentTarget;
    if (nextTarget && nextTarget.src !== window.location.origin + fallback) {
      nextTarget.src = fallback;
    }
  },
});

export const sanitizeProductForClient = (product) => {
  if (!product || typeof product !== 'object') {
    return product;
  }

  const normalizedImages = normalizeImageList(product.images);
  const fallbackImage = typeof product.image === 'string' && product.image.trim() && !product.image.startsWith('blob:')
    ? product.image.trim()
    : '';

  return {
    ...product,
    images: normalizedImages,
    image: normalizedImages[0] || fallbackImage,
    colors: Array.isArray(product.colors) ? product.colors : (Array.isArray(product.variants?.colors) ? product.variants.colors : []),
    sizes: Array.isArray(product.sizes) ? product.sizes : (Array.isArray(product.variants?.sizes) ? product.variants.sizes : []),
  };
};
