import express from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/replays — list all
router.get('/', authenticateToken, async (_req, res) => {
    const [rows] = await pool.execute(
        'SELECT id, title, notes, players, result, created_at, updated_at FROM `replay` ORDER BY updated_at DESC',
    );
    return res.json(rows);
});

// GET /api/replays/:id — single (includes file_data)
router.get('/:id', authenticateToken, async (req, res) => {
    const [rows] = await pool.execute('SELECT * FROM `replay` WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: '对局记录不存在' });
    return res.json(rows[0]);
});

// POST /api/replays — create
router.post('/', authenticateToken, async (req, res) => {
    const { title, notes, players, result, file_data } = req.body || {};
    if (!title || !String(title).trim()) {
        return res.status(400).json({ message: '对局标题不能为空' });
    }
    const [{ insertId }] = await pool.execute(
        'INSERT INTO `replay` (title, notes, players, result, file_data) VALUES (?, ?, ?, ?, ?)',
        [
            String(title).trim(),
            notes || null,
            players ? JSON.stringify(players) : null,
            result || null,
            file_data || null,
        ],
    );
    const [rows] = await pool.execute('SELECT * FROM `replay` WHERE id = ?', [insertId]);
    return res.status(201).json(rows[0]);
});

// PUT /api/replays/:id — update
router.put('/:id', authenticateToken, async (req, res) => {
    const [existing] = await pool.execute('SELECT id FROM `replay` WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ message: '对局记录不存在' });

    const { title, notes, players, result, file_data } = req.body || {};
    if (title !== undefined && !String(title).trim()) {
        return res.status(400).json({ message: '对局标题不能为空' });
    }

    const fields = [];
    const values = [];
    if (title !== undefined) { fields.push('title = ?'); values.push(String(title).trim()); }
    if (notes !== undefined) { fields.push('notes = ?'); values.push(notes); }
    if (players !== undefined) { fields.push('players = ?'); values.push(JSON.stringify(players)); }
    if (result !== undefined) { fields.push('result = ?'); values.push(result); }
    if (file_data !== undefined) { fields.push('file_data = ?'); values.push(file_data); }

    if (fields.length) {
        values.push(req.params.id);
        await pool.execute(`UPDATE \`replay\` SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    const [rows] = await pool.execute('SELECT * FROM `replay` WHERE id = ?', [req.params.id]);
    return res.json(rows[0]);
});

// DELETE /api/replays/:id — remove
router.delete('/:id', authenticateToken, async (req, res) => {
    const [existing] = await pool.execute('SELECT id FROM `replay` WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ message: '对局记录不存在' });
    await pool.execute('DELETE FROM `replay` WHERE id = ?', [req.params.id]);
    return res.json({ message: '删除成功' });
});

export default router;
