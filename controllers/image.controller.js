import * as imageService from '../services/image.services.js';
import ApiError from '../utils ( reusables )/ApiError.js';
import successResponse from '../utils ( reusables )/responseHandler.js';

export const createImage = () => { };

export const updateImage = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const imageId = req.params.id;
    const updateData = req.body;

    // Validation
    if (!userId) {
      throw new ApiError(400, 'User ID is required', 'VALIDATION_ERROR');
    }
    if (!imageId) {
      throw new ApiError(400, 'Image ID is required', 'VALIDATION_ERROR');
    }
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new ApiError(
        400,
        'No data provided for update',
        'VALIDATION_ERROR'
      );
    }

    const updatedImage = await imageService.updateImage(
      userId,
      imageId,
      updateData
    );

    return successResponse(res, {
      image: updatedImage,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const imageId = req.params.id;

    // Validation
    if (!userId) {
      throw new ApiError(400, 'User ID is required', 'VALIDATION_ERROR');
    }
    if (!imageId) {
      throw new ApiError(400, 'Image ID is required', 'VALIDATION_ERROR');
    }

    const deletedImage = await imageService.deleteImage(userId, imageId);

    return successResponse(res, {
      message: 'Image deleted successfully',
      image: deletedImage,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserImages = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(400, 'User ID is required', 'VALIDATION_ERROR');
    }

    const images = await imageService.getUserImages(userId);

    return successResponse(res, {
      images: images,
    });
  } catch (error) {
    next(error);
  }
};
