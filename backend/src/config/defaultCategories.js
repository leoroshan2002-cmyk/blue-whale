import Category from '../models/Category.js';

const defaultCollections = [
  {
    name: 'Men',
    slug: 'men',
    description: 'Traditional menswear collections from Blue Whale.',
    cards: [
      { name: 'Silk Veshtis', subtitle: 'LUXURY IN EVERY FOLD', image: '/images/men/k1.jpg' },
      { name: 'Festive Veshtis', subtitle: 'SHINE BRIGHTER', image: '/images/men/k2.jpg' },
      { name: 'Wedding Edit', subtitle: 'FOR YOUR SPECIAL DAY', image: '/images/men/k3.jpg' },
      { name: 'Cotton Classics', subtitle: 'HERITAGE IN EVERY THREAD', image: '/images/men/k4.jpg' },
      { name: 'Ready to Wear', subtitle: 'TRADITION MEETS TODAY', image: '/images/men/k5.jpg' },
    ],
  },
  {
    name: 'Women',
    slug: 'women',
    description: 'Traditional and contemporary saree collections from Blue Whale.',
    cards: [
      { name: 'Traditional Sarees', subtitle: 'TIMELESS INDIAN ELEGANCE', image: '/saree pink.png' },
      { name: 'Printed Sarees', subtitle: 'ARTISTRY IN EVERY PRINT', image: '/saree - dark pink.png' },
      { name: 'Traditional Silk Sarees', subtitle: 'LUXURY IN EVERY DRAPE', image: '/saree-gold.png' },
      { name: 'Woven & Zari Sarees', subtitle: 'HERITAGE WOVEN IN GOLD', image: '/saree-red.png' },
      { name: 'Floral Printed Sarees', subtitle: 'FRESH FLORALS, GRACEFUL DRAPES', image: '/saree-lavendar.png' },
    ],
  },
];

const ensureDefaultCategories = async () => {
  for (const collection of defaultCollections) {
    const existing = await Category.findOne({
      $or: [
        { name: { $regex: `^${collection.name}$`, $options: 'i' } },
        { slug: collection.slug },
      ],
    });
    if (existing?.defaultCollectionsInitialized) continue;

    const subCategories = Array.from(new Set([
      ...(existing?.subCategories || []),
      ...collection.cards.map((card) => card.name),
    ]));
    const existingCards = existing?.subCategoryCards || [];
    const defaultCards = collection.cards.map((card) => {
      const saved = existingCards.find((item) => item.name.toLowerCase() === card.name.toLowerCase());
      return saved || card;
    });
    const defaultNames = new Set(collection.cards.map((card) => card.name.toLowerCase()));
    const subCategoryCards = [
      ...defaultCards,
      ...existingCards.filter((card) => !defaultNames.has(card.name.toLowerCase())),
    ];

    if (existing) {
      existing.subCategories = subCategories;
      existing.subCategoryCards = subCategoryCards;
      if (!existing.subCategory) existing.subCategory = subCategories[0];
      existing.defaultCollectionsInitialized = true;
      await existing.save();
      continue;
    }

    await Category.create({
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      subCategories,
      subCategory: subCategories[0],
      image: collection.cards[0].image,
      subCategoryCards,
      defaultCollectionsInitialized: true,
      status: 'Active',
    });
  }
};

export default ensureDefaultCategories;
