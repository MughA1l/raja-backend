import * as settingsService from '../services/settings.services.js';
import successResponse from '../utils ( reusables )/responseHandler.js';
import ApiError from '../utils ( reusables )/ApiError.js';

// GET /api/settings/profile - Get user profile
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
    }

    const profile = await settingsService.getUserProfile(userId);
    return successResponse(res, profile, 200);
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(
      new ApiError(500, 'Failed to fetch profile', 'PROFILE_ERROR')
    );
  }
};

// PUT /api/settings/profile - Update profile (username, email, profileImage)
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { username, email } = req.body;
    const imageFile = req.file;

    if (!userId) {
      throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
    }

    const updatedProfile = await settingsService.updateUserProfile({
      userId,
      username,
      email,
      imageFile,
    });

    return successResponse(
      res,
      {
        message: 'Profile updated successfully',
        user: updatedProfile,
      },
      200
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(
      new ApiError(500, 'Failed to update profile', 'PROFILE_UPDATE_ERROR')
    );
  }
};

// PATCH /api/settings/password - Change password
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
    }

    if (!currentPassword || !newPassword) {
      throw new ApiError(
        422,
        'Current and new password are required',
        'MISSING_DATA'
      );
    }

    const result = await settingsService.changeUserPassword(
      userId,
      currentPassword,
      newPassword
    );
    return successResponse(res, result, 200);
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(
      new ApiError(
        500,
        'Failed to change password',
        'PASSWORD_CHANGE_ERROR'
      )
    );
  }
};

// GET /api/settings/statistics - Get user statistics
export const getStatistics = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
    }

    const statistics = await settingsService.getUserStatistics(userId);
    return successResponse(res, statistics, 200);
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(
      new ApiError(500, 'Failed to fetch statistics', 'STATISTICS_ERROR')
    );
  }
};

// POST /api/settings/logout-all - Logout from all sessions
export const logoutAllSessions = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
    }

    const result = await settingsService.logoutAllSessions(userId);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'strict',
    });

    return successResponse(res, result, 200);
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(
      new ApiError(
        500,
        'Failed to logout all sessions',
        'LOGOUT_ALL_ERROR'
      )
    );
  }
};

// DELETE /api/settings/account - Delete user account
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { password } = req.body;

    if (!userId) {
      throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
    }

    if (!password) {
      throw new ApiError(
        422,
        'Password is required to delete account',
        'MISSING_DATA'
      );
    }

    const result = await settingsService.deleteUserAccount(userId, password);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'strict',
    });

    return successResponse(res, result, 200);
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(
      new ApiError(500, 'Failed to delete account', 'ACCOUNT_DELETE_ERROR')
    );
  }
};
