import ApiError from '../utils ( reusables )/ApiError.js';
import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config()

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });

    mongoose.connection.on('error', (err) => {
      console.error('DB connection error:', err);
    });
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    console.log('connected to db!');
    return connect;
  } catch (e) {
    console.log(e)
    throw new ApiError(
      500,
      'Failed to connect to mongodb',
      'CONNECTION_DB'
    );
  }
};

export default connectDB;
