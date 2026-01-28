import {
  loginUser,
  registerUser,
  logoutUser,
  UserCode,
  userPasswordReset,
  userCodeVerify,
} from '../services/user.services.js';
import ApiError from '../utils ( reusables )/ApiError.js';
import successResponse from '../utils ( reusables )/responseHandler.js';

export const register = async (req, res, next) => {
  try {
    // validate input data
    let { username, email, password } = req.body || {};
    if (!username || !email || !password) {
      throw new ApiError(
        422,
        'All fields are required',
        'MISSING_DATA'
      );
    }
    const payload = { username, email, password };
    // service call
    const createUser = await registerUser(payload);

    // send the access and set the refresh-token
    let { user, tokens } = createUser;

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return successResponse(
      res,
      { user, accessToken: tokens?.accessToken },
      201
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }

    return next(
      new ApiError(
        500,
        'User registration failed',
        'REGISTRATION_ERROR'
      )
    );
  }
};

export const login = async (req, res, next) => {
  let { email, password } = req.body || {};
  try {
    if (!email || !password) {
      throw new ApiError(
        422,
        'Email and Password are required',
        'MISSING_CREDENTIALS'
      );
    }

    let { user, tokens } = await loginUser(email, password);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return successResponse(
      res,
      { user, accessToken: tokens?.accessToken },
      200
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(
      new ApiError(500, 'User Login failed', 'LOGIN_ERROR')
    );
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new ApiError(
        401,
        'No refresh token found',
        'UNAUTHORIZED'
      );
    }

    const userId = req.user?.userId;
    if (!userId) {
      throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
    }

    const response = await logoutUser(user, refreshToken);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'strict',
    });

    return successResponse(res, response, 200);
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }

    return next(new ApiError(500, 'Logout Failed', 'LOGOUT_ERROR'));
  }
};

export const getCode = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      throw new ApiError(422, 'Email is Missing', 'MISSING_DATA');
    }

    const message = await UserCode(email);

    return successResponse(res, message, 200);
  } catch (error) {
    return next(error);
  }
};

// verify code
export const verifyCode = async (req, res, next) => {
  let { code, email } = req.body || {};
  try {
    if (!code || !email) {
      throw new ApiError(
        422,
        'All fields are required',
        'MISSING_DATA'
      );
    }
    let message = await userCodeVerify(email, code);

    return successResponse(res, message, 201);
  } catch (error) {
    return next(error);
  }
};

// export const resetPassword = async (req, res, next) => {
//     let { email, code, newPassword } = req.body || {};
//     try {
//         if (!email || !code || !newPassword) {
//             throw new ApiError(400, "All fields are required", "MISSING_DATA");
//         }

//         let message = await userPasswordReset(email, code, newPassword);

//         return successResponse(res, message, 201);

//     } catch (error) {
//         return next(error);
//     }
// }

export const resetPassword = async (req, res, next) => {
  let { email, newPassword } = req.body || {};
  try {
    if (!email || !newPassword) {
      throw new ApiError(
        422,
        'Email and newPassword are required',
        'MISSING_DATA'
      );
    }

    let message = await userPasswordReset(email, newPassword);
    return successResponse(res, message, 200);
  } catch (error) {
    return next(error);
  }
};
