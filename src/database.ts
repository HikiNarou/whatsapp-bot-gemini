import mysql, { RowDataPacket } from 'mysql2/promise';
import { dbConfig } from './config';
import { QuizQuestion } from './types'; // Pastikan Anda memiliki definisi tipe QuizQuestion

let pool: mysql.Pool | null = null;

export const initializeDatabase = async () => {
    try {
        pool = mysql.createPool(dbConfig);
        console.log('Database pool initialized.');
    } catch (error: any) {
        console.error('Error initializing database pool:', error);
        throw new Error('Failed to initialize database pool');
    }
};

export const getConnection = async () => {
    if (!pool) {
        await initializeDatabase();
    }
    try {
        return await pool!.getConnection();
    } catch (error: any) {
        console.error('Error getting database connection:', error);
        throw new Error('Failed to get database connection');
    }
};

export const query = async <T extends RowDataPacket>(sql: string, values?: any[]): Promise<T[]> => {
    const connection = await getConnection();
    try {
        const [results] = await connection.execute<T[]>(sql, values);
        return results;
    } catch (error: any) {
        console.error('Error executing database query:', error);
        throw new Error(`Database query failed: ${error.message}`);
    } finally {
        connection.release();
    }
};

// Definisi tipe yang lebih spesifik untuk hasil query fetchQuizQuestions
interface QuizQuestionRow extends RowDataPacket {
    id: number;
    question: string;
    options: string; // Data dari database adalah string JSON
    correctAnswer: string;
    category: string;
}

// Fungsi untuk mengambil soal kuis dengan tipe data yang lebih spesifik
export const fetchQuizQuestions = async (category: string, limit: number): Promise<QuizQuestion[]> => {
    const sql = 'SELECT id, question, JSON_EXTRACT(options, "$") as options, correct_answer as correctAnswer, category FROM quizzes WHERE category = ? ORDER BY RAND() LIMIT ?';
    try {
        const results = await query<QuizQuestionRow>(sql, [category, limit]);
        return results.map(row => ({
            id: row.id,
            question: row.question,
            options: JSON.parse(row.options),
            correctAnswer: row.correctAnswer,
            category: row.category,
        }));
    } catch (error: any) {
        console.error('Error fetching quiz questions:', error);
        throw new Error(`Failed to fetch quiz questions: ${error.message}`);
    }
};

// Contoh fungsi untuk menyimpan skor (perlu diimplementasikan sesuai kebutuhan)
export const saveUserScore = async (userId: string, score: number): Promise<void> => {
    const sql = 'INSERT INTO user_scores (user_id, score, last_activity) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE score = ?, last_activity = NOW()';
    try {
        await query(sql, [userId, score, score]);
        console.log(`Score for user ${userId} saved successfully.`);
    } catch (error: any) {
        console.error('Error saving user score:', error);
        throw new Error(`Failed to save user score: ${error.message}`);
    }
};

// Contoh fungsi untuk mengambil data pengguna (perlu diimplementasikan sesuai kebutuhan)
export const getUserData = async (userId: string): Promise<any> => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    try {
        const results = await query(sql, [userId]);
        return results[0]; // Mengembalikan data pengguna pertama jika ditemukan
    } catch (error: any) {
        console.error('Error fetching user data:', error);
        throw new Error(`Failed to fetch user data: ${error.message}`);
    }
};

// ... tambahkan fungsi lain sesuai kebutuhan