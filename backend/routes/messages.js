// backend/routes/messages.js
const express = require('express');
const { firebaseDatabase } = require('../firebase'); // Import firebaseDatabase from firebase.js
const router = express.Router();
const User = require('../models/User');
const Promoter = require('../models/Promoter');
const admin = require('firebase-admin'); // Import Firebase Admin SDK
const multer = require('multer');

// Multer configuration for handling form data
const upload = multer();

// Function to handle image upload to Firebase Storage
async function handleImageUpload(image, userId) {
  try {
    if (!image || !image.buffer || !image.originalname || !image.mimetype) {
      throw new Error('Invalid image data provided');
    }

    console.log('Received image:', image);

    const bucket = admin.storage().bucket();
    const imageName = `${userId}_${Date.now()}_${image.originalname}`;
    const file = bucket.file(`postedimages/${imageName}`);

    await file.save(image.buffer, {
      metadata: {
        contentType: image.mimetype
      }
    });

    const imageUrl = await file.getSignedUrl({
      action: 'read',
      expires: '01-01-2030'
    });

    return imageUrl[0];
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// GET route for messages
router.get('/messages', async (req, res) => {
  try {
    // Fetch messages from the database
    const snapshot = await firebaseDatabase.ref('messages').once('value');
    const messages = snapshot.val();

    // Check if messages exist
    if (!messages) {
      return res.status(200).json([]);
    }

    // Convert messages object to array and include ratings and ratingCounts
    const messagesArray = Object.keys(messages).map(key => {
      const message = messages[key];
      const filteredRatings = Object.entries(message.ratings || {})
        .filter(([userId, rating]) => rating !== 0) // Filter out ratings with value 0
        .reduce((acc, [userId, rating]) => {
          acc[userId] = rating;
          return acc;
        }, {});

      const totalRatings = Object.values(filteredRatings).reduce((acc, cur) => acc + cur, 0); // Calculate total ratings

      // Count the number of ratings for each star
      const ratingCounts = Array(5).fill(0);
      Object.values(filteredRatings).forEach(rating => {
        if (rating > 0) {
          ratingCounts[rating - 1]++;
        }
      });

      return {
        id: key,
        ...message,
        ratings: filteredRatings,
        totalRatings: totalRatings,
        ratingCounts: ratingCounts // Include ratingCounts in the response
      };
    });

    res.status(200).json(messagesArray);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});



// POST route for handling message creation
router.post('/messages', upload.single('media'), async (req, res) => {
  try {
    console.log('Request Body:', req.body);

    // Extract fields from the request body
    const { content, cost, receiverId, userType, releaseDate, ratings } = req.body;

    console.log('Received request with userType:', userType);
    console.log('Received request with receiverId:', receiverId);

    // Check if releaseDate is provided
    if (!releaseDate) {
      throw new Error('Release date is required');
    }

    // Parse releaseDate into a Date object
    const parsedReleaseDate = new Date(releaseDate);

    // Check if parsedReleaseDate is a valid Date object
    if (isNaN(parsedReleaseDate.getTime())) {
      throw new Error('Invalid release date');
    }

    // Convert parsedReleaseDate to ISO string format
    const formattedReleaseDate = parsedReleaseDate.toISOString();

    // Check if userType and receiverId are provided and valid
    if (!userType || !receiverId || (userType !== 'user' && userType !== 'promoter')) {
      throw new Error('Invalid user type or receiver ID');
    }

    console.log('Valid user type:', userType);

    // Find sender based on userType and receiverId
    let sender;
    if (userType === 'user') {
      sender = await User.findById(receiverId);
    } else if (userType === 'promoter') {
      sender = await Promoter.findById(receiverId);
    }

    // Throw error if sender not found
    if (!sender) {
      throw new Error(`Sender with ID ${receiverId} and type ${userType} not found`);
    }

    console.log('Sender found:', sender);

    // Handle image upload if included in the request
    let imageUrls = [];
    if (req.file) {
      // handleImageUpload function to be implemented based on your requirements
      imageUrls.push(await handleImageUpload(req.file, receiverId));
    }

    console.log('Image URLs:', imageUrls);

    // Construct new message object
    const newMessage = {
      content,
      cost,
      receiverId,
      senderName: sender.name,
      userType: userType, // Ensure userType is set
      releaseDate: formattedReleaseDate,
      images: imageUrls,
      ratings: [0, 0, 0, 0, 0] // Initialize ratings
    };

    // Push new message to Firebase database
    const newMessageRef = await admin.database().ref('messages').push();
    const messageId = newMessageRef.key; // Get the message ID

    // Set the message ID in the newMessage object
    newMessage.id = messageId;

    // Store the new message in Firebase
    await newMessageRef.set(newMessage);

    // Send success response
    res.status(201).json({ message: 'Message posted successfully', newMessage });

    // Set a flag to indicate message posting success
    let isMessagePosted = true;

    // Inside the setTimeout block for deleting messages after 1 hour
    setTimeout(async () => {
      try {
        // Check if message was manually deleted by the user during the 1-hour countdown
        if (!isMessagePosted) {
          console.log('Message was manually deleted before the deletion countdown.');
          return; // Cancel the deletion process
        }

        // Delete message and associated image(s) from the database
        await admin.database().ref(`messages/${messageId}`).remove();

        // Log deletion success
        console.log('Message and associated images deleted successfully after 1 hour');

      } catch (deleteError) {
        console.error('Error deleting message:', deleteError);
      }
    }, 330000); // Wait for 1 hour before initiating deletion

  } catch (error) {
    // Handle errors and send appropriate response
    console.error('Error posting message:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

router.post('/messages/:messageId/ratings', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, rating } = req.body;

    // Validate input data
    if (!messageId || !userId || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Invalid input data' });
    }

    // Fetch the current message from Firebase
    const messageRef = admin.database().ref(`/messages/${messageId}`);
    const snapshot = await messageRef.once('value');
    const message = snapshot.val();

    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    // Update or add the user's rating
    if (message.ratings && message.ratings[userId]) {
      if (message.ratings[userId] === rating) {
        delete message.ratings[userId];
      } else {
        message.ratings[userId] = rating;
      }
    } else {
      message.ratings = { ...message.ratings, [userId]: rating };
    }

    // Count the number of ratings for each star
    const ratingCounts = Array(5).fill(0);
    Object.values(message.ratings).forEach(rating => {
      if (rating > 0) {
        ratingCounts[rating - 1]++;
      }
    });

    // Update the rating counts in the message object
    message.ratingCounts = ratingCounts;

    // Save the updated message back to Firebase
    await messageRef.set(message);

    // Send the updated message with rating counts in the response
    res.status(201).json({ success: true, message: 'Rating stored successfully', updatedMessage: message });
  } catch (error) {
    console.error('Error storing rating:', error);
    res.status(500).json({ success: false, error: 'Failed to store rating' });
  }
});

// GET route for message ratings
router.get('/messages/:messageId/ratings', async (req, res) => {
  try {
    // Retrieve message ID from request parameters
    const messageId = req.params.messageId;

    // Query the database or perform any necessary operations to retrieve rating counts for the specified message ID
    // For example, if you're using Firebase:
    const messageRef = admin.database().ref(`/messages/${messageId}`);
    const snapshot = await messageRef.once('value');
    const message = snapshot.val();

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Initialize ratingCounts with an empty object if it's not already defined
    const ratingCounts = message.ratingCounts || {};

    // Return the rating counts in the response
    res.status(200).json({ ratingCounts });
  } catch (error) {
    console.error('Error fetching rating counts:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


module.exports = router;
