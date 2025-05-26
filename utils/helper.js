import cloudinary from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImageToCloudinary = async (imagePath) => {
  try {
    const result = await cloudinary.v2.uploader.upload(imagePath, {
      folder: 'uploads',
    });
    return {
      status: true,
      message: 'Image uploaded successfully',
      url: result.secure_url,
    };
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
};
