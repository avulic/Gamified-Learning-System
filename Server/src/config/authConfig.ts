import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE;
const JWT_ISSUER = process.env.JWT_ISSUER;

export const authConfig = { 
    JWT_SECRET: JWT_SECRET as string,
    JWT_EXPIRATION: JWT_EXPIRATION as string,
    JWT_AUDIENCE: JWT_AUDIENCE as string,
    JWT_ISSUER: JWT_ISSUER as string
};




