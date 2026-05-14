export interface Project {
  id: string;
  name: string;
  description: string;
  worldBackground: string;
  createdAt: string;
  updatedAt: string;
  outline: OutlineEvent[];
  scenes: Scene[];
  dailyEvents: DailyEvent[];
  knowledgeBase: KnowledgeFile[];
  settings: ProjectSettings;
}

export interface OutlineEvent {
  id: string;
  name: string;
  type: 'major' | 'minor';
  subEvents: SubEvent[];
}

export interface SubEvent {
  id: string;
  name: string;
  type: 'battle' | 'plot' | 'daily' | 'other';
  description?: string;
}

export interface Scene {
  id: string;
  eventId: string;
  title: string;
  time: string;
  location: string;
  characters: string[];
  coreEvent: string;
  forbidden: string;
  wordCount: number;
  sensoryRequirements: string[];
  knowledgeBaseRefs: string[];
  prompt: string;
  content: string;
  status: 'draft' | 'completed';
}

export interface DailyEvent {
  id: string;
  name: string;
  category: 'loot' | 'cultivation' | 'social' | 'explore' | 'custom';
  template: string;
  description: string;
}

export interface KnowledgeFile {
  id: string;
  name: string;
  path: string;
  content: string;
}

export interface ProjectSettings {
  defaultApiId: string;
  defaultStyleId: string;
}

export interface WritingStyle {
  id: string;
  name: string;
  description: string;
  isPreset: boolean;
  keywords: string[];
  prompt: string;
}

export interface ApiConfig {
  id: string;
  name: string;
  format: 'openai' | 'anthropic';
  baseUrl: string;
  apiKey: string;
  model: string;
  isDefault: boolean;
}

export interface AgentServerStatus {
  running: boolean;
  port: number;
  logs: AgentLog[];
}

export interface AgentLog {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  status: number;
  duration: number;
}
