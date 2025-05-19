import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { mkdir } from 'fs/promises';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/medical-reports';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const userId = req.userId || 'unknown';
    const uniqueSuffix = `${userId}_${Date.now()}`;
    cb(null, `${uniqueSuffix}_${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
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

// Create uploads directory if it doesn't exist
try {
  await mkdir('uploads/medical-reports', { recursive: true });
} catch (err) {
  console.error('Error creating uploads directory:', err);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-auth')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true },
  password: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Health Record Schema
const healthRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  allergies: String,
  surgeries: String,
  medicalTreatment: String,
  bloodType: { type: String, required: true },
  alcoholOrSmoke: { type: String, required: true },
  dietarySupplements: String,
  purpose: { type: String, required: true },
  healthCheckupDate: { type: Date, required: true },
  medicalReportPath: { type: String }, // Now optional
  medicalReportName: { type: String }  // Store original filename
}, { timestamps: true });

const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File too large', 
        error: 'The uploaded file exceeds the 10MB size limit.' 
      });
    }
  }
  
  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({ 
      message: 'Invalid file type', 
      error: err.message 
    });
  }
  
  next(err);
};

app.use(handleMulterError);

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { fullname, email, phone, dateOfBirth, gender, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = new User({
      fullname,
      email,
      phone,
      dateOfBirth,
      gender,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile
app.get('/api/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Health Record endpoints

// Create new health record
app.post('/api/health-records', verifyToken, upload.single('medicalReport'), async (req, res) => {
  try {
    const healthRecord = new HealthRecord({
      userId: req.userId,
      ...req.body,
      medicalReportPath: req.file ? req.file.path : undefined,
      medicalReportName: req.file ? req.file.originalname : undefined
    });

    await healthRecord.save();
    res.status(201).json({ 
      message: 'Health record created successfully',
      record: healthRecord
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all health records for the logged-in user
app.get('/api/health-records', verifyToken, async (req, res) => {
  try {
    const records = await HealthRecord.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a single health record by ID
app.get('/api/health-records/:id', verifyToken, async (req, res) => {
  try {
    const record = await HealthRecord.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!record) {
      return res.status(404).json({ message: 'Health record not found' });
    }
    
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a health record
app.put('/api/health-records/:id', verifyToken, upload.single('medicalReport'), async (req, res) => {
  try {
    const record = await HealthRecord.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!record) {
      return res.status(404).json({ message: 'Health record not found' });
    }
    
    // Update basic fields
    Object.keys(req.body).forEach(key => {
      record[key] = req.body[key];
    });
    
    // Update file if a new one was uploaded
    if (req.file) {
      // Delete old file if it exists
      if (record.medicalReportPath && fs.existsSync(record.medicalReportPath)) {
        fs.unlinkSync(record.medicalReportPath);
      }
      
      record.medicalReportPath = req.file.path;
      record.medicalReportName = req.file.originalname;
    }
    
    await record.save();
    res.status(200).json({ 
      message: 'Health record updated successfully', 
      record 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a health record
app.delete('/api/health-records/:id', verifyToken, async (req, res) => {
  try {
    const record = await HealthRecord.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!record) {
      return res.status(404).json({ message: 'Health record not found' });
    }
    
    // Delete the file from filesystem if it exists
    if (record.medicalReportPath && fs.existsSync(record.medicalReportPath)) {
      fs.unlinkSync(record.medicalReportPath);
    }
    
    await HealthRecord.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Health record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Download medical report
app.get('/api/health-records/:id/report', verifyToken, async (req, res) => {
  try {
    const record = await HealthRecord.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!record || !record.medicalReportPath) {
      return res.status(404).json({ message: 'Medical report not found' });
    }
    
    // Check if file exists
    if (!fs.existsSync(record.medicalReportPath)) {
      return res.status(404).json({ message: 'Medical report file not found on server' });
    }
    
    // Send the file for download
    res.download(record.medicalReportPath, record.medicalReportName || 'medical-report.pdf');
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Serve uploaded files statically (if needed for viewing in browser)
app.use('/uploads', verifyToken, express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error' 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));