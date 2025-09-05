import db from '../config/db.js';
import bcrypt from 'bcryptjs';

export const getProfileById = async (req, res) => {
    try {
        const userId = req.params.id;
        const userQuery = 'SELECT id, name, email, domain, bio, skills, linkedin_url, leetcode_url, codeforces_url, codechef_url, whatsapp_number, x_url, score, profile_picture FROM users WHERE id = $1';
        const projectsQuery = 'SELECT * FROM projects WHERE user_id = $1 ORDER BY is_current DESC, created_at DESC';
        const connectionsQuery = 'SELECT COUNT(*) FROM connections WHERE (requester_id = $1 OR receiver_id = $1) AND status = \'accepted\'';
        const rankQuery = `WITH UserRanks AS (SELECT id, RANK() OVER (ORDER BY score DESC) as rank FROM users) SELECT rank FROM UserRanks WHERE id = $1`;

        const [userResult, projectsResult, connectionsResult, rankResult] = await Promise.all([
            db.query(userQuery, [userId]),
            db.query(projectsQuery, [userId]),
            db.query(connectionsQuery, [userId]),
            db.query(rankQuery, [userId])
        ]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }
        const profile = {
            user: userResult.rows[0],
            projects: projectsResult.rows,
            connections: parseInt(connectionsResult.rows[0].count, 10),
            rank: rankResult.rows.length > 0 ? parseInt(rankResult.rows[0].rank, 10) : 'N/A'
        };
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const updateMyProfile = async (req, res) => {
    try {
        const { bio, skills, linkedin_url, leetcode_url, codeforces_url, codechef_url, whatsapp_number, x_url } = req.body;
        const userId = req.user.id;

        const query = `UPDATE users 
                       SET bio = $1, skills = $2, linkedin_url = $3, leetcode_url = $4, codeforces_url = $5, codechef_url = $6, whatsapp_number = $7, x_url = $8
                       WHERE id = $9`;
        
        await db.query(query, [bio, skills, linkedin_url, leetcode_url, codeforces_url, codechef_url, whatsapp_number, x_url, userId]);
        res.json({ msg: 'Profile updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const addProject = async (req, res) => {
    try {
        const { title, description, project_url, is_current } = req.body;
        const userId = req.user.id;
        if (!userId || typeof userId !== 'number') {
            return res.status(401).json({ msg: 'Authorization error, user ID is invalid.' });
        }
        const query = `INSERT INTO projects (user_id, title, description, project_url, is_current)
                       VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        
        const result = await db.query(query, [userId, title, description, project_url, is_current]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error in addProject:', err.message);
        res.status(500).send('Server Error');
    }
};

export const deleteProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const userId = req.user.id;
        const deleteQuery = 'DELETE FROM projects WHERE id = $1 AND user_id = $2';
        const result = await db.query(deleteQuery, [projectId, userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'Project not found or user not authorized.' });
        }
        res.json({ msg: 'Project deleted.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ msg: 'No file uploaded.' });
    }
    const fileUrl = req.file.path; // Cloudinary gives a hosted URL
    const userId = req.user.id;

    const query = `UPDATE users SET profile_picture = $1 WHERE id = $2 RETURNING profile_picture`;
    const result = await db.query(query, [fileUrl, userId]);

    res.json({
      msg: 'Profile photo updated successfully.',
      fileUrl: result.rows[0].profile_picture
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export const updateCredentials = async (req, res) => {
    const { currentPassword, newEmail, newPassword } = req.body;
    const userId = req.user.id;
    try {
        const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Current password is incorrect.' });
        }
        const emailToUpdate = newEmail || user.email;
        let passwordToUpdate = user.password;
        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            passwordToUpdate = await bcrypt.hash(newPassword, salt);
        }
        const query = `UPDATE users SET email = $1, password = $2 WHERE id = $3`;
        await db.query(query, [emailToUpdate, passwordToUpdate, userId]);
        res.json({ msg: 'Credentials updated successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};