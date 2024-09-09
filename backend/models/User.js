// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  authNumber: { type: String },
  favPerson: { type: String },
  schoolName: { type: String },
  country: { type: String },
  state: { type: String },
  userType: { type: String, enum: ['user', 'promoter'], required: true },
  registeredAt: { type: Date, default: Date.now },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  instagrammer: { type: Boolean, default: false },
  youtuber: { type: Boolean, default: false },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
