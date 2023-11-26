import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const authConfig = { 
    JWT_SECRET: JWT_SECRET as string
};