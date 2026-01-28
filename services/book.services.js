import mongoose from 'mongoose';
import * as bookRepo from '../repositories/book.repository.js';
import ApiError from '../utils ( reusables )/ApiError.js';
import getCloudinaryUrl from '../utils ( reusables )/ImageUpload.js';

export const createBook = async ({ userId, name, imageFile }) => {
  const imageUrl = await getCloudinaryUrl(imageFile.path);
  const bookData = {
    userId,
    name,
    image: imageUrl?.url,
  };
  const savedBook = await bookRepo.createBook(bookData);
  return savedBook;
};

export const getUserBooks = async (userId) => {
  const books = await bookRepo.getBooksByUser(userId);
  return books;
};

export const getBookById = async (bookId) => {
  const book = await bookRepo.findBookById(bookId);

  if (!book) {
    throw new ApiError(404, 'Book not found');
  }

  return book;
};

export const updateBook = async (bookId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    throw new ApiError(400, 'Invalid book ID format');
  }

  // Prevent empty updates
  if (!updateData || Object.keys(updateData).length === 0) {
    throw new ApiError(400, 'No fields provided for update');
  }

  const updatedBook = await bookRepo.updateBookById(
    bookId,
    updateData
  );

  if (!updatedBook) {
    throw new ApiError(404, 'Book not found');
  }

  return updatedBook;
};

export const deleteBook = async (bookId) => {
  const deletedBook = await bookRepo.deleteBookById(bookId);

  if (!deletedBook) {
    throw new ApiError(404, 'Book not found or already deleted');
  }

  return deletedBook;
};

// to add chapter to books later
export const addChapterToBook = async (bookId, chapterId) => {
  return await bookRepo.addChapterToBook(bookId, chapterId);
};
