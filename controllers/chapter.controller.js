import successResponse from '../utils ( reusables )/responseHandler.js';
import * as chapterService from '../services/chapter.services.js';
import ApiError from '../utils ( reusables )/ApiError.js';
import getCloudinaryUrl from '../utils ( reusables )/ImageUpload.js';

export const createChapter = async (req, res, next) => {
  try {
    const { name, bookId, isMids } = req.body;
    const userId = req.user?.userId;

    const coverImageCloudinary = req.files?.image?.[0] || null;
    const localImageFiles = req.files?.images || [];

    if (
      !name ||
      !bookId ||
      typeof isMids === 'undefined' ||
      !coverImageCloudinary
    ) {
      throw new ApiError(
        400,
        'All required fields must be provided',
        'MISSING_FIELDS'
      );
    }

    const chapter = await chapterService.createChapter({
      userId,
      name,
      bookId,
      isMids,
      imageFile: coverImageCloudinary,
      imageFilesArray: localImageFiles,
    });

    return successResponse(
      res,
      {
        message: 'Chapter created successfully!',
        chapter,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getUserChapters = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    // Validate userId
    if (!userId) {
      throw new ApiError(
        400,
        'User ID is required',
        'VALIDATION_ERROR'
      );
    }
    const chapters = await chapterService.getUserChapters(userId);

    return successResponse(res, { chapters });
  } catch (error) {
    next(error);
  }
};

export const getChapterById = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const chapterId = req.params.id;

    // Validation
    if (!userId) {
      throw new ApiError(
        400,
        'User ID is required',
        'VALIDATION_ERROR'
      );
    }
    if (!chapterId) {
      throw new ApiError(
        400,
        'Chapter ID is required',
        'VALIDATION_ERROR'
      );
    }

    const chapter = await chapterService.getChapterById(
      userId,
      chapterId
    );

    return successResponse(res, { chapter });
  } catch (error) {
    next(error);
  }
};

export const updateChapter = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const chapterId = req.params.id;
    const updateData = req.body;

    // Validation
    if (!userId) {
      throw new ApiError(
        400,
        'User ID is required',
        'VALIDATION_ERROR'
      );
    }
    if (!chapterId) {
      throw new ApiError(
        400,
        'Chapter ID is required',
        'VALIDATION_ERROR'
      );
    }
    if ((!updateData || Object.keys(updateData).length === 0) && !req.file) {
      throw new ApiError(
        400,
        'No data provided for update',
        'VALIDATION_ERROR'
      );
    }

    // Handle image upload if present (same pattern as book update)
    if (req.file) {
      const cloudinaryImage = await getCloudinaryUrl(req.file.path);

      if (cloudinaryImage) {
        updateData.image = cloudinaryImage.secure_url || cloudinaryImage.url;
      }
    }

    const updatedChapter = await chapterService.updateChapter(
      userId,
      chapterId,
      updateData
    );

    return successResponse(res, {
      chapter: updatedChapter,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteChapter = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const chapterId = req.params.id;

    if (!userId) {
      throw new ApiError(
        400,
        'User ID is required',
        'VALIDATION_ERROR'
      );
    }
    if (!chapterId) {
      throw new ApiError(
        400,
        'Chapter ID is required',
        'VALIDATION_ERROR'
      );
    }

    const deleted = await chapterService.deleteChapter(
      userId,
      chapterId
    );

    return successResponse(res, {
      message: 'Chapter deleted successfully',
      chapter: deleted,
    });
  } catch (error) {
    next(error);
  }
};

//  ################  To get chapters by project id.   #################

export const getAllChaptersByBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ApiError(
        400,
        'book Id is required',
        'VALIDATION_ERROR'
      );
    }

    const allChapters = await chapterService.chaptersByBook(id);

    return successResponse(res, {
      message: 'All chapters by book!',
      chapters: allChapters,
    });
  } catch (error) {
    next(error);
  }
};

// Share chapter controllers
export const shareChapter = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const chapterId = req.params.id;

    if (!userId) {
      throw new ApiError(400, 'User ID is required', 'VALIDATION_ERROR');
    }
    if (!chapterId) {
      throw new ApiError(400, 'Chapter ID is required', 'VALIDATION_ERROR');
    }

    const chapter = await chapterService.shareChapter(userId, chapterId);

    return successResponse(res, {
      message: 'Chapter shared successfully',
      shareToken: chapter.shareToken,
      isPublic: chapter.isPublic,
    });
  } catch (error) {
    next(error);
  }
};

export const unshareChapter = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const chapterId = req.params.id;

    if (!userId) {
      throw new ApiError(400, 'User ID is required', 'VALIDATION_ERROR');
    }
    if (!chapterId) {
      throw new ApiError(400, 'Chapter ID is required', 'VALIDATION_ERROR');
    }

    const chapter = await chapterService.unshareChapter(userId, chapterId);

    return successResponse(res, {
      message: 'Chapter sharing revoked successfully',
      isPublic: chapter.isPublic,
    });
  } catch (error) {
    next(error);
  }
};

export const getSharedChapter = async (req, res, next) => {
  try {
    const { shareToken } = req.params;

    if (!shareToken) {
      throw new ApiError(400, 'Share token is required', 'VALIDATION_ERROR');
    }

    const chapter = await chapterService.getSharedChapter(shareToken);

    return successResponse(res, {
      chapter,
    });
  } catch (error) {
    next(error);
  }
};

export const getShareInfo = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const chapterId = req.params.id;

    if (!userId) {
      throw new ApiError(400, 'User ID is required', 'VALIDATION_ERROR');
    }
    if (!chapterId) {
      throw new ApiError(400, 'Chapter ID is required', 'VALIDATION_ERROR');
    }

    const shareInfo = await chapterService.getChapterShareInfo(userId, chapterId);

    return successResponse(res, {
      shareInfo,
    });
  } catch (error) {
    next(error);
  }
};
