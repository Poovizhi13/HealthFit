const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const HealthRecord = require('../models/HealthRecord');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/medical-reports';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename: userId_timestamp_originalname
    const uniqueSuffix = `${req.user.id}_${Date.now()}`;
    cb(null, `${uniqueSuffix}_${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only specific file types
    const allowedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedFileTypes.includes(ext)) {
      return cb(null, true);
    }
    
    cb(new Error('Invalid file type. Only PDF, images, and Word documents are allowed.'));
  }
});


// GET all health records for a user
router.get('/', async (req, res) => {
  try {
    const records = await HealthRecord.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching health records:', error);
    res.status(500).json({ message: 'Server error while fetching records', error: error.message });
  }
});

// GET a specific health record
router.get('/:id', async (req, res) => {
  try {
    const record = await HealthRecord.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!record) {
      return res.status(404).json({ message: 'Health record not found' });
    }
    
    res.status(200).json(record);
  } catch (error) {
    console.error('Error fetching health record:', error);
    res.status(500).json({ message: 'Server error while fetching record', error: error.message });
  }
});

// POST create a new health record
router.post('/', upload.single('medicalReport'), async (req, res) => {
  try {
    const newRecord = new HealthRecord({
      userId: req.user.id,
      ...req.body,
      medicalReportPath: req.file ? req.file.path : null,
      medicalReportName: req.file ? req.file.originalname : null
    });
    
    const savedRecord = await newRecord.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    console.error('Error creating health record:', error);
    res.status(500).json({ message: 'Server error while creating record', error: error.message });
  }
});

// PUT update a health record
router.put('/:id', upload.single('medicalReport'), async (req, res) => {
  try {
    // Check if record exists and belongs to user
    const record = await HealthRecord.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!record) {
      return res.status(404).json({ message: 'Health record not found' });
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      record[key] = req.body[key];
    });
    
    // Update file if provided
    if (req.file) {
      // Delete old file if exists
      if (record.medicalReportPath && fs.existsSync(record.medicalReportPath)) {
        fs.unlinkSync(record.medicalReportPath);
      }
      
      record.medicalReportPath = req.file.path;
      record.medicalReportName = req.file.originalname;
    }
    
    const updatedRecord = await record.save();
    res.status(200).json(updatedRecord);
  } catch (error) {
    console.error('Error updating health record:', error);
    res.status(500).json({ message: 'Server error while updating record', error: error.message });
  }
});

// DELETE a health record
router.delete('/:id', async (req, res) => {
  try {
    const record = await HealthRecord.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!record) {
      return res.status(404).json({ message: 'Health record not found' });
    }
    
    // Delete associated file if exists
    if (record.medicalReportPath && fs.existsSync(record.medicalReportPath)) {
      fs.unlinkSync(record.medicalReportPath);
    }
    
    await record.remove();
    res.status(200).json({ message: 'Health record deleted successfully' });
  } catch (error) {
    console.error('Error deleting health record:', error);
    res.status(500).json({ message: 'Server error while deleting record', error: error.message });
  }
});

// Download medical report
router.get('/:id/report', async (req, res) => {
  try {
    const record = await HealthRecord.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!record || !record.medicalReportPath) {
      return res.status(404).json({ message: 'Medical report not found' });
    }
    
    if (!fs.existsSync(record.medicalReportPath)) {
      return res.status(404).json({ message: 'Medical report file not found' });
    }
    
    res.download(record.medicalReportPath, record.medicalReportName);
  } catch (error) {
    console.error('Error downloading medical report:', error);
    res.status(500).json({ message: 'Server error while downloading report', error: error.message });
  }
});

module.exports = router;