import dotenv from 'dotenv';
dotenv.config();

export const geminiApiKey = process.env.GEMINI_API_KEY;
export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

if (!geminiApiKey || !dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
  throw new Error('Missing environment variables. Please check your .env file.');
}