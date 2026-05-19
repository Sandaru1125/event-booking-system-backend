const imagekit = require('../config/imagekit');

/**
 * Uploads a file buffer to ImageKit
 * @param {Buffer} fileBuffer - The file buffer from Multer
 * @param {string} fileName - Original filename
 * @param {string} folder - Destination folder in ImageKit
 * @returns {Promise<string>} - The URL of the uploaded image
 */
const uploadImage = async (fileBuffer, fileName, folder = '/events') => {
  try {
    console.log('🔄 Starting ImageKit upload...');
    console.log('  - File name:', fileName);
    console.log('  - Folder:', folder);
    console.log('  - Buffer size:', fileBuffer?.length || 0, 'bytes');
    
    const result = await imagekit.upload({
      file: fileBuffer, // can be a base64 string, buffer, or url
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
    });
    
    console.log('✅ ImageKit upload successful');
    console.log('  - URL:', result.url);
    return result.url;
  } catch (error) {
    console.error('❌ ImageKit upload error:', {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      details: error
    });
    throw new Error(`Failed to upload image to ImageKit: ${error.message}`);
  }
};

module.exports = {
  uploadImage,
};
