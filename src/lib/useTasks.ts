import { useState, useEffect } from 'react';

export interface Task {
  id: string;
  // For backward compatibility we keep 'date' as the primary (start) date of the task
  date: string;
  // Optional date range to support multi-day tasks
  startDate?: string;
  endDate?: string;
  name: string;
  category: 'todo' | 'progress' | 'review' | 'completed';
  description?: string;
  createdAt: string;
}

const TASKS_STORAGE_KEY = 'calendar-tasks';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks from localStorage on mount
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks) as Task[];
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error('Failed to load tasks from localStorage:', error);
      setTasks([]);
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks to localStorage:', error);
    }
  }, [tasks]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      // Ensure date is always set (use startDate if provided, else date already provided)
      date: taskData.startDate ?? taskData.date,
      // If no range provided, keep undefined to indicate single-day
      startDate: taskData.startDate,
      endDate: taskData.endDate,
    };

    setTasks(prevTasks => [...prevTasks, newTask]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id !== id) return task;
        const updated: Task = { ...task, ...updates } as Task;
        // Keep 'date' in sync with startDate when range exists
        if (updated.startDate) {
          updated.date = updated.startDate;
        }
        return updated;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  const getTasksByDate = (date: Date) => {
    const target = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      // If task has a date range, include if date falls within [startDate, endDate]
      if (task.startDate || task.endDate) {
        const start = new Date(task.startDate ?? task.date);
        const end = new Date(task.endDate ?? task.startDate ?? task.date);
        const d = new Date(target);
        // Normalize time to midnight to avoid timezone issues
        const s = new Date(start.toISOString().split('T')[0]);
        const e = new Date(end.toISOString().split('T')[0]);
        const t = new Date(d.toISOString().split('T')[0]);
        return t >= s && t <= e;
      }
      // Fallback single day matching using the legacy 'date' field
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
    getTasksByDate,
    clearAllTasks,
  };
};