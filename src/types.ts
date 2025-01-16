export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: string;
    category: string;
  }
  
  export interface UserScore {
    userId: string;
    score: number;
    lastActivity: Date;
  }
  
  export enum GameType {
    QUIZ = 'quiz',
    MATH = 'math',
    TEBAK_KATA = 'tebak_kata',
    // ... tambahkan jenis game lainnya
  }
  
  export interface GameState {
    userId: string;
    gameType: GameType | null;
    currentQuestionIndex: number;
    questions: QuizQuestion[];
    score: number;
    startTime: Date | null;
    // ... tambahkan properti lain sesuai kebutuhan game
  }
  
  // ... tambahkan definisi tipe data lainnya sesuai kebutuhan