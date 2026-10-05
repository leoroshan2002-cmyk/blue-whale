import axios from 'axios';
import campaignData from '../Components/Data/campaignData';
import { sanitizeProductForClient } from '../utils/productImages';

const rawBaseApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const normalizedBaseApiUrl = rawBaseApiUrl.replace(/\/$/, '');

const apiBaseUrl = (() => {
  if (!normalizedBaseApiUrl) {
    if (import.meta.env.MODE !== 'production') {
      console.warn(
        'No VITE_API_URL configured. API calls will use relative paths under the current origin.'
      );
    }
    return '';
  }
  if (/^https?:\/\//i.test(normalizedBaseApiUrl)) return normalizedBaseApiUrl;
  if (normalizedBaseApiUrl.startsWith('/')) return normalizedBaseApiUrl;
  if (/^[a-zA-Z0-9.-]+(:\d+)?$/.test(normalizedBaseApiUrl)) {
    return `https://${normalizedBaseApiUrl}`;
  }

  if (import.meta.env.MODE !== 'production') {
    console.warn(
      `Invalid VITE_API_URL value detected: ${rawBaseApiUrl}. Falling back to relative API paths.`
    );
  }

  return '';
})();

export const buildApiUrl = (path) => {
  if (!apiBaseUrl) return path;
  if (path.startsWith(apiBaseUrl)) return path;
  return `${apiBaseUrl.replace(/\/$/, '')}${path}`;
};
export const apiClient = axios.create({ 
  baseURL: apiBaseUrl || undefined,
  withCredentials: true,
  timeout: 20_000,
});
export const resolveBackendImageUrl = (image) => {
  if (!image || typeof image !== 'string') return '';

  const trimmedImage = image.trim();
  if (!trimmedImage) return '';
  if (/^https?:\/\//i.test(trimmedImage) || trimmedImage.startsWith('data:')) {
    return trimmedImage;
  }

  const normalizedImage = trimmedImage.startsWith('/') ? trimmedImage : `/${trimmedImage}`;
  return apiBaseUrl ? `${apiBaseUrl}${normalizedImage}` : normalizedImage;
};

const categoriesUrl = buildApiUrl('/api/categories');
const productsUrl = buildApiUrl('/api/products');
const campaignsUrl = buildApiUrl('/api/campaigns');

const createCache = (ttlMs = 30_000) => {
  let cached = null;
  let lastFetch = 0;
  let inflight = null;

  const isStale = () => !cached || Date.now() - lastFetch > ttlMs;

  return {
    get() { return cached; },
    async fetch(fetcher) {
      if (!isStale() && cached) return cached;
      if (inflight) return inflight;

      inflight = (async () => {
        try {
          const result = await fetcher();
          cached = result;
          lastFetch = Date.now();
          return result;
        } finally {
          inflight = null;
        }
      })();

      return inflight;
    },
    invalidate() {
      cached = null;
      lastFetch = 0;
    },
  };
};

const categoriesCache = createCache(60_000);
const productsCache = createCache(30_000);

export const fetchCategories = async () => {
  try {
    return await categoriesCache.fetch(async () => {
      const { data } = await apiClient.get(categoriesUrl);
      return Array.isArray(data?.categories) ? data.categories : [];
    });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return categoriesCache.get() || [];
  }
};

export const fetchProducts = async () => {
  try {
    return await productsCache.fetch(async () => {
      const { data } = await apiClient.get(productsUrl);
      const products = Array.isArray(data?.products) ? data.products : [];
      return products.map((product) => sanitizeProductForClient(product));
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return productsCache.get() || [];
  }
};

export const invalidateProductCache = () => productsCache.invalidate();
export const invalidateCategoryCache = () => categoriesCache.invalidate();

export const fetchProductById = async (id) => {
  try {
    const { data } = await apiClient.get(buildApiUrl(`/api/products/${id}`));
    return sanitizeProductForClient(data?.product || null);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
};

const createEmptyCampaign = (category = 'women') => ({
  category,
  slider: Array.from({ length: 2 }, (_, index) => ({
    id: index + 1,
    title: '',
    subtitle: '',
    description: '',
    image: '',
    buttonText: '',
    button: '',
    link: `/category/${category}`,
  })),
  promoCards: Array.from({ length: 3 }, (_, index) => ({
    id: index + 1,
    title: '',
    subtitle: '',
    description: '',
    image: '',
    buttonText: '',
    button: '',
    link: `/category/${category}`,
  })),
  bottomPromoCards: Array.from({ length: 3 }, (_, index) => ({
    id: index + 1,
    title: '',
    subtitle: '',
    description: '',
    image: '',
    buttonText: '',
    button: '',
    link: `/category/${category}`,
  })),
});

const normalizeCollection = (items, baseItems, category) => {
  const source = Array.isArray(items) ? items : [];

  return Array.from({ length: Math.max(baseItems.length, source.length) }, (_, index) => {
    const item = source[index] || {};
    const baseItem = baseItems[index] || baseItems[0] || {};

    return {
      ...baseItem,
      ...item,
      title: item.title ?? '',
      subtitle: item.subtitle ?? '',
      description: item.description ?? item.subtitle ?? '',
      buttonText: item.buttonText ?? item.button ?? '',
      button: item.button ?? item.buttonText ?? '',
      link: item.link ?? `/category/${category}`,
    };
  });
};

export const normalizeCampaign = (campaign, category = 'women') => {
  const baseCampaign = createEmptyCampaign(category);

  if (!campaign || typeof campaign !== 'object') {
    return baseCampaign;
  }

  const safeCategory = campaign.category || category;
  const promoCards = normalizeCollection(campaign.promoCards, baseCampaign.promoCards, safeCategory).slice(0, 3);
  const bottomPromoCards = Array.isArray(campaign.bottomPromoCards)
    ? normalizeCollection(campaign.bottomPromoCards, baseCampaign.bottomPromoCards, safeCategory).slice(0, 3)
    : promoCards;

  return {
    ...baseCampaign,
    category: safeCategory,
    slug: campaign.slug || safeCategory,
    name: campaign.name || safeCategory,
    image: campaign.image || '',
    description: campaign.description || '',
    status: campaign.status || 'Active',
    categoryId: campaign.categoryId || null,
    slider: normalizeCollection(campaign.slider, baseCampaign.slider, safeCategory),
    promoCards,
    bottomPromoCards,
  };
};

export const getCampaign = async (category) => {
  const normalizedCategory = (category || 'women').toLowerCase();
  const fallbackCategory = normalizedCategory === 'new-arraival'
    ? 'new-arrivals'
    : normalizedCategory;

  try {
    const { data } = await apiClient.get(`${campaignsUrl}/${encodeURIComponent(normalizedCategory)}`);
    if (data?.success && data?.campaign) {
      return normalizeCampaign(data.campaign, normalizedCategory);
    }
  } catch (error) {
    console.error('Failed to load campaign from backend', error);
  }

  return normalizeCampaign(
    campaignData[normalizedCategory] || campaignData[fallbackCategory] || null,
    normalizedCategory
  );
};

export const saveCampaign = async (campaignDataToSave) => {
  const normalizedCategory = (campaignDataToSave?.category || 'women').toLowerCase();
  const normalizedCampaign = normalizeCampaign(campaignDataToSave, normalizedCategory);
  const formData = new FormData();
  const collections = ['slider', 'promoCards', 'bottomPromoCards'];

  const campaignPayload = {
    ...normalizedCampaign,
    ...Object.fromEntries(collections.map((collection) => [
      collection,
      normalizedCampaign[collection].map((entry, index) => {
        const selectedFile = campaignDataToSave?.[collection]?.[index]?.imageFile;
        const item = { ...entry };
        const image = item.image;
        delete item.image;
        delete item.imageFile;
        if (selectedFile) {
          formData.append(`${collection}[${index}]`, selectedFile);
        }
        return {
          ...item,
          image: image?.startsWith('blob:') ? '' : image,
        };
      }),
    ])),
  };
  formData.append('campaign', JSON.stringify(campaignPayload));

  try {
    const { data } = await apiClient.put(
      `${campaignsUrl}/${encodeURIComponent(normalizedCategory)}`,
      formData
    );

    return {
      success: data?.success ?? true,
      message: data?.message || 'Campaign saved successfully',
      campaign: data?.campaign || normalizedCampaign,
    };
  } catch (error) {
    console.error('Failed to save campaign to backend', error);
    return {
      success: false,
      message: error?.response?.data?.message || 'Unable to save campaign',
      campaign: normalizedCampaign,
    };
  }
};
