import User from '../models/User.model.js';
import Book from '../models/Book.model.js';
import Chapter from '../models/Chapter.model.js';
import Image from '../models/Image.model.js';
import mongoose from 'mongoose';
import ApiError from '../utils ( reusables )/ApiError.js';

export const findUserProfileById = async (userId) => {
  try {
    return await User.findById(userId).select(
      'username email profileImage createdAt'
    );
  } catch (error) {
    throw new ApiError(500, 'Database: Query failed', 'DATABASE_ERROR');
  }
};

export const findUserByUsername = async (username, excludeUserId) => {
  try {
    return await User.findOne({
      username,
      _id: { $ne: excludeUserId },
    });
  } catch (error) {
    throw new ApiError(500, 'Database: Query failed', 'DATABASE_ERROR');
  }
};

export const findUserByEmail = async (email, excludeUserId) => {
  try {
    return await User.findOne({
      email,
      _id: { $ne: excludeUserId },
    });
  } catch (error) {
    throw new ApiError(500, 'Database: Query failed', 'DATABASE_ERROR');
  }
};

export const findUserWithPassword = async (userId) => {
  try {
    return await User.findById(userId).select('+password');
  } catch (error) {
    throw new ApiError(500, 'Database: Query failed', 'DATABASE_ERROR');
  }
};

export const updateUserById = async (userId, updateData) => {
  try {
    return await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('username email profileImage createdAt');
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(
        409,
        'Username or email already exists',
        'CONFLICT_ERROR'
      );
    }
    throw new ApiError(500, 'Database: Update failed', 'DATABASE_ERROR');
  }
};

export const aggregateUserStatistics = async (userId) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get books statistics
    const booksStats = await Book.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$isCompleted', 1, 0] } },
          favourites: { $sum: { $cond: ['$isFavourite', 1, 0] } },
        },
      },
    ]);

    // Get chapters statistics
    const chaptersStats = await Chapter.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$isCompleted', 1, 0] } },
          favourites: { $sum: { $cond: ['$isFavourite', 1, 0] } },
        },
      },
    ]);

    // Get images statistics
    const imagesStats = await Image.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$isCompleted', 1, 0] } },
          favourites: { $sum: { $cond: ['$isFavourite', 1, 0] } },
        },
      },
    ]);

    return {
      books: booksStats[0] || { total: 0, completed: 0, favourites: 0 },
      chapters: chaptersStats[0] || {
        total: 0,
        completed: 0,
        favourites: 0,
      },
      images: imagesStats[0] || { total: 0, completed: 0, favourites: 0 },
    };
  } catch (error) {
    throw new ApiError(
      500,
      'Database: Aggregation failed',
      'DATABASE_ERROR'
    );
  }
};

export const clearAllRefreshTokens = async (userId) => {
  try {
    const result = await User.findByIdAndUpdate(
      userId,
      { $set: { refreshTokens: [] } },
      { new: true }
    );
    return !!result;
  } catch (error) {
    throw new ApiError(500, 'Database: Update failed', 'DATABASE_ERROR');
  }
};

export const deleteUserAndAllData = async (userId) => {
  try {
    // Delete all books (will cascade to chapters and images via model hooks)
    const books = await Book.find({ userId });
    for (const book of books) {
      await book.deleteOne(); // Triggers pre-delete hooks
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    return true;
  } catch (error) {
    throw new ApiError(500, 'Database: Delete failed', 'DATABASE_ERROR');
  }
};
