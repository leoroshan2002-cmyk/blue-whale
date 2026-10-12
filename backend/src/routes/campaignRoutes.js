import express from 'express';
import { getCampaignByCategory, saveCampaign } from '../controllers/campaignController.js';
import upload from '../middleware/cloudinaryStorage.js';

const router = express.Router();

router.get('/:category', getCampaignByCategory);
router.put('/:category', upload.any(), saveCampaign);

export default router;
