export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
}

export interface GameHistoryEntry {
  date: string;
  correctPlayer: string;
  guesses: string[];
  timeTaken: number;
  won: boolean;
  difficulty: Difficulty;
}

export interface User {
  username: string;
  stats: UserStats;
  history: GameHistoryEntry[];
}

export interface PlayerStats {
    batting?: {
        runs?: number;
        highScore?: string;
        average?: number;
        centuries?: number;
        fifties?: number;
    };
    bowling?: {
        wickets?: number;
        bestFigures?: string;
        average?: number;
        economy?: number;
    };
}

export interface DailyPuzzle {
  playerName: string;
  clues: string[];
  stats: PlayerStats;
}