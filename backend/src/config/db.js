import mongoose from 'mongoose';

const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/bluewhale';

const connectDB = async () => {
  const uri = process.env.MONGO_URI?.trim() || DEFAULT_MONGO_URI;

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.warn(
      `MongoDB connection failed for ${uri}. Start MongoDB or set MONGO_URI to a valid connection string.`,
    );
    console.warn(error?.message || error);
  }
};

export default connectDB;
