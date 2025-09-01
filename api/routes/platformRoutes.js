import express from 'express';
import { getLeetCodeStats, getCodeforcesStats,} from '../controllers/platformController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/leetcode/:username', authMiddleware, getLeetCodeStats);
router.get('/codeforces/:username', authMiddleware, getCodeforcesStats);


export default router;