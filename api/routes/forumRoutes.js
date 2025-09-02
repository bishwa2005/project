import express from 'express';
import { postAnswer, acceptAnswer, askQuestion, getAllQuestions, getQuestionById,deleteQuestion } from '../controllers/forumController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/questions', authMiddleware, askQuestion);
router.get('/questions', authMiddleware, getAllQuestions);
router.get('/questions/:questionId', authMiddleware, getQuestionById);
router.post('/questions/:questionId/answers', authMiddleware, postAnswer);
router.put('/answers/:answerId/accept', authMiddleware, acceptAnswer);
router.delete('/questions/:questionId', authMiddleware, deleteQuestion);

export default router;