import { useEffect, useRef } from 'react';
import { eachDayOfInterval, format, isSameDay, startOfDay } from 'date-fns';
import { cn } from './TaskItem';
import { motion } from 'framer-motion';

export default function DateStrip() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const startDate = new Date(2026, 4, 18); // May is 4 (0-indexed)
  const defaultEndDate = new Date(2026, 6, 27); // July is 6
  const todayDate = new Date();
  const endDate = todayDate > defaultEndDate ? todayDate : defaultEndDate;

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const today = startOfDay(new Date());

  // Scroll to today's date on mount
  useEffect(() => {
    if (scrollRef.current) {
      const todayElement = scrollRef.current.querySelector('[data-today="true"]');
      if (todayElement) {
        todayElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, []);

  return (
    <div className="w-full bg-zinc-900/50 border-b border-zinc-800 backdrop-blur-md sticky top-0 z-50">
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-2 p-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .scrollbar-hide::-webkit-scrollbar {
              display: none;
          }
        `}} />
        
        {days.map((date) => {
          const isToday = isSameDay(date, today);
          const isPast = date < today && !isToday;

          return (
            <motion.div
              key={date.toISOString()}
              data-today={isToday}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex flex-col items-center justify-center min-w-[64px] h-20 rounded-xl cursor-default snap-center transition-colors border",
                isToday 
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                  : isPast
                  ? "bg-zinc-800/30 border-transparent text-zinc-600"
                  : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
              )}
            >
              <span className="text-xs font-semibold uppercase tracking-wider mb-1">
                {format(date, 'MMM')}
              </span>
              <span className={cn(
                "text-2xl font-black leading-none",
                isToday ? "text-emerald-500" : (isPast ? "text-zinc-600" : "text-white")
              )}>
                {format(date, 'dd')}
              </span>
              <span className="text-[10px] mt-1 opacity-75">
                {format(date, 'EEE')}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
