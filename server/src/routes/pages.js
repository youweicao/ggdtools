import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const sectionMap = {
    user: '用户管理页',
    game: '游戏管理页',
    details: '详情数据页',
};

router.get('/:section/:id', authenticateToken, (request, response) => {
    const { section, id } = request.params;

    if (!sectionMap[section]) {
        return response.status(404).json({ message: '页面类型不存在' });
    }

    return response.json({
        meta: {
            section,
            id,
            description: `${sectionMap[section]}已通过服务端鉴权`,
        },
        payload: {
            route: `/${section}/${id}`,
            requestedAt: new Date().toISOString(),
            currentUser: request.user,
        },
    });
});

export default router;