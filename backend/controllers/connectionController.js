import db from '../config/db.js';

export const sendConnectionRequest = async (req, res) => {
    const requesterId = req.user.id;
    const receiverId = req.params.id;
    try {
        // This query attempts to INSERT a new request.
        // If it fails because the row already exists (e.g., it was 'rejected'),
        // it will then UPDATE that existing row's status back to 'pending'.
        const query = `
            INSERT INTO connections (requester_id, receiver_id, status)
            VALUES ($1, $2, 'pending')
            ON CONFLICT (requester_id, receiver_id)
            DO UPDATE SET status = 'pending', created_at = NOW()
        `;
        
        await db.query(query, [requesterId, receiverId]);

        res.status(200).json({ msg: 'Connection request sent or re-sent.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const getPendingRequests = async (req, res) => {
    try {
        const query = `
            SELECT u.id, u.name, u.domain, c.requester_id FROM connections c
            JOIN users u ON u.id = c.requester_id
            WHERE c.receiver_id = $1 AND c.status = 'pending'`;
        const requests = await db.query(query, [req.user.id]);
        res.json(requests.rows);
    } catch (err) { res.status(500).send('Server Error'); }
};

export const respondToRequest = async (req, res) => {
    const { status } = req.body;
    const requesterId = req.params.requesterId;
    const receiverId = req.user.id;
    try {
        const query = `UPDATE connections SET status = $1 WHERE requester_id = $2 AND receiver_id = $3`;
        await db.query(query, [status, requesterId, receiverId]);
        res.json({ msg: `Request ${status}.` });
    } catch (err) { res.status(500).send('Server Error'); }
};

export const disconnect = async (req, res) => {
    const userId1 = req.user.id;
    const userId2 = req.params.id;
    try {
        const query = `DELETE FROM connections WHERE (requester_id = $1 AND receiver_id = $2) OR (requester_id = $2 AND receiver_id = $1)`;
        await db.query(query, [userId1, userId2]);
        res.json({ msg: 'User disconnected.' });
    } catch (err) { res.status(500).send('Server Error'); }
};