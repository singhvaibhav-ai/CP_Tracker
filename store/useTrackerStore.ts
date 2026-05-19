import { create } from 'zustand';
import { TrackerStore, DailyLog } from '../types';
import { INITIAL_TRACKER_DATA } from '../lib/seedData';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useTrackerStore = create<TrackerStore & {
  isModuleComplete: (moduleName: string, type: 'lectures' | 'problems') => boolean;
  isLevelComplete: (startDay: number, endDay: number) => boolean;
}>()((set, get) => ({
      courseDays: INITIAL_TRACKER_DATA,
      dailyLogs: {},
      collapsedItems: [],
      isAuthenticated: false,

      login: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error(error.message);
          return false;
        }
        set({ isAuthenticated: true });
        toast.success("Owner Mode Unlocked!");
        return true;
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ isAuthenticated: false });
        toast.success("Locked. Visitor Mode Active.");
      },
      
      initHydration: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            set({ isAuthenticated: true });
          }

          const { data, error } = await supabase.from('user_progress').select('task_id, is_completed, updated_at');
          if (error) throw error;

          if (data && data.length > 0) {
            set((state) => {
              const courseDays = [...state.courseDays];
              const completedTasksMap = new Map<string, string | null>(
                data.filter(r => r.is_completed).map(r => [r.task_id, r.updated_at])
              );

              courseDays.forEach(day => {
                day.lectures.forEach(task => {
                  if (completedTasksMap.has(task.id)) {
                    task.isCompleted = true;
                    task.updatedAt = completedTasksMap.get(task.id);
                  }
                });
                day.problems.forEach(task => {
                  if (completedTasksMap.has(task.id)) {
                    task.isCompleted = true;
                    task.updatedAt = completedTasksMap.get(task.id);
                  }
                });
              });

              return { ...state, courseDays };
            });
          }
        } catch (err) {
          console.error('Failed to hydrate from Supabase:', err);
          toast.error('Failed to sync progress from cloud.');
        }
      },
      
      toggleCollapse: (id) => set((state) => {
        const collapsedItems = state.collapsedItems.includes(id)
          ? state.collapsedItems.filter(itemId => itemId !== id)
          : [...state.collapsedItems, id];
        return { collapsedItems };
      }),
      
      toggleTask: (dayNumber, taskId, type) => {
        if (!get().isAuthenticated) {
          toast.error("Visitor Mode: Progress is Read-Only.");
          return;
        }

        let wasCompleted = false;
        let isCompleted = false;
        const nowStr = new Date().toISOString();

        set((state) => {
          const courseDays = [...state.courseDays];
          const dayIndex = courseDays.findIndex((d) => d.dayNumber === dayNumber);
          
          if (dayIndex === -1) return state;

          const day = { ...courseDays[dayIndex] };
          const tasks = [...day[type]];
          
          const taskIndex = tasks.findIndex((t) => t.id === taskId);
          if (taskIndex === -1) return state;

          wasCompleted = tasks[taskIndex].isCompleted;
          isCompleted = !wasCompleted;
          tasks[taskIndex] = { 
            ...tasks[taskIndex], 
            isCompleted,
            updatedAt: isCompleted ? nowStr : null
          };
          
          day[type] = tasks;
          courseDays[dayIndex] = day;

          return { ...state, courseDays };
        });

        // Fire async upsert
        supabase.from('user_progress').upsert({ 
          task_id: taskId, 
          is_completed: isCompleted,
          updated_at: isCompleted ? nowStr : null
        }).then(({ error }) => {
          if (error) {
            console.error('Failed to sync toggle:', error);
            toast.error('Failed to sync progress. Rolling back.');
            
            // Rollback
            set((state) => {
              const courseDays = [...state.courseDays];
              const dayIndex = courseDays.findIndex((d) => d.dayNumber === dayNumber);
              if (dayIndex !== -1) {
                const day = { ...courseDays[dayIndex] };
                const tasks = [...day[type]];
                const taskIndex = tasks.findIndex((t) => t.id === taskId);
                if (taskIndex !== -1) {
                  tasks[taskIndex] = { 
                    ...tasks[taskIndex], 
                    isCompleted: wasCompleted,
                    updatedAt: wasCompleted ? nowStr : null // Keep original if rollback, but wasCompleted is a boolean so simple check
                  };
                  day[type] = tasks;
                  courseDays[dayIndex] = day;
                }
              }
              return { ...state, courseDays };
            });
          }
        });
      },
      
      getOverallProgress: () => {
        const { courseDays } = get();
        let total = 0;
        let completed = 0;
        
        for (const day of courseDays) {
          for (const task of day.lectures) {
            total++;
            if (task.isCompleted) completed++;
          }
          for (const task of day.problems) {
            total++;
            if (task.isCompleted) completed++;
          }
        }
        
        if (total === 0) return 0;
        return (completed / total) * 100;
      },

      getLevelProgress: (startDay: number, endDay: number) => {
        const { courseDays } = get();
        let total = 0;
        let completed = 0;
        
        for (const day of courseDays) {
          if (day.dayNumber >= startDay && day.dayNumber <= endDay) {
            for (const task of day.lectures) {
              total++;
              if (task.isCompleted) completed++;
            }
            for (const task of day.problems) {
              total++;
              if (task.isCompleted) completed++;
            }
          }
        }
        
        const percentage = total === 0 ? 0 : parseFloat(((completed / total) * 100).toFixed(1));
        return { percentage, completed, total };
      },

      isModuleComplete: (moduleName, type) => {
        const { courseDays } = get();
        let hasTasks = false;
        
        for (const day of courseDays) {
          for (const task of day[type]) {
            if (task.moduleName === moduleName) {
              hasTasks = true;
              if (!task.isCompleted) {
                return false;
              }
            }
          }
        }
        
        return hasTasks;
      },

      isLevelComplete: (startDay, endDay) => {
        const { courseDays } = get();
        let hasTasks = false;

        for (const day of courseDays) {
          if (day.dayNumber >= startDay && day.dayNumber <= endDay) {
            for (const task of day.lectures) {
              hasTasks = true;
              if (!task.isCompleted) return false;
            }
            for (const task of day.problems) {
              hasTasks = true;
              if (!task.isCompleted) return false;
            }
          }
        }

        return hasTasks;
      }
    }));
