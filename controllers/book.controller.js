import mongoose from 'mongoose';
import * as bookService from '../services/book.services.js';
import successResponse from '../utils ( reusables )/responseHandler.js';
import ApiError from '../utils ( reusables )/ApiError.js';
import getCloudinaryUrl from '../utils ( reusables )/ImageUpload.js';

export const createBook = async (req, res, next) => {
  try {
    const { name } = req.body;
    const imageFile = req.file;
    const userId = req.user?.userId;

    if (!imageFile) {
      return res.status(400).json({ message: 'Image is required.' });
    }

    // service layer
    const newBook = await bookService.createBook({
      userId,
      name,
      imageFile,
    });
    return successResponse(
      res,
      {
        message: 'Book created successfully!',
        book: newBook,
      },
      201
    );
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          'A book with this name already exists for this user.',
      });
    }
    next(error);
  }
};

export const getUserBooks = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const books = await bookService.getUserBooks(userId);
    return successResponse(res, books, 200);
  } catch (error) {
    next(error);
  }
};

export const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid book ID format');
    }
    const book = await bookService.getBookById(id);
    return successResponse(res, book, 200);
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (req.file) {
      const cloudinaryImage = await getCloudinaryUrl(req.file.path);

      if (cloudinaryImage) {
        updateData.image = cloudinaryImage.secure_url;
      }
    }

    const updatedBook = await bookService.updateBook(id, updateData);

    return successResponse(res, {
      message: 'Book updated successfully',
      data: updatedBook,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(
        400,
        'Name of the book must be unique.',
        'DUPLICATE_NAME'
      );
    }
    next(error);
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid book ID format');
    }
    const deletedBook = await bookService.deleteBook(id);
    return successResponse(res, {
      message: 'Book deleted successfully',
      data: deletedBook,
    });
  } catch (error) {
    next(error);
  }
};
