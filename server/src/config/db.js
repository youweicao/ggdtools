import mysql from 'mysql2/promise';
import env from './env.js';

const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'admin',
    password: 'mysql',
    database: 'ggdtools',
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
});

export default pool;