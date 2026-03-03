export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  owner: User;
  assignedTo: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  highPriority: number;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
