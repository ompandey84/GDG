// =============================================
// AI Cricket Quiz Battle — TypeScript Types
// =============================================

export type RoomStatus = 'waiting' | 'starting' | 'playing' | 'reviewing' | 'finished';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';

export interface Room {
  id: string;
  room_code: string;
  host_id: string;
  status: RoomStatus;
  current_question_index: number;
  total_questions: number;
  time_per_question: number;
  difficulty: Difficulty;
  question_timer_end: string | null;
  started_at: string | null;
  created_at: string;
}

export interface Player {
  id: string;
  room_id: string;
  username: string;
  avatar_seed: string | null;
  score: number;
  streak: number;
  is_ready: boolean;
  is_host: boolean;
  joined_at: string;
}

export interface Question {
  id: string;
  room_id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_order: number;
  created_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  player_id: string;
  selected_answer: string | null;
  time_taken: number | null;
  is_correct: boolean | null;
  points_awarded: number;
  answered_at: string;
}

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: string;
}

export interface GameState {
  room: Room | null;
  players: Player[];
  questions: Question[];
  currentQuestion: Question | null;
  currentPlayer: Player | null;
  answers: Answer[];
  notifications: GameNotification[];
}

export interface GameNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

export interface ScoreResult {
  points: number;
  label: string;
  emoji: string;
  description: string;
}
