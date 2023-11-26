import dotenv from 'dotenv';
dotenv.config();


const MONGO_URI = process.env.MONGO_URI;

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