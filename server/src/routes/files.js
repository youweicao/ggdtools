import express from 'express';
import { createReadStream, existsSync, unlinkSync } from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, '../../../data/uploads');

// Auto-create table if not exists
await pool.execute(`
    CREATE TABLE IF NOT EXISTS \`files\` (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        original_name VARCHAR(255) NOT NULL,
        stored_name   VARCHAR(255) NOT NULL,
        mime_type     VARCHAR(100),
        size          BIGINT,
        description   TEXT,
        created_at    DATETIME DEFAULT NOW()
    )
`);

const storage = multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

// GET /api/files — list
router.get('/', authenticateToken, async (_req, res) => {
    const [rows] = await pool.execute(
        'SELECT id, original_name, mime_type, size, description, created_at FROM `files` ORDER BY created_at DESC',
    );
    res.json(rows);
});

// POST /api/files — upload
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: '请选择要上传的文件' });
    const { description } = req.body;
    const [{ insertId }] = await pool.execute(
        'INSERT INTO `files` (original_name, stored_name, mime_type, size, description) VALUES (?, ?, ?, ?, ?)',
        [
            req.file.originalname,
            req.file.filename,
            req.file.mimetype,
            req.file.size,
            description || null,
        ],
    );
    const [rows] = await pool.execute('SELECT * FROM `files` WHERE id = ?', [insertId]);
    res.status(201).json(rows[0]);
});

// PATCH /api/files/:id — update description only
router.patch('/:id', authenticateToken, async (req, res) => {
    const [existing] = await pool.execute('SELECT id FROM `files` WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ message: '文件不存在' });
    const { description } = req.body;
    await pool.execute('UPDATE `files` SET description = ? WHERE id = ?', [description ?? null, req.params.id]);
    const [rows] = await pool.execute('SELECT * FROM `files` WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
});

// GET /api/files/:id/download — download
router.get('/:id/download', authenticateToken, async (req, res) => {
    const [rows] = await pool.execute('SELECT * FROM `files` WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: '文件不存在' });
    const file = rows[0];
    const fullPath = path.join(UPLOAD_DIR, file.stored_name);
    if (!existsSync(fullPath)) return res.status(404).json({ message: '文件已从磁盘删除' });
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(file.original_name)}`);
    res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
    createReadStream(fullPath).pipe(res);
});

// DELETE /api/files/:id — remove record + file
router.delete('/:id', authenticateToken, async (req, res) => {
    const [rows] = await pool.execute('SELECT * FROM `files` WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: '文件不存在' });
    const fullPath = path.join(UPLOAD_DIR, rows[0].stored_name);
    if (existsSync(fullPath)) unlinkSync(fullPath);
    await pool.execute('DELETE FROM `files` WHERE id = ?', [req.params.id]);
    res.json({ message: '删除成功' });
});

export default router;
