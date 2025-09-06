import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { register, login, getLoggedInUser } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getLoggedInUser);

const JWT_SECRET = '7bdfeb7d5faea725ed6d5084ad971e7cd37750675838182a3e6101308ef7e331f76b1ac89be221033f7123ead7bfd9908149b8419b62224f5887eede2828e813'
// Route to initiate Google login
// This redirects the user to Google's sign-in page
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


// Google callback route
// Google redirects here after successful login
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const payload = { user: { id: req.user.id } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.redirect(`${FRONTEND_URL}/callback.html?token=${token}&userId=${req.user.id}`);
  }
);



export default router;