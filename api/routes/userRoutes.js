import express from 'express';
import { getAllUsers, getLeaderboard, getConnections, getUserById } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllUsers);
router.get('/ranking', authMiddleware, getLeaderboard);
router.get('/connections', authMiddleware, getConnections);
router.get('/:id', authMiddleware, getUserById);

export default router;