//backend/routes/Approval.js
const express = require('express');
const multer = require('multer');
const { admin, firebaseDatabase } = require('../firebase'); // Import initialized Firebase Admin SDK
const router = express.Router();
const mongoose = require('mongoose'); // Import mongoose to access the connection

// Import the Mongoose model for 'identifications'
const Identification = mongoose.model('identifications', new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  instagramName: String,
  instagramLink: String,
  youtubeName: String,
  youtubeLink: String,
}));

// Multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Function to upload image to Firebase Storage
const uploadImageToFirebase = async (file, email) => {
  const bucket = admin.storage().bucket();
  const imageName = `${email}_${Date.now()}_${file.originalname}`;
  const blob = bucket.file(`approval-images/${imageName}`);
  const blobStream = blob.createWriteStream({
    metadata: { contentType: file.mimetype },
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', (error) => {
      reject(`Upload error: ${error.message}`);
    });

    blobStream.on('finish', async () => {
      const imageUrl = await blob.getSignedUrl({
        action: 'read',
        expires: '03-09-2491', // Arbitrary expiration
      });
      resolve(imageUrl[0]); // Return the public image URL
    });

    blobStream.end(file.buffer);
  });
};

// Approval form submission handler
router.post('/update-promoter', upload.fields([
  { name: 'instagramScreenshot', maxCount: 1 },
  { name: 'youtubeScreenshot', maxCount: 1 },
]), async (req, res) => {
  try {
    const { instagramName, instagramLink, youtubeName, youtubeLink, email } = req.body;
    const instagramScreenshotFile = req.files['instagramScreenshot']?.[0];
    const youtubeScreenshotFile = req.files['youtubeScreenshot']?.[0];

    let instagramScreenshotUrl, youtubeScreenshotUrl;

    // Upload screenshots to Firebase if provided
    if (instagramScreenshotFile) {
      instagramScreenshotUrl = await uploadImageToFirebase(instagramScreenshotFile, email);
    }
    if (youtubeScreenshotFile) {
      youtubeScreenshotUrl = await uploadImageToFirebase(youtubeScreenshotFile, email);
    }

    // Save promoter details in MongoDB (excluding screenshots)
    const promoterData = {
      instagramName,
      instagramLink,
      youtubeName,
      youtubeLink,
    };

    // Update or create new promoter document in MongoDB
    await Identification.findOneAndUpdate(
      { email },
      { $set: promoterData },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      message: 'Details updated successfully',
      instagramScreenshotUrl,
      youtubeScreenshotUrl,
    });
  } catch (error) {
    console.error('Error updating promoter:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
