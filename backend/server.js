//server.js
// Import necessary modules
const express = require('express');
const https = require('https');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const expressWs = require('express-ws');
const axios = require('axios');

// Import User and Promoter models
const User = require('./models/User');
const Promoter = require('./models/Promoter');
const messagesRoute = require('./routes/messages');
const chatRoute = require('./routes/message');
const { verifyToken } = require('./middleware/middleware');
const paymentRoute = require('./routes/paymentRoute');
const { handleUserAuthentication, admin } = require('./firebase');
const ApprovalRoute = require('./routes/Approval');

// Initialize Express app
const app = express();
const wsApp = expressWs(app);
app.use(express.json());
// Enable CORS
const corsOptions = {
  origin: 'http://localhost:8081',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// Register routes
app.use('/', messagesRoute);
app.use('/chat', chatRoute);
app.use('/payment', paymentRoute);
app.use('/', ApprovalRoute);

// Create Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware for enabling CORS and handling OPTIONS requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8081');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      return res.status(200).json({});
  }
  next();
});

// Register endpoint
// Register endpoint with specific CORS headers
app.post('/register', async (req, res) => {
  const { name, email, password, country, state, userType, gender, instagrammer, youtuber } = req.body;
  const Model = userType === 'user' ? User : Promoter;

  try {
      // Check if the username is already in use
      const existingUser = await Model.findOne({ name });
      if (existingUser) {
          return res.status(409).json({ error: "Username already in use, please choose a different one" });
      }

      // Check if the email is already in use
      const existingEmail = await Model.findOne({ email });
      if (existingEmail) {
          return res.status(409).json({ error: "Email already in use" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user instance
      const newUser = new Model({
          name,
          email,
          password: hashedPassword,
          country,
          state,
          userType,
          registeredAt: new Date(),
          gender,
          instagrammer, 
          youtuber,
      });

      // Save the new user to the database
      console.log('Saving new user:', newUser); // Add logging
      try {
          const savedUser = await newUser.save();
          console.log('Saved user:', savedUser); // Add logging

          // Generate JWT token
          const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET);

          // Authenticate user with Firebase and synchronize user data
          console.log('Authenticating user with Firebase:', savedUser._id); // Add logging
          const firebaseToken = await handleUserAuthentication(savedUser._id.toString());

          // Send the response with the user data, JWT token, and Firebase token
          res.status(201).json({
              message: "Registration successful",
              user: {
                  _id: savedUser._id,
                  name: savedUser.name,
                  email: savedUser.email,
                  country: savedUser.country,
                  state: savedUser.state,
                  userType: userType,
                  registeredAt: savedUser.registeredAt,
                  gender: savedUser.gender,  // Include gender
                  instagrammer: savedUser.instagrammer,  // Include instagrammer
                  youtuber: savedUser.youtuber,  // Include youtuber
              },
              token: token, // Include the JWT token in the response
              firebaseToken: firebaseToken // Include the Firebase token in the response
          });
          console.log('User registered and authenticated:', savedUser);
      } catch (error) {
          console.error('Error saving new user:', error);
          res.status(500).json({ error: 'Internal Server Error', details: error.message });
      }
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});



// Login endpoint
app.post('/login', async (req, res) => {
  const { email, name, password, userType } = req.body;

  try {
    let Model;
    if (userType === 'user') {
      Model = User;
    } else if (userType === 'promoter') {
      Model = Promoter;
    } else {
      return res.status(400).json({ error: "Invalid user type" });
    }

    // Check if the user exists by email
    let user = await Model.findOne({ email });

    // If user not found by email, try finding by name
    if (!user && name) {
      user = await Model.findOne({ name });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify the password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    // Send the response with the user data and token
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        country: user.country,
        state: user.state,
        userType: userType,
        registeredAt: user.registeredAt,
        gender: user.gender,  // Include gender
        instagrammer: user.instagrammer,  // Include instagrammer
        youtuber: user.youtuber  // Include youtuber
      },
      token: token
    });

  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


// Google Sign-In endpoint
app.post('/google-signin', async (req, res) => {
  const { idToken } = req.body;

  try {
    console.log('Received ID token:', idToken); // Log the received ID token

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name } = payload; // Extract email and name from Google payload

    console.log('Verified Google ID token. Email:', email); // Log the verified email

    // Forward the request to ngrok
    const apiUrl = 'https://d120-2401-4900-63ef-8e97-fd77-c254-7e6a-25c5.ngrok-free.app/google-signin';
    const ngrokResponse = await axios.post(apiUrl, { id_token: idToken });

    // Send the ngrok response back to the client
    res.json(ngrokResponse.data);
  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});



// Logout endpoint
app.post('/logout', verifyToken, async (req, res) => {
  try {
    // Invalidate the token associated with the user
    // For example, you can remove the token from the database or mark it as expired
    // Here, we'll simply remove it from the user object
    req.user.token = null;

    // Save the updated user object (optional)
    await req.user.save();

    // Redirect to the appropriate login screen based on user type
    if (req.user.userType === 'user') {
      return res.status(200).json({ message: 'Logout successful', redirect: '/user/login' });
    } else if (req.user.userType === 'promoter') {
      return res.status(200).json({ message: 'Logout successful', redirect: '/promoter/login' });
    } else {
      // Handle other user types if necessary
      return res.status(200).json({ message: 'Logout successful' });
    }
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


// Update profile endpoint
app.put('/profile/:userType/:userId', async (req, res) => {
  try {
    const { userType, userId } = req.params;
    let Model;

    if (userType === 'user') {
      Model = User;
    } else if (userType === 'promoter') {
      Model = Promoter;
    } else {
      return res.status(400).json({ error: "Invalid user type" });
    }

    // Check if the user exists
    const user = await Model.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user's additional details
    if (req.body.gender !== undefined) user.gender = req.body.gender;
    if (req.body.instagrammer !== undefined) user.instagrammer = req.body.instagrammer;
    if (req.body.youtuber !== undefined) user.youtuber = req.body.youtuber;

    // Save the updated user profile
    await user.save();

    // Send the response with the updated user profile
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error('Failed to update profile:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//admin functionalities
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password field
    const usersWithTokenInfo = users.map(user => ({
      ...user.toJSON(),
      userID: user._id, // Include user ID
      userType: 'user', // Include userType field for users
    }));
    res.json(usersWithTokenInfo);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/promoters', async (req, res) => {
  try {
    const promoters = await Promoter.find({}, '-password'); // Exclude password field
    const promotersWithTokenInfo = promoters.map(promoter => ({
      ...promoter.toJSON(),
      userID: promoter._id, // Include promoter ID
      userType: 'promoter', // Include userType field for promoters
    }));
    res.json(promotersWithTokenInfo);
  } catch (error) {
    console.error('Error fetching promoters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const numberToBinaryString = (number) => {
  const binaryStr = Number(number).toString(2);
  const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';
  let encodedStr = '';

  for (let i = 0; i < binaryStr.length; i++) {
    encodedStr += binaryStr[i] + specialChars[i % specialChars.length];
  }

  return encodedStr;
};

const transformBinaryCode = (binaryCode) => {
  const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';
  let decodedBinaryStr = '';

  for (let i = 0; i < binaryCode.length; i++) {
    if (!specialChars.includes(binaryCode[i])) {
      decodedBinaryStr += binaryCode[i];
    }
  }

  return decodedBinaryStr;
};

const decodeBinaryString = (binaryString) => {
  const cleanBinaryStr = binaryString.replace(/[^01]/g, ''); // Remove all non-binary characters
  const decodedNumber = parseInt(cleanBinaryStr, 2); // Convert binary string to decimal
  return decodedNumber;
};

app.post('/reset-password-with-auth/verify', async (req, res) => {
  console.log('Received request body:', req.body);
  const { email, authNumber, favPerson, schoolName, userID, userType } = req.body;

  if (!email || !authNumber || !favPerson || !schoolName) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const user = userType === 'promoter'
      ? await Promoter.findById(userID)
      : await User.findById(userID);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (
      user.email !== email ||
      user.favPerson !== favPerson ||
      user.schoolName !== schoolName
    ) {
      return res.status(401).json({ error: 'Authentication failed. Fields do not match.' });
    }

    const decodedAuthNumber = decodeBinaryString(authNumber); // Decode the binary string
    const expectedAuthNumber = decodeBinaryString(user.authNumber); // Decode the stored auth number

    if (decodedAuthNumber !== expectedAuthNumber) {
      return res.status(401).json({ error: 'Invalid authentication number. Fields match, but the authentication number is incorrect.' });
    }

    res.json({ message: 'Authentication successful' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});



app.post('/reset-password-with-auth', async (req, res) => {
  console.log('Received request body:', req.body);
  const { email, favPerson, schoolName, newPassword, userID, userType } = req.body;

  if (!email || !favPerson || !schoolName || !newPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const user = userType === 'promoter'
      ? await Promoter.findById(userID)
      : await User.findById(userID);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});



const encodeAuthNumber = (authNumber) => {
  // Implement your encoding logic here
  // For example, you can simply return the received authNumber as it is
  return authNumber;
};

app.post('/update-user-data', async (req, res) => {
  const { userID, authNumber, favPerson, schoolName, userType } = req.body;

  const Model = userType === 'user' ? User : Promoter;

  console.log('Received Request Data:', req.body);

  try {
    const user = await Model.findById(userID);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.authNumber = encodeAuthNumber(authNumber); // Ensure authNumber is correctly encoded
    user.favPerson = favPerson;
    user.schoolName = schoolName;

    await user.save();

    const responseData = { message: 'User data updated successfully', user };
    console.log('Sending Response Data:', responseData);
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error updating user data:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// WebSocket endpoint
wsApp.getWss().on('connection', (ws, req) => {
  console.log('WebSocket connection established.');
  ws.on('message', (msg) => {
    console.log('Received message:', msg);
    ws.send('Server received your message.');
  });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
