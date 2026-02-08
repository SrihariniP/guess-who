
export enum GameStatus {
  IDLE = 'IDLE',
  INITIALIZING = 'INITIALIZING',
  PLAYING = 'PLAYING',
  GUESSING = 'GUESSING',
  WON = 'WON',
  LOST = 'LOST'
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  type: 'question' | 'answer' | 'guess' | 'system';
}

export interface GameState {
  status: GameStatus;
  questionsRemaining: number;
  history: Message[];
  secretIdentity?: string;
}

export interface AIResponse {
  answer: string;
  isCorrect?: boolean;
  revealedName?: string;
  feedback?: string;
}
