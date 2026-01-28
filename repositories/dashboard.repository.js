import Book from '../models/Book.model.js';
import Chapter from '../models/Chapter.model.js';
import Image from '../models/Image.model.js';
import mongoose from 'mongoose';
import ApiError from '../utils ( reusables )/ApiError.js';

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
      chapters: chaptersStats[0] || { total: 0, completed: 0, favourites: 0 },
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

export const getRecentBooks = async (userId, limit = 6) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const books = await Book.find({ userId: userObjectId })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('name image isCompleted isFavourite chapters createdAt updatedAt')
      .lean();

    // Calculate completion percentage for each book
    return books.map((book) => ({
      ...book,
      chaptersCount: book.chapters?.length || 0,
    }));
  } catch (error) {
    throw new ApiError(500, 'Database: Query failed', 'DATABASE_ERROR');
  }
};

export const getRecentChapters = async (userId, limit = 6) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const chapters = await Chapter.find({ userId: userObjectId })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate('bookId', 'name')
      .select('name image isCompleted isFavourite isMids images bookId createdAt updatedAt')
      .lean();

    return chapters.map((chapter) => ({
      ...chapter,
      imagesCount: chapter.images?.length || 0,
      bookName: chapter.bookId?.name || 'Unknown Book',
    }));
  } catch (error) {
    throw new ApiError(500, 'Database: Query failed', 'DATABASE_ERROR');
  }
};
