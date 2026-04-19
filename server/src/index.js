import cors from 'cors';
import express from 'express';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './config/db.js';
import env from './config/env.js';
import authRoutes from './routes/auth.js';
import fileRoutes from './routes/files.js';
import pageRoutes from './routes/pages.js';
import replayRoutes from './routes/replays.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const hasBuiltClient = existsSync(path.join(clientDistPath, 'index.html'));

app.use(
    cors({
        origin: env.corsOrigin,
        credentials: true,
    }),
);
app.use(express.json());

app.get('/api/health', async (_request, response) => {
    try {
        await pool.query('SELECT 1');
        response.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        response.status(500).json({ status: 'error', database: 'disconnected', detail: error.message });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/replays', replayRoutes);

if (hasBuiltClient) {
    app.use(express.static(clientDistPath));

    app.get(/^(?!\/api).*/, (_request, response) => {
        response.sendFile(path.join(clientDistPath, 'index.html'));
    });
} else {
    app.get('/', (_request, response) => {
        response.redirect(env.corsOrigin);
    });

    app.get(/^(?!\/api).*/, (request, response) => {
        response.redirect(`${env.corsOrigin}${request.originalUrl}`);
    });
}

app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
});