import Campaign from '../models/Campaign.js';
import Category from '../models/Category.js';
import { uploadToCloudinary } from '../middleware/cloudinaryStorage.js';

const toCampaignResponse = (campaign) => {
  const doc = campaign.toObject({ getters: true, virtuals: false });
  doc.id = doc._id?.toString();
  delete doc._id;
  delete doc.__v;
  return doc;
};

const normalizeCategoryLookup = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().toLowerCase();
};

const syncCategoryMetadata = async (categoryKey, payload) => {
  if (!categoryKey) {
    return null;
  }

  const normalizedCategory = normalizeCategoryLookup(categoryKey);
  const lookup = normalizedCategory
    ? { $or: [{ slug: normalizedCategory }, { slug: categoryKey }, { name: { $regex: new RegExp(`^${categoryKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }] }
    : { name: '' };

  const categoryDoc = await Category.findOne(lookup);

  if (!categoryDoc) {
    return null;
  }

  const updatedCategory = {
    slug: categoryDoc.slug || normalizedCategory || categoryDoc.name,
    name: categoryDoc.name || payload.name || categoryKey,
    image: categoryDoc.image || payload.image || '',
    description: categoryDoc.description || payload.description || '',
    status: categoryDoc.status || 'Active',
  };

  const safeCategoryDoc = await Category.findByIdAndUpdate(
    categoryDoc._id,
    {
      ...updatedCategory,
      slug: updatedCategory.slug.toLowerCase(),
    },
    { new: true, runValidators: true }
  );

  return safeCategoryDoc;
};

export const getCampaignByCategory = async (req, res) => {
  try {
    const category = String(req.params.category || '').toLowerCase();
    if (!category) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }

    const campaign = await Campaign.findOne({ category });
    return res.status(200).json({
      success: true,
      campaign: campaign ? toCampaignResponse(campaign) : null,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const saveCampaign = async (req, res) => {
  try {
    const category = String(req.params.category || req.body.category || '').toLowerCase();
    if (!category) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }

    const submittedCampaign = req.body.campaign ? JSON.parse(req.body.campaign) : req.body;
    const uploadedImages = {};

    for (const file of req.files || []) {
      uploadedImages[file.fieldname] = (await uploadToCloudinary(file, 'campaigns')).secure_url;
    }

    const applyUploadedImages = (collectionName) => (submittedCampaign[collectionName] || []).map((item, index) => ({
      ...item,
      image: uploadedImages[`${collectionName}[${index}]`] || item.image || '',
    }));

    const categoryMetadata = await syncCategoryMetadata(category, {
      name: submittedCampaign.name || submittedCampaign.category || category,
      image: submittedCampaign.image || '',
      description: submittedCampaign.description || '',
    });

    const payload = {
      category,
      slug: category,
      name: categoryMetadata?.name || submittedCampaign.name || submittedCampaign.category || category,
      image: categoryMetadata?.image || submittedCampaign.image || '',
      description: categoryMetadata?.description || submittedCampaign.description || '',
      status: categoryMetadata?.status || 'Active',
      categoryId: categoryMetadata?._id || null,
      slider: applyUploadedImages('slider'),
      promoCards: applyUploadedImages('promoCards'),
      bottomPromoCards: applyUploadedImages('bottomPromoCards'),
    };

    const campaign = await Campaign.findOneAndUpdate(
      { category },
      payload,
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Campaign saved successfully',
      campaign: campaign ? toCampaignResponse(campaign) : null,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
