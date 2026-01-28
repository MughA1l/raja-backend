import mongoose from 'mongoose';
import * as settingsRepo from '../repositories/settings.repository.js';
import ApiError from '../utils ( reusables )/ApiError.js';
import getCloudinaryUrl from '../utils ( reusables )/ImageUpload.js';
import deleteCloudinaryImage from '../utils ( reusables )/CloudinaryDelete.js';
import fs from 'fs';

export const getUserProfile = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, 'Invalid user ID format', 'INVALID_ID');
  }

  const user = await settingsRepo.findUserProfileById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  }

  return user;
};

export const updateUserProfile = async ({
  userId,
  username,
  email,
  imageFile,
}) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, 'Invalid user ID format', 'INVALID_ID');
  }

  const updateData = {};

  if (username) {
    // Check if username is taken by another user
    const existingUser = await settingsRepo.findUserByUsername(
      username,
      userId
    );
    if (existingUser) {
      throw new ApiError(409, 'Username already taken', 'USERNAME_CONFLICT');
    }
    updateData.username = username;
  }

  if (email) {
    // Validate email format
    if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
    ) {
      throw new ApiError(400, 'Invalid email format', 'VALIDATION_ERROR');
    }
    // Check if email is taken by another user
    const existingEmail = await settingsRepo.findUserByEmail(
      email,
      userId
    );
    if (existingEmail) {
      throw new ApiError(409, 'Email already taken', 'EMAIL_CONFLICT');
    }
    updateData.email = email;
  }

  if (imageFile) {
    // Get current user to delete old image
    const currentUser = await settingsRepo.findUserProfileById(userId);

    // Upload new image to Cloudinary
    const cloudinaryResult = await getCloudinaryUrl(imageFile.path);
    updateData.profileImage =
      cloudinaryResult?.secure_url || cloudinaryResult?.url;

    // Delete local file
    try {
      fs.unlinkSync(imageFile.path);
    } catch (err) {
      console.error('Failed to delete local file:', err);
    }

    // Delete old image from Cloudinary if exists
    if (currentUser?.profileImage) {
      await deleteCloudinaryImage(currentUser.profileImage);
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(
      400,
      'No fields provided for update',
      'NO_UPDATE_DATA'
    );
  }

  const updatedUser = await settingsRepo.updateUserById(userId, updateData);
  return updatedUser;
};

export const changeUserPassword = async (
  userId,
  currentPassword,
  newPassword
) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, 'Invalid user ID format', 'INVALID_ID');
  }

  if (newPassword.length < 4) {
    throw new ApiError(
      400,
      'Password must be at least 4 characters',
      'VALIDATION_ERROR'
    );
  }

  const user = await settingsRepo.findUserWithPassword(userId);
  if (!user) {
    throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(
      401,
      'Current password is incorrect',
      'INVALID_PASSWORD'
    );
  }

  // Update password (will be hashed by pre-save hook)
  user.password = newPassword;
  await user.save();

  return { message: 'Password changed successfully' };
};

export const getUserStatistics = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, 'Invalid user ID format', 'INVALID_ID');
  }

  const stats = await settingsRepo.aggregateUserStatistics(userId);
  return stats;
};

export const logoutAllSessions = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, 'Invalid user ID format', 'INVALID_ID');
  }

  const result = await settingsRepo.clearAllRefreshTokens(userId);
  if (!result) {
    throw new ApiError(
      500,
      'Failed to logout all sessions',
      'LOGOUT_ALL_ERROR'
    );
  }

  return { message: 'Logged out from all sessions successfully' };
};

export const deleteUserAccount = async (userId, password) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, 'Invalid user ID format', 'INVALID_ID');
  }

  const user = await settingsRepo.findUserWithPassword(userId);
  if (!user) {
    throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Password is incorrect', 'INVALID_PASSWORD');
  }

  // Delete all user data (books, chapters, images will cascade via model hooks)
  await settingsRepo.deleteUserAndAllData(userId);

  return { message: 'Account deleted successfully' };
};
