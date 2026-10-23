// Frontend-only helpers for filtering REAL products returned by /api/products.
const norm = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const SAREE_WORD = /\b(saree|sarees|sari|saris)\b/;

// Extra words used only as a fallback when no product's subCategory matches the selected collection exactly.
const COLLECTION_ALIASES = {
  "traditional sarees": ["traditional", "handloom", "kanjeevaram", "kanchipuram"],
  "printed sarees": ["printed", "print"],
  "traditional silk sarees": ["silk", "kanjeevaram", "kanchipuram", "banarasi", "tussar", "paithani"],
  "woven and zari sarees": ["zari", "woven", "weave", "brocade"],
  "floral printed sarees": ["floral", "flower"],
};

const labelFields = (p) => [
  p?.name,
  p?.category,
  p?.subCategory,
  p?.subcategory,
  p?.collection,
  p?.type,
  p?.material,
  ...(Array.isArray(p?.tags) ? p.tags : []),
];

const collectionFields = (p) => [
  ...(Array.isArray(p?.subCategories) ? p.subCategories : []),
  ...(Array.isArray(p?.subCategory) ? p.subCategory : [p?.subCategory]),
  p?.subcategory,
  p?.collection,
  p?.type,
];

export const productId = (p) => String(p?.id ?? p?._id ?? "");

export const isSareeProduct = (p) => SAREE_WORD.test(norm(labelFields(p).filter(Boolean).join(" ")));

export const matchesCategory = (p, category) => {
  const wanted = norm(category);
  if (!wanted) return true;
  const actual = norm(p?.category);
  return actual === wanted || actual.includes(wanted);
};

export const filterByCollection = (products, collection) => {
  const wanted = norm(collection);
  if (!wanted) return products;

  const exact = products.filter((p) => collectionFields(p).some((field) => norm(field) === wanted));
  if (exact.length) return exact;

  const terms = COLLECTION_ALIASES[wanted] || [wanted];
  return products.filter((p) => {
    const text = norm(labelFields(p).filter(Boolean).join(" "));
    return terms.some((term) => text.includes(term));
  });
};

// Related sarees: same collection first, then any other saree, never the current product.
export const getRelatedSarees = (product, catalog, limit = 4) => {
  if (!product) return [];
  const currentId = productId(product);
  const others = (Array.isArray(catalog) ? catalog : []).filter(
    (p) => productId(p) !== currentId && isSareeProduct(p)
  );
  const mine = collectionFields(product).map(norm).filter(Boolean);
  const same = others.filter((p) => collectionFields(p).some((field) => mine.includes(norm(field))));
  const rest = others.filter((p) => !same.includes(p));
  return [...same, ...rest].slice(0, limit);
};
