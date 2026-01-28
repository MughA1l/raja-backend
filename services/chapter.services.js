import getCloudinaryUrl from '../utils ( reusables )/ImageUpload.js';
import * as chapterRepo from '../repositories/chapter.repository.js';
import { addChapterToBook } from './book.services.js';
import ApiError from '../utils ( reusables )/ApiError.js';
import * as imageRepo from '../repositories/image.repository.js';
// book repository function
import { findBookById } from '../repositories/book.repository.js';
import { imageQueue } from './bull-MQ/producer.js';
import fs from 'fs/promises';

import mongoose from 'mongoose';

export const createChapter = async ({
  userId,
  name,
  bookId,
  isMids,
  imageFile, // cloudinary cover image of chapter
  imageFilesArray, // chapter images (local first, then cloudinary)
}) => {
  // Ensure book exists
  const bookExists = await findBookById(bookId);
  if (!bookExists) {
    throw new ApiError(
      404,
      'No Book found with the given ID',
      'BOOK_NOT_FOUND'
    );
  }

  // Upload cover image to Cloudinary
  const coverImageUpload = await getCloudinaryUrl(imageFile.path);
  const coverImageUrl = coverImageUpload?.url;
  if (!coverImageUrl)
    throw new ApiError(500, 'Cover image upload failed');

  // delete local cover file
  try {
    await fs.unlink(imageFile.path);
    console.log(`Deleted local cover image: ${imageFile.path}`);
  } catch (err) {
    console.error('Failed to delete cover image:', err);
  }

  // Create chapter without images first
  const initialChapter = await chapterRepo.createChapter({
    userId,
    bookId,
    name,
    image: coverImageUrl,
    isMids,
    images: [],
  });

  // Upload chapter images to Cloudinary + create Image docs
  const imageIds = [];

  for (const file of imageFilesArray) {
    // Upload to Cloudinary
    const uploaded = await getCloudinaryUrl(file.path);
    if (!uploaded?.url) {
      throw new ApiError(
        500,
        'Chapter Created but failed to upload Image.',
        'UPLOAD_ERROR'
      );
    }

    // Create Image doc
    const imageDoc = await imageRepo.createImage({
      userId,
      chapterId: initialChapter._id,
      name: `${Date.now()}-${file.originalname}`,
      url: uploaded.url, // cloudinary
    });

    // Queue worker with local path for fast OCR
    await imageQueue.add('process-image', {
      imageId: imageDoc._id.toString(),
      localPath: file.path,
      userId,
    });

    imageIds.push(imageDoc._id);
  }

  // Update chapter with image references
  initialChapter.images = imageIds;
  await initialChapter.save();

  // Push chapter into book
  await addChapterToBook(bookId, initialChapter._id);

  return initialChapter;
};

export const getUserChapters = async (userId) => {
  const chapters = await chapterRepo.findByUserId(userId);

  if (!chapters || chapters.length === 0) {
    throw new ApiError(
      404,
      'No chapters found for this user',
      'NOT_FOUND'
    );
  }
  return chapters;
};

export const getChapterById = async (userId, chapterId) => {
  const chapter = await chapterRepo.findByIdAndUser(
    userId,
    chapterId
  );

  if (!chapter) {
    throw new ApiError(404, 'Chapter not found', 'NOT_FOUND');
  }

  return chapter;
};

export const updateChapter = async (
  userId,
  chapterId,
  updateData
) => {
  const chapter = await chapterRepo.updateChapterById(
    userId,
    chapterId,
    updateData
  );

  if (!chapter) {
    throw new ApiError(
      404,
      'Chapter not found or you do not have permission to update it',
      'NOT_FOUND'
    );
  }

  return chapter;
};

export const deleteChapter = async (userId, chapterId) => {
  const deletedChapter = await chapterRepo.deleteChapterById(
    userId,
    chapterId
  );

  if (!deletedChapter) {
    throw new ApiError(
      404,
      'Chapter not found or you do not have permission to delete it',
      'NOT_FOUND'
    );
  }

  return deletedChapter;
};

export const chaptersByBook = async (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    throw new ApiError(
      400,
      'Invalid bookId format',
      'VALIDATION_ERROR'
    );
  }

  const chapters = await chapterRepo.getChaptersByBook(bookId);

  return chapters;
};

// Share chapter functions
export const shareChapter = async (userId, chapterId) => {
  if (!mongoose.Types.ObjectId.isValid(chapterId)) {
    throw new ApiError(400, 'Invalid chapter ID', 'VALIDATION_ERROR');
  }

  const chapter = await chapterRepo.generateShareToken(userId, chapterId);

  if (!chapter) {
    throw new ApiError(
      404,
      'Chapter not found or you do not have permission to share it',
      'NOT_FOUND'
    );
  }

  return chapter;
};

export const unshareChapter = async (userId, chapterId) => {
  if (!mongoose.Types.ObjectId.isValid(chapterId)) {
    throw new ApiError(400, 'Invalid chapter ID', 'VALIDATION_ERROR');
  }

  const chapter = await chapterRepo.revokeShareToken(userId, chapterId);

  if (!chapter) {
    throw new ApiError(
      404,
      'Chapter not found or you do not have permission to unshare it',
      'NOT_FOUND'
    );
  }

  return chapter;
};

export const getSharedChapter = async (shareToken) => {
  if (!shareToken) {
    throw new ApiError(400, 'Share token is required', 'VALIDATION_ERROR');
  }

  const chapter = await chapterRepo.findByShareToken(shareToken);

  if (!chapter) {
    throw new ApiError(
      404,
      'Shared chapter not found or link has expired',
      'NOT_FOUND'
    );
  }

  return chapter;
};

export const getChapterShareInfo = async (userId, chapterId) => {
  if (!mongoose.Types.ObjectId.isValid(chapterId)) {
    throw new ApiError(400, 'Invalid chapter ID', 'VALIDATION_ERROR');
  }

  const chapter = await chapterRepo.getShareInfo(userId, chapterId);

  if (!chapter) {
    throw new ApiError(404, 'Chapter not found', 'NOT_FOUND');
  }

  return chapter;
};
