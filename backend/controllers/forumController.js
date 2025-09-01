import db from '../config/db.js';

export const askQuestion = async (req, res) => {
    const { title, body } = req.body;
    const userId = req.user.id;
    try {
        const newQuestionQuery = 'INSERT INTO questions (user_id, title, body) VALUES ($1, $2, $3) RETURNING id';
        const result = await db.query(newQuestionQuery, [userId, title, body]);
        await db.query('UPDATE users SET score = score + 2 WHERE id = $1', [userId]);
        res.status(201).json({ msg: 'Question posted successfully!', questionId: result.rows[0].id });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const getAllQuestions = async (req, res) => {
    try {
        const query = `SELECT q.id, q.title, q.body, u.name as author_name FROM questions q JOIN users u ON q.user_id = u.id ORDER BY q.created_at DESC`;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

export const getQuestionById = async (req, res) => {
    try {
        const { questionId } = req.params;
        const userId = req.user.id;
        const qQuery = `SELECT q.*, u.name as author_name FROM questions q JOIN users u ON q.user_id = u.id WHERE q.id = $1`;
        const aQuery = `SELECT a.*, u.name as author_name FROM answers a JOIN users u ON a.user_id = u.id WHERE a.question_id = $1 ORDER BY a.is_best_answer DESC, a.created_at ASC`;
        const questionRes = await db.query(qQuery, [questionId]);
        const answersRes = await db.query(aQuery, [questionId]);
        if (questionRes.rows.length === 0) {
            return res.status(404).json({ msg: 'Question not found' });
        }
        const question = questionRes.rows[0];
        const isAsker = question.user_id === userId;
        res.json({ question, answers: answersRes.rows, isAsker });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

export const postAnswer = async (req, res) => {
    const { questionId } = req.params;
    const { body } = req.body;
    const userId = req.user.id;
    try {
        await db.query('INSERT INTO answers (question_id, user_id, body) VALUES ($1, $2, $3)', [questionId, userId, body]);
        await db.query('UPDATE users SET score = score + 5 WHERE id = $1', [userId]);
        res.status(201).json({ msg: 'Answer posted successfully and points awarded.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const acceptAnswer = async (req, res) => {
    const { answerId } = req.params;
    const questionAskerId = req.user.id;
    try {
        const answerQuery = `SELECT a.id, a.user_id as answerer_id, q.user_id as asker_id FROM answers a JOIN questions q ON a.question_id = q.id WHERE a.id = $1`;
        const answerResult = await db.query(answerQuery, [answerId]);
        const answerData = answerResult.rows[0];
        if (!answerData || answerData.asker_id !== questionAskerId) {
            return res.status(401).json({ msg: 'Not authorized to accept this answer.' });
        }
        await db.query('UPDATE answers SET is_best_answer = true WHERE id = $1', [answerId]);
        await db.query('UPDATE users SET score = score + 25 WHERE id = $1', [answerData.answerer_id]);
        res.json({ msg: 'Answer accepted and bonus points awarded.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};