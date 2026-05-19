import { motion } from 'framer-motion';
import { Circle, CheckCircle2, Video, Code, Lock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Task } from '../types';
import { useTrackerStore } from '../store/useTrackerStore';
import { toast } from 'sonner';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TaskItemProps {
  dayNumber: number;
  type: 'lectures' | 'problems';
  task: Task;
  disabled?: boolean;
}

export default function TaskItem({ dayNumber, type, task, disabled }: TaskItemProps) {
  const toggleTask = useTrackerStore((state) => state.toggleTask);
  const isAuthenticated = useTrackerStore((state) => state.isAuthenticated);

  const Icon = task.type === 'Video' ? Video : Code;
  const isActuallyDisabled = disabled;

  const handleClick = () => {
    if (isActuallyDisabled) {
      if (task.isCompleted) {
        toast.error("Locked in history! You cannot uncheck past victories.");
      } else {
        toast.error("This is an incomplete historical task! You can only complete it from Today's Backlog.");
      }
      return;
    }
    toggleTask(dayNumber, task.id, type);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 group border border-transparent",
        isActuallyDisabled
          ? "cursor-not-allowed opacity-50 bg-zinc-950/40 border-zinc-900/50"
          : isAuthenticated ? "cursor-pointer" : "cursor-not-allowed opacity-90",
        task.isCompleted
          ? "bg-emerald-900/20 border-emerald-900/30"
          : !isActuallyDisabled && isAuthenticated ? "hover:bg-zinc-800/50 hover:border-zinc-700/50" : "bg-zinc-900/50"
      )}
    >
      <motion.div
        whileTap={isActuallyDisabled ? {} : { scale: 0.8 }}
        animate={task.isCompleted ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {task.isCompleted ? (
          <div className="relative">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
            {isActuallyDisabled && (
              <Lock className="w-3 h-3 text-zinc-900 absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-[2px]" />
            )}
          </div>
        ) : isActuallyDisabled ? (
          <Lock className="w-6 h-6 text-zinc-600 flex-shrink-0" />
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