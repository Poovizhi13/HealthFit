const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  mobileNumber: {
    type: String,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  allergies: {
    type: String,
    default: ''
  },
  surgeries: {
    type: String,
    default: ''
  },
  medicalTreatment: {
    type: String,
    default: ''
  },
  bloodType: {
    type: String,
    required: true
  },
  alcoholOrSmoke: {
    type: String,
    required: true,
    enum: ['Yes', 'No']
  },
  dietarySupplements: {
    type: String,
    default: ''
  },
  purpose: {
    type: String,
    required: true
  },
  healthCheckupDate: {
    type: Date,
    required: true
  },
  medicalReportPath: {
    type: String,
    default: null
  },
  medicalReportName: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on document update
healthRecordSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema);