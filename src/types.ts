export type Role = 'user' | 'model';

export interface ImageAttachment {
  mimeType: string;
  data: string; // base64 without prefix
  url?: string; // data URL for rendering in client
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  images?: ImageAttachment[];
  timestamp: number;
  groundingSources?: GroundingSource[];
  isStreaming?: boolean;
  isError?: boolean;
  modeUsed?: string;
}

export type UserLevel = 'beginner' | 'expert';
export type AnswerMode = 'auto' | 'qa' | 'product' | 'technical';

export interface UserSettings {
  level: UserLevel;
  mode: AnswerMode;
  enableSearch: boolean;
  selectedModel: 'gemini-3.6-flash' | 'gemini-3.1-pro-preview';
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  settings: UserSettings;
}
