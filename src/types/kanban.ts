export type TaskStatus = 'backlog' | 'not-started' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export const INITIAL_COLUMNS: Column[] = [
  { id: 'backlog', title: 'Backlog', tasks: [] },
  { id: 'not-started', title: 'Not Started', tasks: [] },
  { id: 'in-progress', title: 'In Progress', tasks: [] },
  { id: 'done', title: 'Done', tasks: [] },
];

export const STATUS_COLORS: Record<TaskStatus, string> = {
  'backlog': 'status-backlog',
  'not-started': 'status-not-started',
  'in-progress': 'status-in-progress',
  'done': 'status-done',
};