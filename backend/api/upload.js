const express = require('express');
const multer = require('multer');
const { uploadImageToGCS } = require('../storage/upload');

const router = express.Router();

// Test route to check if upload API is accessible
router.get('/test', (req, res) => {
  console.log('🎯 Upload test endpoint hit!');
  res.json({ 
    success: true, 
    message: 'Upload API is working!',
    timestamp: new Date().toISOString()
  });
});

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('📁 File received:', file.originalname, file.mimetype);
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Change this from '/upload' to '/'
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      console.log(' No file in request');
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    // Generate unique filename
    const fileName = `images/${Date.now()}-${req.file.originalname}`;
    
    // Upload to Google Cloud Storage
    const publicUrl = await uploadImageToGCS(req.file, fileName);

    res.json({ 
      success: true,
      message: 'Upload successful',
      url: publicUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;