//backend/routes/message.js
const express = require('express');
const { firebaseDatabase } = require('../firebase'); // Import firebaseDatabase from firebase.js
const router = express.Router();
const User = require('../models/User');
const Promoter = require('../models/Promoter');
const admin = require('firebase-admin'); 

// Initialize Firebase Realtime Database
const db = admin.database();

// Send message endpoint
router.post('/send-message', async (req, res) => {
  try {
    const { senderId, receiverId, message, messageType, messageContent, expectedCost, senderName, senderType } = req.body;

    // Log the received request data
    console.log('Received request data:', req.body);

    // Check if required parameters are provided
    if (!senderId || !receiverId || !message || !messageType || (messageType !== 'regular' && (!messageContent || !expectedCost))) {
      console.error('Error: Required parameters are missing');
      return res.status(400).json({ error: 'Required parameters are missing' });
    }

    // Create a new chat message instance
    const messageData = {
      senderId,
      receiverId,
      message,
      time: new Date().toISOString(), // Store time as ISO string
      messageType,
      senderName,
      senderType
    };

    // Include messageContent and expectedCost only if messageType is not regular
    if (messageType !== 'regular') {
      messageData.messageContent = messageContent;
      messageData.expectedCost = expectedCost;
    } else {
      // Remove messageContent and expectedCost from regular messageType
      delete messageData.messageContent;
      delete messageData.expectedCost;
    }

    // Store the message data in Firebase Realtime Database
    await db.ref('chats').push(messageData);

    // Send success response
    console.log('Message sent successfully');
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

router.post('/messages', async (req, res) => {
  try {
    const { currentUserId, userId } = req.body;
    console.log('Received request data:', req.body); 
    // Check if currentUserId and userId are provided
    if (!currentUserId || !userId) {
      console.error('Error: currentUserId or userId not provided');
      return res.status(400).json({ error: 'currentUserId or userId not provided' });
    }

    // Query messages from Firebase Realtime Database
    const snapshot = await db.ref('chats')
      .orderByChild('time') // Assuming you have a timestamp field named 'time'
      .once('value');

    // Extract message data from the snapshot
    const messages = [];
    snapshot.forEach((childSnapshot) => {
      const messageData = childSnapshot.val(); // Rename to messageData
      // Check if the current user is either the sender or receiver of the message
      if (messageData.senderId === currentUserId || messageData.receiverId === currentUserId) {
        // Include only the required fields
        const { senderId, receiverId, message, time, messageType, senderName, senderType } = messageData;

        // Include messageContent and expectedCost only if messageType is not regular
        let formattedMessage = { senderId, receiverId, message, time, messageType, senderName, senderType };
        if (messageType !== 'regular') {
          formattedMessage.messageContent = messageData.messageContent;
          formattedMessage.expectedCost = messageData.expectedCost;
        }

        messages.push(formattedMessage);
      }
    });

    // Send the fetched messages as response
    console.log('Messages fetched successfully:', messages);
    res.status(200).json(messages); // Always respond with 200 status for successful fetch
  } catch (error) {
    console.error('Error fetching messages:', error); // Log general error
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});



// Delete messages endpoint
router.post('/delete-messages', async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    // Check if senderId and receiverId are provided
    if (!senderId || !receiverId) {
      console.error('Error: User ID or Promoter ID not provided');
      return res.status(400).json({ error: 'User ID or Promoter ID not provided' });
    }

    // Query and delete messages from Firebase Realtime Database
    await db.ref('chats')
      .orderByChild('receiverId')
      .equalTo(receiverId)
      .once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          childSnapshot.ref.remove();
        });
      });

    // Send success response
    console.log('Messages deleted successfully');
    res.status(200).json({ message: 'Messages deleted successfully' });
  } catch (error) {
    console.error('Error deleting messages:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

module.exports = router;
