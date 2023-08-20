const { MONGO_URI } = process.env;

// Configuration for MongoDB
export const mongoConfig = {
    url:  'mongodb://127.0.0.1:27017/test',
};

// Configuration for SQL (e.g., MySQL)
export const sqlConfig = {
    host: 'localhost',
    port: 3306,
    user: 'your-sql-username',
    password: 'your-sql-password',
    database: 'your-sql-database',
};