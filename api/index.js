import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import passport from 'passport';
import './config/passport-setup.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import platformRoutes from './routes/platformRoutes.js';
import connectionRoutes from './routes/connectionRoutes.js';
import aiRoutes from './routes/aiRoutes.js'; // <-- ADD THIS LINE

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(passport.initialize());
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/', (req, res) => res.send('College Connect API is running.'));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/connections', connectionRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));