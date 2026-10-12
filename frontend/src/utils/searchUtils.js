export const normalizeSearchText = (value = '') => {
  if (value === null || value === undefined) return '';

  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
};

export const buildProductSearchText = (product = {}) => {
  const fields = [
    product?.name,
    product?.sku,
    product?.category,
    product?.subCategory,
    product?.brand,
    product?.description,
    product?.material,
    Array.isArray(product?.tags) ? product.tags.join(' ') : '',
    Array.isArray(product?.variants?.colors) ? product.variants.colors.map((color) => color?.name || color?.value || '').join(' ') : '',
  ];

  return normalizeSearchText(fields.filter(Boolean).join(' '));
};

export const filterProductsBySearch = (products = [], searchTerm = '') => {
  const normalizedSearch = normalizeSearchText(searchTerm);
  if (!normalizedSearch) {
    return Array.isArray(products) ? [...products] : [];
  }

  const terms = normalizedSearch.split(/\s+/).filter(Boolean);

  return (Array.isArray(products) ? products : []).filter((product) => {
    const haystack = buildProductSearchText(product);
    return terms.every((term) => haystack.includes(term));
  });
};
