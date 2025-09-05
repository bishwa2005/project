import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import {
  getProfileById,
  updateMyProfile,
  addProject,
  deleteProject,
  uploadProfilePhoto,
  updateCredentials
} from '../controllers/profileController.js';
import authMiddleware from '../middleware/authMiddleware.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'college-connect-profiles',
    allowed_formats: ['jpg', 'png', 'jpeg']
  },
});

const upload = multer({ storage });

const router = express.Router();

router.get('/:id', authMiddleware, getProfileById);
router.put('/me', authMiddleware, updateMyProfile);
router.post('/projects', authMiddleware, addProject);
router.delete('/projects/:projectId', authMiddleware, deleteProject);
router.post('/photo', authMiddleware, upload.single('profilePhoto'), uploadProfilePhoto);
router.put('/credentials', authMiddleware, updateCredentials);

export default router;
