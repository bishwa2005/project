import express from 'express';
import multer from 'multer';
import path from 'path';
import { getProfileById, updateMyProfile, addProject, deleteProject, uploadProfilePhoto, updateCredentials } from '../controllers/profileController.js';
import authMiddleware from '../middleware/authMiddleware.js';



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `user-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });

const router = express.Router();

router.get('/:id', authMiddleware, getProfileById);
router.put('/me', authMiddleware, updateMyProfile);
router.post('/projects', authMiddleware, addProject);
router.delete('/projects/:projectId', authMiddleware, deleteProject);
router.post('/photo', authMiddleware, upload.single('profilePhoto'), uploadProfilePhoto);
router.put('/credentials', authMiddleware, updateCredentials);

export default router;