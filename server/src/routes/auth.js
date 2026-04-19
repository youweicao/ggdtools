import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import env from '../config/env.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

function wrapIdentifier(identifier) {
    return `\`${identifier}\``;
}

function uniqueFields(...fields) {
    return [...new Set(fields.filter(Boolean))];
}

function toSessionUser(row) {
    return {
        id: row[env.auth.idField],
        username: row[env.auth.usernameField],
        displayName: row[env.auth.displayField] || row[env.auth.usernameField],
    };
}

router.post('/login', async (request, response) => {
    const { username, password } = request.body || {};

    if (!username || !password) {
        return response.status(400).json({ message: '用户名和密码不能为空' });
    }

    const selectFields = uniqueFields(
        env.auth.idField,
        env.auth.usernameField,
        env.auth.passwordField,
        env.auth.displayField,
    );

    const sql = `
    SELECT ${selectFields.map(wrapIdentifier).join(', ')}
    FROM ${wrapIdentifier(env.auth.table)}
    WHERE ${wrapIdentifier(env.auth.usernameField)} = ?
    LIMIT 1
  `;

    try {
        const [rows] = await pool.execute(sql, [username]);
        const user = rows[0];

        if (!user) {
            return response.status(401).json({ message: '用户名或密码错误' });
        }

        const storedPassword = String(user[env.auth.passwordField] || '');
        const validPassword = env.auth.passwordHashed
            ? await bcrypt.compare(password, storedPassword)
            : password === storedPassword;

        if (!validPassword) {
            return response.status(401).json({ message: '用户名或密码错误' });
        }

        const sessionUser = toSessionUser(user);
        const token = jwt.sign(sessionUser, env.jwtSecret, { expiresIn: '7d' });

        return response.json({ token, user: sessionUser });
    } catch (error) {
        return response.status(500).json({
            message: '登录失败，请检查数据库配置或数据表字段映射',
            detail: error.message,
        });
    }
});

router.get('/me', authenticateToken, async (request, response) => response.json({ user: request.user }));

export default router;