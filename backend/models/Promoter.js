// models/Promoter.js
const mongoose = require('mongoose');

const promoterSchema = new mongoose.Schema({
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
});

const Promoter = mongoose.model('Promoter', promoterSchema);

module.exports = Promoter;