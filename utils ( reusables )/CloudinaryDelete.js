import { cloudinary } from '../config (db connect)/cloudinary.config.js';

/**
 * Deletes an image from Cloudinary using its URL
 * @param {string} url - The Cloudinary image URL
 * @returns {Promise<boolean>} - True if deletion successful, false otherwise
 */
const deleteCloudinaryImage = async (url) => {
  try {
    if (!url) {
      console.log('No URL provided for Cloudinary deletion');
      return false;
    }

    // Extract public_id from Cloudinary URL
    // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/sample.jpg
    // Public ID: folder/sample
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.\w+$/;
    const match = url.match(regex);

    if (!match || !match[1]) {
      console.log('Could not extract public_id from URL:', url);
      return false;
    }

    const publicId = match[1];
    console.log('Attempting to delete Cloudinary image with public_id:', publicId);

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      console.log('Cloudinary image deleted successfully:', publicId);
      return true;
    } else {
      console.log('Cloudinary deletion failed:', result);
      return false;
    }
  } catch (error) {
    console.error('Error deleting Cloudinary image:', error.message);
    return false;
  }
};

export default deleteCloudinaryImage;
