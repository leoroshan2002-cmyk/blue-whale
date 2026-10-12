import connectDB from '../src/config/db.js';
import Category from '../src/models/Category.js';

const run = async () => {
  await connectDB();
  const defaultPath = '/uploads/categories/default.jpg';

  try {
    const query = { $or: [{ image: { $exists: false } }, { image: '' }] };
    const res = await Category.updateMany(query, { $set: { image: defaultPath } });
    console.log('Backfill complete:', res);
  } catch (err) {
    console.error('Backfill failed:', err);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
};

run();
