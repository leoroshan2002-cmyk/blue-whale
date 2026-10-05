import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGO_URI 

  try {
    await mongoose.connect(uri);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    
  }
};

export default connectDB;
