export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  level: number;
  xp: number;
  gold: number;
  currentLevelXp?: number;
  nextLevelXp?: number;
}

export interface Quest {
  id: number;
  user_id: number;
  title: string;
  category: 'game' | 'code' | 'workout' | 'study' | 'habit';
  difficulty: 'easy' | 'medium' | 'boss';
  xp_reward: number;
  gold_reward: number;
  status: 'todo' | 'completed';
  due_date?: string;
  created_at: string;
}

export interface StatsResponse {
  user: User;
  totalQuests: number;
  completedQuests: number;
  todoQuests: number;
}
