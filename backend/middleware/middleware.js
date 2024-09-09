const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  console.log('Token received:', token); // Add this line to verify token value
  if (!token) return res.status(403).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

    // If verification successful, save user ID to request for use in other routes
    req.userId = decoded.userId;
    req.userType = decoded.userType;
    next();
  });
}

module.exports = {
  verifyToken,
};

  