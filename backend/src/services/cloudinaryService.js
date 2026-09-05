import cloudinary from '../config/cloudinary.js';

export const uploadImage = async (base64OrPath, folder = 'dealdesk/properties') => {
  try {
    if (!cloudinary.config().cloud_name) {
      // Fallback for offline mock
      return { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', publicId: 'mock_img' };
    }
    const result = await cloudinary.uploader.upload(base64OrPath, {
      folder,
      resource_type: 'auto',
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('[Cloudinary upload error]', error);
    throw { statusCode: 500, message: 'Failed to upload media asset to Cloudinary', code: 'CLOUDINARY_ERROR' };
  }
};
