import { cloudinary } from '../config (db connect)/cloudinary.config.js';
import ApiError from '../utils ( reusables )/ApiError.js';

const getCloudinaryUrl = async (path) => {
  try {
    return cloudinary.uploader.upload(path, function (req, result) {
      return {
        data: result,
      };
    });
  } catch (error) {
    console.log(error);
    throw new ApiError(
      500,
      'cloudinary url error',
      'CLOUDINARY_UPLOAD'
    );
  }
};

export default getCloudinaryUrl;
