import Code from '../models/resetCode.model.js';
import User from '../models/User.model.js';
import ApiError from '../utils ( reusables )/ApiError.js';

export const createUser = async (userData) => {
  try {
    let user = await User.create(userData);

    return user;
  } catch (error) {
    // to handle password length error
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0].message;
      throw new ApiError(400, firstError, 'VALIDATION_ERROR');
    }

    throw new ApiError(
      500,
      'Database: Failed to create user',
      'DATABASE_ERROR',
      error
    );
  }
};

export const findUserByEmailOrUsername = async (email, username) => {
  try {
    return await User.findOne({
      $or: [{ email }, { username }],
    });
  } catch (error) {
    throw new ApiError(
      500,
      'Database: Query failed',
      'DATABASE_ERROR',
      error
    );
  }
};

export const findUserByEmail = async (email) => {
  try {
    return await User.findOne({ email }).select('+password');
  } catch (error) {
    throw new ApiError(
      500,
      'Database: Query failed',
      'DATABASE_ERROR',
      error
    );
  }
};

export const findUserById = async (id) => {
  try {
    let user = await User.findOne({ _id: id });
    return user;
  } catch (error) {
    throw new ApiError(
      500,
      'Database: Query failed',
      'DATABASE_ERROR',
      error
    );
  }
};

export const SaveCodeInDb = async (email, generateCode) => {
  try {
    const saveCode = await Code.findOneAndUpdate(
      { email },
      {
        $set: {
          code: generateCode,
          createdAt: new Date(),
          isVerified: false,
        },
      },
      { upsert: true, new: true }
    );
    if (saveCode) return saveCode;
  } catch (error) {
    throw new ApiError(
      500,
      'Code saving failed',
      'DATABASE_ERROR',
      error
    );
  }
};

export const FindSavedCode = async (email, code) => {
  try {
    const codeDoc = await Code.findOne({
      email,
      code,
    });
    if (!codeDoc) {
      return false;
    }
    return codeDoc;
  } catch (error) {
    throw new ApiError(
      500,
      'Failed to fetch the code',
      'DATABASE_ERROR',
      error
    );
  }
};

export const updateUserPasswordByEmail = async (
  email,
  newPassword
) => {
  try {
    let process = await User.updatePasswordByEmail(
      email,
      newPassword
    );
    if (!process) return false;
    return true;
  } catch (error) {
    throw new ApiError(
      500,
      'Failed to update password using email',
      'DATABASE_ERROR',
      error
    );
  }
};

// update state by email
export const updateCodeIsVerified = async (email, code) => {
  try {
    const updating = await Code.findOneAndUpdate(
      { email, code },
      { $set: { isVerified: true } },
      { new: true }
    );
    if (!updating) return false;
    return true;
  } catch (error) {
    throw new ApiError(
      500,
      'Failed to update the verify state.',
      'DATABASE_ERROR',
      error
    );
  }
};

// check that if the user already verified the code.
export const findVerifiedCodeByEmail = async (email) => {
  return await Code.findOne({
    email,
    isVerified: true,
  });
};
