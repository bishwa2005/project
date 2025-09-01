import db from '../config/db.js';

export const getAllUsers = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const { name, domain } = req.query;
        let baseQuery = `
            SELECT 
                u.id, u.name, u.domain, u.bio, u.skills, u.profile_picture, -- Add this
                c.status,
                CASE
                    WHEN c.requester_id = $1 THEN 'sent'
                    WHEN c.receiver_id = $1 THEN 'received'
                    ELSE NULL
                END as request_direction
            FROM users u
            LEFT JOIN connections c ON 
                (c.requester_id = $1 AND c.receiver_id = u.id) OR 
                (c.requester_id = u.id AND c.receiver_id = $1)
        `;
        const params = [loggedInUserId];
        const whereClauses = ['u.id != $1'];

        if (name) {
            params.push(`%${name}%`);
            whereClauses.push(`u.name ILIKE $${params.length}`);
        }
        if (domain) {
            params.push(domain);
            whereClauses.push(`u.domain = $${params.length}`);
        }
        
        baseQuery += ' WHERE ' + whereClauses.join(' AND ');
        
        const users = await db.query(baseQuery, params);
        res.json(users.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const getLeaderboard = async (req, res) => {
    try {
        const leaderboardQuery = `
            SELECT id, name, domain, score, RANK() OVER (ORDER BY score DESC) as rank 
            FROM users 
            LIMIT 10`;
        const leaderboard = await db.query(leaderboardQuery);
        res.json(leaderboard.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const getConnections = async (req, res) => {
    try {
        const query = `
            SELECT u.id, u.name, u.domain FROM users u
            JOIN connections c ON (u.id = c.receiver_id OR u.id = c.requester_id)
            WHERE (c.requester_id = $1 OR c.receiver_id = $1) AND c.status = 'accepted' AND u.id != $1
        `;
        const connections = await db.query(query, [req.user.id]);
        res.json(connections.rows);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

export const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const userResult = await db.query('SELECT id, name, email, domain, skills, bio, score FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(userResult.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};