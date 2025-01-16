import { generateResponse, generateQuizQuestion } from './aiService';
import { QuizQuestion, GameState, GameType } from './types';
import { fetchQuizQuestions } from './database';

const activeGames: Map<string, GameState> = new Map();
const QUIZ_QUESTION_LIMIT = 10;
const QUIZ_TIME_LIMIT = 20000; // 20 detik

const startGame = (userId: string, gameType: GameType): GameState => {
  const newGame: GameState = {
    userId,
    gameType,
    currentQuestionIndex: 0,
    questions: [],
    score: 0,
    startTime: new Date(),
  };
  activeGames.set(userId, newGame);
  return newGame;
};

export const handleQuizCommand = async (userId: string, message: string): Promise<string> => {
  let gameState = activeGames.get(userId);

  if (!gameState || gameState.gameType !== GameType.QUIZ) {
    const availableCategories = ['Negara', 'Tokoh Terkenal', 'Film'];
    return `Selamat datang di Kuis! Silakan pilih kategori kuis dengan mengetik: .kuis <nama_kategori> (contoh: .kuis Negara)`;
  }

  if (gameState.questions.length === 0) {
    const category = message.trim();
    const questions = await fetchQuizQuestions(category, QUIZ_QUESTION_LIMIT);
    if (questions.length === 0) {
      return `Maaf, tidak ada soal kuis untuk kategori ${category}.`;
    }
    gameState.questions = questions;
    gameState.currentQuestionIndex = 0;
    activeGames.set(userId, gameState);
    return displayQuestion(userId);
  }

  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
  if (!currentQuestion) {
    return `Kuis telah berakhir. Skor Anda: ${gameState.score} dari ${gameState.questions.length}.`;
  }

  const answer = message.trim().toUpperCase();
  const correctAnswer = currentQuestion.correctAnswer.toUpperCase();

  if (answer === correctAnswer) {
    gameState.score++;
    gameState.currentQuestionIndex++;
    activeGames.set(userId, gameState);
    if (gameState.currentQuestionIndex < gameState.questions.length) {
      return `Benar! ${displayQuestion(userId)}`;
    } else {
      activeGames.delete(userId);
      return `Kuis selesai! Skor akhir Anda: ${gameState.score} dari ${gameState.questions.length}.`;
    }
  } else {
    gameState.currentQuestionIndex++;
    activeGames.set(userId, gameState);
    if (gameState.currentQuestionIndex < gameState.questions.length) {
      return `Salah. Jawaban yang benar adalah ${currentQuestion.correctAnswer}. ${displayQuestion(userId)}`;
    } else {
      activeGames.delete(userId);
      return `Kuis selesai! Skor akhir Anda: ${gameState.score} dari ${gameState.questions.length}.`;
    }
  }
};

const displayQuestion = (userId: string): string => {
  const gameState = activeGames.get(userId);
  if (!gameState || !gameState.questions[gameState.currentQuestionIndex]) {
    return 'Terjadi kesalahan dalam kuis.';
  }
  const question = gameState.questions[gameState.currentQuestionIndex];
  return `Soal ${gameState.currentQuestionIndex + 1}/${gameState.questions.length}:\n${question.question}\n${question.options.map((opt, index) => `${String.fromCharCode(65 + index)}) ${opt}`).join('\n')}`;
};

export const handleMathCommand = async (userId: string, message: string): Promise<string> => {
  return 'Fitur matematika sedang dalam pengembangan.';
};

export const handleTebakKataCommand = async (userId: string, message: string): Promise<string> => {
  return 'Fitur tebak kata sedang dalam pengembangan.';
};

export const handleGenerateQuizCommand = async (topic: string): Promise<string> => {
  return generateQuizQuestion(topic);
};