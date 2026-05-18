import { motion } from 'framer-motion';
import { Circle, CheckCircle2, Video, Code } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Task } from '../types';
import { useTrackerStore } from '../store/useTrackerStore';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TaskItemProps {
  dayNumber: number;
  type: 'lectures' | 'problems';
  task: Task;
}

export default function TaskItem({ dayNumber, type, task }: TaskItemProps) {
  const toggleTask = useTrackerStore((state) => state.toggleTask);
  const isAuthenticated = useTrackerStore((state) => state.isAuthenticated);

  const Icon = task.type === 'Video' ? Video : Code;

  return (
    <div
      onClick={() => toggleTask(dayNumber, task.id, type)}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 group border border-transparent",
        isAuthenticated ? "cursor-pointer" : "cursor-not-allowed opacity-90",
        task.isCompleted
          ? "bg-emerald-900/20 border-emerald-900/30"
          : isAuthenticated ? "hover:bg-zinc-800/50 hover:border-zinc-700/50" : "bg-zinc-900/50"
      )}
    >
      <motion.div
        whileTap={{ scale: 0.8 }}
        animate={task.isCompleted ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {task.isCompleted ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
        ) : (
          <Circle className="w-6 h-6 text-zinc-500 group-hover:text-zinc-400 flex-shrink-0" />
        )}
      </motion.div>
      
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Icon className={cn("w-4 h-4 flex-shrink-0", task.isCompleted ? "text-emerald-500/50" : "text-zinc-500")} />
        <span
          className={cn(
            "text-sm font-medium truncate transition-all duration-200",
            task.isCompleted ? "text-zinc-500 line-through" : "text-zinc-200"
          )}
        >
          {task.title}
        </span>
      </div>
    </div>
  );
}
