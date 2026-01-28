import Book from '../models/Book.model.js';
import ApiError from '../utils ( reusables )/ApiError.js';

export const createBook = async (bookData) => {
  try {
    const newBook = new Book(bookData);
    const savedBook = await newBook.save();

    return savedBook;
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(
        500,
        'A book with this name already exists for this user.'
      );
    }
    throw new ApiError(500, 'Failed to created Book', 'CREATE_BOOK');
  }
};

export const getBooksByUser = async (userId) => {
  try {
    return await Book.find({ userId }).populate({
      path: 'chapters',
      populate: {
        path: 'images', // populate images inside chapters
        model: 'Image',
      },
    });
  } catch (error) {
    throw new ApiError(
      500,
      `Error fetching books for user: ${error.message}`,
      'ALL_BOOKS'
    );
  }
};

export const findBookById = async (bookId) => {
  try {
    return await Book.findById({ _id: bookId }).populate({
      path: 'chapters',
      populate: {
        path: 'images', // populate images inside chapters
        model: 'Image',
      },
    });
  } catch (error) {
    throw new ApiError(
      500,
      `Error fetching book by ID: ${error.message}`,
      'SINGLE_BOOK'
    );
  }
};

export const updateBookById = async (bookId, updateData) => {
  try {
    return await Book.findByIdAndUpdate(
      bookId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(
        400,
        'Name of the book must be unique.',
        'DUPLICATE_NAME'
      );
    }
    throw new ApiError(
      500,
      `Error updating book: ${error.message}`,
      'UPDATE_BOOK'
    );
  }
};

export const deleteBookById = async (bookId) => {
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      throw new ApiError(404, 'Book not found', 'BOOK_NOT_FOUND');
    }

    // Trigger pre('deleteOne') hook
    await book.deleteOne();

    return { success: true, message: 'Book deleted successfully' };
  } catch (error) {
    throw new ApiError(
      500,
      `Error deleting book: ${error.message}`,
      'DELETE_BOOK'
    );
  }
};

// for the chapter to add it's id later in book
export const addChapterToBook = async (bookId, chapterId) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      { $push: { chapters: chapterId } },
      { new: true }
    );
    return updatedBook;
  } catch (error) {
    throw new ApiError(
      500,
      `Error deleting book: ${error.message}`,
      'ADD_CHAPTER_TO_BOOK'
    );
  }
};
