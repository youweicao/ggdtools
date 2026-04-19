import dotenv from 'dotenv';

dotenv.config();

function readBoolean(value, fallback = false) {
    if (value === undefined) {
        return fallback;
    }

    return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function assertIdentifier(identifier, label) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
        throw new Error(`${label} 配置不合法: ${identifier}`);
    }

    return identifier;
}

const env = {
    port: Number(process.env.PORT || 3000),
    jwtSecret: process.env.JWT_SECRET || 'replace-with-a-strong-secret',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    db: {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ggdtools',
    },
    auth: {
        table: assertIdentifier(process.env.AUTH_TABLE || 'user', 'AUTH_TABLE'),
        idField: assertIdentifier(process.env.AUTH_ID_FIELD || 'id', 'AUTH_ID_FIELD'),
        usernameField: assertIdentifier(
            process.env.AUTH_USERNAME_FIELD || 'name',
            'AUTH_USERNAME_FIELD',
        ),
        passwordField: assertIdentifier(
            process.env.AUTH_PASSWORD_FIELD || 'password',
            'AUTH_PASSWORD_FIELD',
        ),
        displayField: assertIdentifier(
            process.env.AUTH_DISPLAY_FIELD || 'name',
            'AUTH_DISPLAY_FIELD',
        ),
        passwordHashed: readBoolean(process.env.AUTH_PASSWORD_HASHED, false),
    },
};

export default env;