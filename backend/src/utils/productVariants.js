const colorLabel = (color) => (
  typeof color === 'string'
    ? color.trim()
    : String(color?.name || color?.value || color?.hex || '').trim()
);

const isHexColor = (value) => typeof value === 'string' && /^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(value);

export const resolveProductColor = (product, selectedColor) => {
  const requestedColor = String(selectedColor || '').trim();
  if (!requestedColor) return { name: '', hex: '', found: false };

  const colors = Array.isArray(product?.variants?.colors) ? product.variants.colors : [];
  const match = colors.find((color) => colorLabel(color).toLowerCase() === requestedColor.toLowerCase());
  if (!match) return { name: requestedColor, hex: '', found: false };

  const hex = typeof match === 'object' && isHexColor(match.hex) ? match.hex : '';
  return { name: colorLabel(match), hex, found: true };
};

export const resolveProductImage = (product, selectedImageIndex) => {
  const images = Array.isArray(product?.images) ? product.images : [];
  const index = Number(selectedImageIndex);
  return Number.isInteger(index) && index >= 0 && index < images.length
    ? { image: images[index], index }
    : { image: images[0] || '', index: 0 };
};
