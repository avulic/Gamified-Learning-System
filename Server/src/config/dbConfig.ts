import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });


const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test';

// Configuration for MongoDB
export const mongoConfig = {
    url:  MONGO_URI as string
};

// Configuration for SQL (e.g., MySQL)
export const sqlConfig = {
    host: 'localhost',
    port: 3306,
    user: 'your-sql-username',
    password: 'your-sql-password',
    database: 'your-sql-database',
};