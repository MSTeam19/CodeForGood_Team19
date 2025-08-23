const { bucket } = require('./storage');

/**
 * Upload an image file to Google Cloud Storage
 * @param {Object} file - The file object from multer
 * @param {string} destination - The destination path in the bucket
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
async function uploadImageToGCS(file, destination) {
  try {
    const blob = bucket.file(destination);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (err) => {
        reject(err);
      });

      blobStream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
      });

      blobStream.end(file.buffer);
    });
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
}

module.exports = { uploadImageToGCS };