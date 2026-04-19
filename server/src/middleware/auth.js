import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export function authenticateToken(request, response, next) {
    const [scheme, token] = (request.headers.authorization || '').split(' ');

    if (scheme !== 'Bearer' || !token) {
        return response.status(401).json({ message: '未登录或登录已过期' });
    }

    try {
        request.user = jwt.verify(token, env.jwtSecret);
        return next();
    } catch {
        return response.status(401).json({ message: '登录凭证无效，请重新登录' });
    }
}