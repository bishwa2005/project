import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = '7bdfeb7d5faea725ed6d5084ad971e7cd37750675838182a3e6101308ef7e331f76b1ac89be221033f7123ead7bfd9908149b8419b62224f5887eede2828e813';

export const register = async (req, res) => {
    const { name, email, password, domain, skills, bio } = req.body;
    try {
        const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ msg: 'User with this email already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUserQuery = `INSERT INTO users (name, email, password, domain, skills, bio) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email`;
        const values = [name, email, hashedPassword, domain, skills, bio];
        const result = await db.query(newUserQuery, values);
        const newUser = result.rows[0];
        
        
        // Create a token and send it back as a JSON response, just like in the login function.
        const payload = { user: { id: newUser.id } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.status(201).json({ token });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        const payload = { user: { id: user.id } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token, userId: user.id });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

export const getLoggedInUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const userQuery = 'SELECT id, name, email, domain, score FROM users WHERE id = $1';
        const userResult = await db.query(userQuery, [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(userResult.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};