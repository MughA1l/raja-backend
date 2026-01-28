import * as imageRepo from '../repositories/image.repository.js';
import ApiError from '../utils ( reusables )/ApiError.js';
import mongoose from 'mongoose';
import Chapter from '../models/Chapter.model.js';
import deleteCloudinaryImage from '../utils ( reusables )/CloudinaryDelete.js';

export const updateImage = async (userId, imageId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(imageId)) {
    throw new ApiError(400, 'Invalid image ID format');
  }

  // Prevent empty updates
  if (!updateData || Object.keys(updateData).length === 0) {
    throw new ApiError(400, 'No fields provided for update');
  }

  const updatedImage = await imageRepo.updateImageById(
    userId,
    imageId,
    updateData
  );

  if (!updatedImage) {
    throw new ApiError(
      404,
      'Image not found or you do not have permission to update it',
      'NOT_FOUND'
    );
  }

  return updatedImage;
};

export const deleteImage = async (userId, imageId) => {
  if (!mongoose.Types.ObjectId.isValid(imageId)) {
    throw new ApiError(400, 'Invalid image ID format');
  }

  const image = await imageRepo.deleteImageById(userId, imageId);

  if (!image) {
    throw new ApiError(
      404,
      'Image not found or you do not have permission to delete it',
      'NOT_FOUND'
    );
  }

  // Delete from Cloudinary (non-blocking, log errors)
  if (image.url) {
    deleteCloudinaryImage(image.url).catch((error) => {
      console.error('Failed to delete image from Cloudinary:', error);
    });
  }

  // Remove image reference from Chapter's images array
  try {
    await Chapter.updateOne(
      { _id: image.chapterId },
      { $pull: { images: imageId } }
    );
  } catch (error) {
    console.error('Failed to update chapter images array:', error);
  }

  return image;
};

export const getUserImages = async (userId) => {
  const images = await imageRepo.findImagesByUserId(userId);
  return images;
};
