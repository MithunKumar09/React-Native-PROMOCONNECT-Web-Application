//backend/firebase.js
const mongoose = require('mongoose');
const User = require('./models/User');
const Promoter = require('./models/Promoter');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Check if Firebase Admin SDK is already initialized
if (!admin.apps.length) {
    // Initialize Firebase Admin SDK
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://promoconnect-681c6-default-rtdb.firebaseio.com/',
        storageBucket: 'gs://promoconnect-681c6.appspot.com'
    });
}

const firebaseDatabase = admin.database();

// 1. Retrieve User Data from MongoDB Atlas
const fetchUserData = async (userId) => {
    try {
        console.log('Fetching user data for userId:', userId);
        const userData = await User.findById(userId) || await Promoter.findById(userId);
        console.log('Fetched user data:', userData);
        if (!userData) {
            console.log('User data not found for userId:', userId);
            throw new Error('User data not found');
        }
        return userData;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw new Error('Failed to fetch user data');
    }
};



// 2. Map MongoDB User Data to Firebase User Format
const mapToFirebaseUser = (userData) => {
    // Map MongoDB user data to Firebase user format
    const firebaseUser = {
        uid: userData._id.toString(), // Use MongoDB document ID as Firebase UID
        email: userData.email,
        displayName: userData.name,
        // Map additional fields as needed
    };
    return firebaseUser;
};

// 3. Authenticate Users with Firebase
const authenticateWithFirebase = async (userData) => {
    try {
        // Create custom token for Firebase authentication
        const firebaseToken = await admin.auth().createCustomToken(userData.uid);
        return firebaseToken;
    } catch (error) {
        console.error('Error authenticating with Firebase:', error);
        throw new Error('Failed to authenticate with Firebase');
    }
};

// 4. Synchronize User Data with Firebase Realtime Database or Firestore
const syncUserDataWithFirebase = async (userData) => {
    try {
        // Get a reference to the Firebase database
        const db = admin.database();
        
        // Convert MongoDB ObjectId to a string key
        const userIdString = userData._id.toString();

        // Reference to the path where user data will be stored
        const userRef = db.ref(`users/${userIdString}`);
        
        // Convert Mongoose document to plain JavaScript object
        const userDataObject = userData.toObject();

        // Remove the _id field before synchronizing
        delete userDataObject._id;

        // Set the user data in the Firebase database
        await userRef.set(userDataObject);
        
        console.log('User data synchronized with Firebase:', userDataObject);
    } catch (error) {
        console.error('Error synchronizing user data with Firebase:', error);
        throw new Error('Failed to synchronize user data with Firebase');
    }
};

// 5. Handle User Authentication and Authorization
const handleUserAuthentication = async (userId) => {
    try {
        if (!userId || typeof userId !== 'string') {
            throw new Error('Invalid userId');
        }

        console.log('Handling user authentication for userId:', userId);

        // Fetch user data from MongoDB Atlas
        const userData = await fetchUserData(userId);

        if (!userData) {
            throw new Error('User data not found');
        }

        // Map MongoDB user data to Firebase user format
        const firebaseUser = mapToFirebaseUser(userData);

        // Authenticate user with Firebase
        const firebaseToken = await authenticateWithFirebase(firebaseUser);

        // Synchronize user data with Firebase
        await syncUserDataWithFirebase(userData);

        return firebaseToken;
    } catch (error) {
        console.error('Error handling user authentication:', error);
        throw error;
    }
};

module.exports = {
    admin,
    firebaseDatabase,
    handleUserAuthentication
};
