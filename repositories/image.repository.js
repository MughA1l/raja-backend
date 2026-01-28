import Image from '../models/Image.model.js';
import ApiError from '../utils ( reusables )/ApiError.js';

export const createImage = async (imageData) => {
  try {
    const image = new Image(imageData);
    return await image.save();
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(
        400,
        'Duplicate image name for this chapter',
        'DUPLICATE_IMAGE'
      );
    }
    console.error('Error creating image:', error);
    throw new ApiError(500, 'Failed to create image');
  }
};

export const updateImagesChapterId = async (imageIds, chapterId) => {
  try {
    await Image.updateMany(
      { _id: { $in: imageIds } },
      { $set: { chapterId } }
    );
  } catch (error) {
    console.error('Error updating images:', error);
    throw new ApiError(
      500,
      'Failed to associate images with chapter'
    );
  }
};

export const updateImageById = async (userId, imageId, updateData) => {
  try {
    const updatedImage = await Image.findOneAndUpdate(
      { _id: imageId, userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    return updatedImage;
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(
        400,
        'Duplicate image name for this chapter',
        'DUPLICATE_IMAGE'
      );
    }
    throw new ApiError(
      500,
      'Database error while updating image',
      'DB_ERROR'
    );
  }
};

export const deleteImageById = async (userId, imageId) => {
  try {
    const image = await Image.findOne({ _id: imageId, userId });
    if (!image) {
      return null;
    }

    await image.deleteOne();

    return image;
  } catch (error) {
    throw new ApiError(
      500,
      'Database error while deleting image',
      'DB_ERROR'
    );
  }
};

export const findImagesByUserId = async (userId) => {
  try {
    const images = await Image.find({ userId }).sort({ createdAt: -1 }).lean();
    return images;
  } catch (error) {
    throw new ApiError(
      500,
      'Database error while fetching user images',
      'DB_ERROR'
    );
  }
};
