import ApiError from '../utils ( reusables )/ApiError.js';
import Chapter from '../models/Chapter.model.js';
import Book from '../models/Book.model.js';

export const createChapter = async (chapterData) => {
  try {
    const newChapter = new Chapter(chapterData);
    return await newChapter.save();
  } catch (error) {
    if (
      error.code === 11000 &&
      error.keyPattern?.bookId &&
      error.keyPattern?.name
    ) {
      throw new ApiError(
        400,
        'Chapter name must be unique within the same book',
        'DUPLICATE_CHAPTER'
      );
    }
    console.error('Error creating chapter:', error);
    throw new ApiError(500, 'Failed to create chapter');
  }
};

export const findByUserId = async (userId) => {
  try {
    const chapters = await Chapter.find({ userId })
      .populate('bookId')
      .populate('images')
      .sort({ createdAt: -1 })
      .lean();

    return chapters;
  } catch (error) {
    throw new ApiError(
      500,
      'Database error while fetching chapters',
      'DB_ERROR'
    );
  }
};

export const findByIdAndUser = async (userId, chapterId) => {
  try {
    const chapter = await Chapter.findOne({ _id: chapterId, userId })
      .populate('bookId')
      .populate('images')
      .lean();

    return chapter;
  } catch (error) {
    throw new ApiError(
      500,
      'Database error while fetching chapter',
      'DB_ERROR'
    );
  }
};

export const updateChapterById = async (
  userId,
  chapterId,
  updateData
) => {
  try {
    const updatedChapter = await Chapter.findOneAndUpdate(
      { _id: chapterId, userId },
      { $set: updateData }, // update provided fields
      { new: true, runValidators: true }
    )
      .populate('bookId', 'title author')
      .populate('images', 'url caption')
      .lean();

    return updatedChapter;
  } catch (error) {
    throw new ApiError(
      500,
      'Database error while updating chapter',
      'DB_ERROR'
    );
  }
};

export const deleteChapterById = async (userId, chapterId) => {
  try {
    const chapter = await Chapter.findOne({ _id: chapterId, userId });
    if (!chapter) {
      return null; // Service will throw error
    }

    // Remove chapter from book's chapters array
    await Book.updateOne(
      { _id: chapter.bookId },
      { $pull: { chapters: chapterId } }
    );

    await chapter.deleteOne(); // Will delete all the images related to this chapter

    return chapter;
  } catch (error) {
    throw new ApiError(
      500,
      'Database error while deleting chapter',
      'DB_ERROR'
    );
  }
};

export const getChaptersByBook = async (bookId) => {
  try {
    const allChapters = await Chapter.find({ bookId }).populate(
      'images'
    );

    return allChapters;
  } catch (error) {
    console.log(error.message);
    throw new ApiError(
      500,
      'Database error while fetchings books by user',
      'DB_ERROR'
    );
  }
};

// Share chapter functions
export const generateShareToken = async (userId, chapterId) => {
  try {
    // Generate a unique share token
    const shareToken = `${chapterId}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    const chapter = await Chapter.findOneAndUpdate(
      { _id: chapterId, userId },
      { $set: { shareToken, isPublic: true } },
      { new: true }
    );

    return chapter;
  } catch (error) {
    throw new ApiError(
      500,
      'Database error while generating share token',
      'DB_ERROR'
    );
  }
};

export const revokeShareToken = async (userId, chapterId) => {
  try {
    const chapter = await Chapter.findOneAndUpdate(
      { _id: chapterId, userId },
      { $set: { shareToken: null, isPublic: false } },
      { new: true }
    );

    return chapter;
  } catch (error) {
    throw new ApiError(
      500,
      'Database error while revoking share token',
      'DB_ERROR'
    );
  }
};

export const findByShareToken = async (shareToken) => {
  try {
    const chapter = await Chapter.findOne({ shareToken, isPublic: true })
      .populate('bookId', 'name')
      .populate('images')
      .populate('userId', 'username')
      .lean();

    return chapter;
  } catch (error) {
    throw new ApiError(
      500,
      'Database error while fetching shared chapter',
      'DB_ERROR'
    );
  }
};

export const getShareInfo = async (userId, chapterId) => {
  try {
    const chapter = await Chapter.findOne(
      { _id: chapterId, userId },
      { shareToken: 1, isPublic: 1, name: 1 }
    ).lean();

    return chapter;
  } catch (error) {
    throw new ApiError(
      500,
      'Database error while fetching share info',
      'DB_ERROR'
    );
  }
};
