import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3000;
const PREFIX = process.env.API_PREFIX || 'api';

export const authConfig = { 
    PORT: PORT as string,
    PREFIX: PREFIX as string,

};
