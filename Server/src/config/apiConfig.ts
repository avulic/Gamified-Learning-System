import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 4000;
const PREFIX = process.env.API_PREFIX || 'api';

export const apiConfig = { 
    PORT: PORT as string,
    PREFIX: PREFIX as string,

};
