import express from 'express';
import { sendConnectionRequest, getPendingRequests, respondToRequest, disconnect } from '../controllers/connectionController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/send/:id', authMiddleware, sendConnectionRequest);
router.get('/requests', authMiddleware, getPendingRequests);
router.put('/respond/:requesterId', authMiddleware, respondToRequest);
router.delete('/disconnect/:id', authMiddleware, disconnect);

export default router;