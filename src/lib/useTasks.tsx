import React, { useState, useEffect, useContext } from 'react';

export interface Task {
  id: string;
  date: string; // canonical single date (start if range)
  startDate?: string;
  endDate?: string;
  name: string;
  category: 'todo' | 'progress' | 'review' | 'completed';
  description?: string;
  createdAt: string;
}

export interface TaskFilters {
  categories: ('todo' | 'progress' | 'review' | 'completed')[];
  timeWindow: 'all' | '1week' | '2weeks' | '3weeks';
  searchQuery: string;
}

const TASKS_STORAGE_KEY = 'calendar-tasks';

interface TasksStore {
  tasks: Task[];
  addTask: (taskData: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  clearAllTasks: () => void;
  getTasksByDate: (date: Date) => Task[];
  getFilteredTasks: () => Task[];
  filters: TaskFilters;
  updateFilters: (newFilters: Partial<TaskFilters>) => void;
  resetFilters: () => void;
}

const TasksContext = React.createContext<TasksStore | null>(null);

// Custom hook holding the shared tasks state
function useTasksStore(): TasksStore {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({
    categories: ['todo', 'progress', 'review', 'completed'],
    timeWindow: 'all',
    searchQuery: '',
  });

  // Load tasks from localStorage once
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TASKS_STORAGE_KEY);
      if (stored) setTasks(JSON.parse(stored));
    } catch (e) {
      console.error('Failed loading tasks', e);
    }
  }, []);

  // Persist tasks
  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed saving tasks', e);
    }
  }, [tasks]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      date: taskData.startDate ?? taskData.date,
      startDate: taskData.startDate,
      endDate: taskData.endDate,
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task;
      const isCollapsing = updates.startDate && updates.endDate && updates.startDate === updates.endDate;
      return {
        ...task,
        ...updates,
        ...(isCollapsing ? { startDate: undefined, endDate: undefined, date: updates.startDate } : {}),
      };
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateFilters = (newFilters: Partial<TaskFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      categories: ['todo', 'progress', 'review', 'completed'],
      timeWindow: 'all',
      searchQuery: '',
    });
  };

  const getFilteredTasks = () => {
    if (tasks.length === 0) return [];

    const today = new Date();
    today.setHours(0,0,0,0);

    let cutoff: Date | null = null;
    if (filters.timeWindow !== 'all') {
      const days = filters.timeWindow === '1week' ? 7 : filters.timeWindow === '2weeks' ? 14 : 21;
      cutoff = new Date(today.getTime() + days * 86400000);
    }

    const search = filters.searchQuery.trim().toLowerCase();

    return tasks.filter(task => {
      if (!filters.categories.includes(task.category)) return false;
      if (search && !task.name.toLowerCase().includes(search)) return false;
      if (cutoff) {
        const start = new Date(task.startDate ?? task.date);
        start.setHours(0,0,0,0);
        if (start < today) return false;
        if (start > cutoff) return false;
      }
      return true;
    });
  };

  const getTasksByDate = (date: Date) => {
    const target = date.toISOString().split('T')[0];
    const filtered = getFilteredTasks();
    return filtered.filter(task => {
      if (task.startDate || task.endDate) {
        const start = new Date(task.startDate ?? task.date);
        const end = new Date(task.endDate ?? task.startDate ?? task.date);
        const s = new Date(start.toISOString().split('T')[0]);
        const e = new Date(end.toISOString().split('T')[0]);
        const t = new Date(target);
        return t >= s && t <= e;
      }
      return task.date.startsWith(target);
    });
  };

  const clearAllTasks = () => {
    setTasks([]);
    localStorage.removeItem(TASKS_STORAGE_KEY);
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    clearAllTasks,
    getTasksByDate,
    getFilteredTasks,
    filters,
    updateFilters,
    resetFilters,
  };
}

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Call our custom hook directly (no useMemo) to satisfy Rules of Hooks
  const store = useTasksStore();
  return <TasksContext.Provider value={store}>{children}</TasksContext.Provider>;
};

export const useTasks = () => {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used inside <TasksProvider>');
  return ctx;
};