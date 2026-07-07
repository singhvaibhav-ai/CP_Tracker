export type TaskType = 'Video' | 'Problem';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  isCompleted: boolean;
  moduleName: string;
  updatedAt?: string | null;
}

export interface CourseDay {
  dayNumber: number;
  date: string; // YYYY-MM-DD
  lectures: Task[];
  problems: Task[];
}

export interface DailyLog {
  id: string; // YYYY-MM-DD
  tasksCompleted: number;
}

export interface TrackerStore {
  courseDays: CourseDay[];
  dailyLogs: Record<string, DailyLog>;
  collapsedItems: string[];
  toggleTask: (dayNumber: number, taskId: string, type: 'lectures' | 'problems') => void;
  getOverallProgress: () => number;
  getLevelProgress: (startDay: number, endDay: number) => { percentage: number; completed: number; total: number };
  toggleCollapse: (id: string) => void;
  initHydration: () => Promise<void>;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  paceMode: 'adaptive' | 'calendar';
  setPaceMode: (mode: 'adaptive' | 'calendar') => void;
  userName: string;
  setUserName: (name: string) => void;
}
