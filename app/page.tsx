"use client";

import { useEffect, useState } from 'react';
import { differenceInDays, startOfDay, format, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Calendar as CalendarIcon, Zap, Video, Code, Lock, CheckCircle2, ChevronDown } from 'lucide-react';
import { Toaster } from 'sonner';
import { useTrackerStore } from '../store/useTrackerStore';
import DateStrip from '../components/DateStrip';
import TaskItem from '../components/TaskItem';
import { Task } from '../types';

const LEVEL_BOUNDARIES = [
  { id: 1, name: 'LEVEL 1', dates: 'May 18 - May 21', start: 1, end: 4 },
  { id: 2, name: 'LEVEL 2', dates: 'May 22 - June 5', start: 5, end: 19 },
  { id: 3, name: 'LEVEL 3', dates: 'June 6 - June 25', start: 20, end: 39 },
  { id: 4, name: 'LEVEL 4', dates: 'June 26 - July 26', start: 40, end: 70 },
];

const START_DATE = new Date(2026, 4, 18); // May 18, 2026
const END_DATE = new Date(2026, 6, 26); // July 26, 2026

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'lectures' | 'problems'>('lectures');
  const courseDays = useTrackerStore((state) => state.courseDays);
  const getOverallProgress = useTrackerStore((state) => state.getOverallProgress);
  const isModuleComplete = useTrackerStore((state) => state.isModuleComplete);
  const isLevelComplete = useTrackerStore((state) => state.isLevelComplete);
  const collapsedItems = useTrackerStore((state) => state.collapsedItems);
  const toggleCollapse = useTrackerStore((state) => state.toggleCollapse);
  const initHydration = useTrackerStore((state) => state.initHydration);

  useEffect(() => {
    setMounted(true);
    initHydration();
  }, [initHydration]);

  const progress = getOverallProgress();
  const today = startOfDay(new Date());
  const daysRemaining = Math.max(0, differenceInDays(END_DATE, today));

  const currentDateFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(today);

  // GAMIFIED UNLOCK LOGIC - INDEPENDENT TRACKS
  let baseRealWorldDayIndex = differenceInDays(today, START_DATE) + 1;
  if (baseRealWorldDayIndex < 1) baseRealWorldDayIndex = 1; // Before start date
  
  let maxVisibleLectureDayIndex = baseRealWorldDayIndex;
  let maxVisibleProblemDayIndex = baseRealWorldDayIndex;

  // LECTURES UNLOCK
  while (maxVisibleLectureDayIndex <= 70) {
    const dayToCheck = courseDays[maxVisibleLectureDayIndex - 1];
    if (!dayToCheck) break;
    
    // Only check lectures
    const isComplete = dayToCheck.lectures.length === 0 || dayToCheck.lectures.every(t => t.isCompleted);
    if (isComplete && dayToCheck.lectures.length > 0) {
      maxVisibleLectureDayIndex++;
    } else {
      break;
    }
  }

  // PROBLEMS UNLOCK
  while (maxVisibleProblemDayIndex <= 70) {
    const dayToCheck = courseDays[maxVisibleProblemDayIndex - 1];
    if (!dayToCheck) break;
    
    // Only check problems
    const isComplete = dayToCheck.problems.length === 0 || dayToCheck.problems.every(t => t.isCompleted);
    if (isComplete && dayToCheck.problems.length > 0) {
      maxVisibleProblemDayIndex++;
    } else {
      break;
    }
  }

  if (maxVisibleLectureDayIndex > 70) maxVisibleLectureDayIndex = 70;
  if (maxVisibleProblemDayIndex > 70) maxVisibleProblemDayIndex = 70;

  const maxVisibleOverall = Math.max(maxVisibleLectureDayIndex, maxVisibleProblemDayIndex);
  const overallVisibleDays = courseDays.slice(0, maxVisibleOverall);

  if (!mounted) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  const renderTaskGroup = (tasks: Task[], dayNumber: number, type: 'lectures' | 'problems') => {
    if (tasks.length === 0) {
      return <div className="text-zinc-600 text-sm italic px-4 py-2">No {type} for this day</div>;
    }

    // Group by moduleName
    const grouped = tasks.reduce((acc, task) => {
      const mod = task.moduleName || 'General';
      if (!acc[mod]) acc[mod] = [];
      acc[mod].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    return (
      <div className="space-y-4">
        {Object.entries(grouped).map(([moduleName, moduleTasks]) => {
          const completed = isModuleComplete(moduleName, type);
          const collapseId = `${dayNumber}-${type}-${moduleName}`;
          const isCollapsed = collapsedItems.includes(collapseId);
          
          return (
            <div key={collapseId} className="space-y-2">
              <button 
                onClick={() => toggleCollapse(collapseId)}
                className="flex items-center gap-2 px-3 py-2 -mx-3 w-[calc(100%+1.5rem)] text-left group sticky top-[135px] z-10 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50 rounded-lg shadow-sm"
              >
                <ChevronDown 
                  className={`w-4 h-4 text-zinc-500 transition-transform duration-300 group-hover:text-zinc-300 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`} 
                />
                <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-400 uppercase tracking-widest transition-colors">
                  {moduleName}
                </span>
                {completed && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
              </button>
              
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 pt-1">
                      {moduleTasks.map(task => (
                        <div key={task.id} className="bg-zinc-900/80 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                          <TaskItem dayNumber={dayNumber} type={type} task={task} />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      <Toaster position="bottom-right" theme="dark" />
      <DateStrip />

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-16 pb-32">
        {/* Dashboard Header */}
        <header className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-zinc-400">
                <CalendarIcon className="w-5 h-5 text-emerald-500" />
                <span className="font-medium tracking-wide uppercase text-sm">
                  {currentDateFormatted}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white flex items-center gap-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500">
                  70-Day
                </span>
                1600+ CP
              </h1>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 md:p-6 backdrop-blur-sm flex items-center gap-4 shrink-0 shadow-2xl">
              <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                <Target className="w-8 h-8" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                  Target: July 27th
                </div>
                <div className="text-3xl font-black text-white flex items-baseline gap-2">
                  {daysRemaining}
                  <span className="text-sm font-medium text-zinc-400">Days Remaining</span>
                </div>
              </div>
            </div>
          </div>

          {/* Global Progress Bar */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Zap className="w-48 h-48" />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-300">Overall Progress</h2>
                  <p className="text-sm text-zinc-500 mt-1">Keep pushing your limits!</p>
                </div>
                <div className="text-4xl md:text-5xl font-black text-emerald-400">
                  {progress.toFixed(1)}%
                </div>
              </div>

              <div className="h-4 bg-zinc-950 rounded-full overflow-hidden shadow-inner border border-zinc-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 relative"
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                </motion.div>
              </div>
            </div>
          </div>
        </header>

        {/* Level Grouping and Grids */}
        <div className="space-y-24">
          <AnimatePresence>
            {LEVEL_BOUNDARIES.map((level) => {
              const daysInLevel = overallVisibleDays.filter(
                (d) => d.dayNumber >= level.start && d.dayNumber <= level.end
              );

              const isLocked = daysInLevel.length === 0;
              if (isLocked) return null;

              const levelId = `level-${level.id}`;
              const isCollapsed = collapsedItems.includes(levelId);
              const isCompleted = isLevelComplete(level.start, level.end);

              return (
                <motion.section 
                  key={levelId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* LEVEL BANNER */}
                  <button 
                    onClick={() => toggleCollapse(levelId)}
                    className="w-full text-left relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 shadow-2xl group transition-all hover:border-zinc-700"
                  >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <ChevronDown 
                            className={`w-8 h-8 text-zinc-500 transition-transform duration-500 group-hover:text-zinc-400 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`} 
                          />
                          <div className="text-emerald-500 font-bold tracking-[0.2em] uppercase text-sm">
                            {level.dates}
                          </div>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight flex items-center gap-4 pl-12">
                          🏆 {level.name}
                        </h2>
                      </div>
                      <div className="px-6 py-3 bg-zinc-950/80 backdrop-blur-md rounded-2xl border border-zinc-800 text-zinc-400 font-medium flex items-center gap-3">
                        {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        Days {level.start} — {level.end}
                      </div>
                    </div>
                  </button>

                  {/* 2-COLUMN GRID FOR THIS LEVEL (COLLAPSIBLE) */}
                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="md:hidden flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl mt-6">
                          <button 
                            onClick={() => setActiveTab('lectures')}
                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${activeTab === 'lectures' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-500 hover:text-zinc-400'}`}
                          >
                            Lectures
                          </button>
                          <button 
                            onClick={() => setActiveTab('problems')}
                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${activeTab === 'problems' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-500 hover:text-zinc-400'}`}
                          >
                            Problems
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-12 relative items-start pt-6">
                          
                          {/* LECTURES COLUMN */}
                          <div className={`space-y-6 ${activeTab === 'problems' ? 'hidden md:block' : ''}`}>
                            <div className="bg-zinc-950 py-4 border-b border-zinc-800 flex items-center gap-3">
                              <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Video className="w-5 h-5 text-blue-400" />
                              </div>
                              <h3 className="text-xl font-bold text-white uppercase tracking-wider">Lectures</h3>
                            </div>
                            
                            <div className="space-y-8 pb-8">
                              {maxVisibleLectureDayIndex < level.start && (
                                <div className="flex flex-col items-center justify-center py-12 opacity-50 space-y-4 bg-zinc-900/20 rounded-2xl border border-zinc-800/30 border-dashed">
                                  <Lock className="w-8 h-8 text-zinc-600" />
                                  <p className="text-zinc-500 font-medium uppercase tracking-widest text-xs text-center">
                                    Level Locked<br/>Complete Day {level.start - 1} Lectures
                                  </p>
                                </div>
                              )}
                              
                              {daysInLevel.map((day) => {
                                if (day.dayNumber > maxVisibleLectureDayIndex) return null;
                                if (day.lectures.length === 0) return null;

                                return (
                                  <div key={`lectures-day-${day.dayNumber}`} className="space-y-4 bg-zinc-900/30 p-5 pt-0 rounded-2xl border border-zinc-800/40">
                                    <div className="flex items-center gap-4 sticky top-[75px] z-20 bg-zinc-950/95 backdrop-blur-xl py-4 -mx-5 px-5 border-b border-zinc-800/50 rounded-t-2xl shadow-sm">
                                      <span className="text-sm font-black text-blue-500/80 uppercase tracking-widest whitespace-nowrap">
                                        Day {day.dayNumber}
                                     </span>
                                      <div className="h-px flex-1 bg-zinc-800/80"></div>
                                      <span className="text-xs text-zinc-500 font-medium whitespace-nowrap">
                                        {format(day.date ? new Date(day.date) : addDays(START_DATE, day.dayNumber - 1), 'MMM do')}
                                      </span>
                                    </div>
                                    <div className="space-y-4 pb-2">
                                      {renderTaskGroup(day.lectures, day.dayNumber, 'lectures')}
                                    </div>
                                  </div>
                                );
                              })}
                              {maxVisibleLectureDayIndex <= level.end && maxVisibleLectureDayIndex >= level.start && (
                                <div className="flex flex-col items-center justify-center py-6 opacity-50 space-y-2">
                                  <Lock className="w-6 h-6 text-zinc-600" />
                                  <p className="text-zinc-500 font-medium uppercase tracking-widest text-xs">
                                    Complete Day {maxVisibleLectureDayIndex} Lectures
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* PROBLEMS COLUMN */}
                          <div className={`space-y-6 ${activeTab === 'lectures' ? 'hidden md:block' : ''}`}>
                            <div className="bg-zinc-950 py-4 border-b border-zinc-800 flex items-center gap-3">
                              <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <Code className="w-5 h-5 text-emerald-400" />
                              </div>
                              <h3 className="text-xl font-bold text-white uppercase tracking-wider">Practice Problems</h3>
                            </div>
                            
                            <div className="space-y-8 pb-8">
                              {maxVisibleProblemDayIndex < level.start && (
                                <div className="flex flex-col items-center justify-center py-12 opacity-50 space-y-4 bg-zinc-900/20 rounded-2xl border border-zinc-800/30 border-dashed">
                                  <Lock className="w-8 h-8 text-zinc-600" />
                                  <p className="text-zinc-500 font-medium uppercase tracking-widest text-xs text-center">
                                    Level Locked<br/>Complete Day {level.start - 1} Problems
                                  </p>
                                </div>
                              )}

                              {daysInLevel.map((day) => {
                                if (day.dayNumber > maxVisibleProblemDayIndex) return null;
                                if (day.problems.length === 0) return null;

                                return (
                                  <div key={`problems-day-${day.dayNumber}`} className="space-y-4 bg-zinc-900/30 p-5 pt-0 rounded-2xl border border-zinc-800/40">
                                    <div className="flex items-center gap-4 sticky top-[75px] z-20 bg-zinc-950/95 backdrop-blur-xl py-4 -mx-5 px-5 border-b border-zinc-800/50 rounded-t-2xl shadow-sm">
                                      <span className="text-sm font-black text-emerald-500/80 uppercase tracking-widest whitespace-nowrap">
                                        Day {day.dayNumber}
                                      </span>
                                      <div className="h-px flex-1 bg-zinc-800/80"></div>
                                      <span className="text-xs text-zinc-500 font-medium whitespace-nowrap">
                                        {format(day.date ? new Date(day.date) : addDays(START_DATE, day.dayNumber - 1), 'MMM do')}
                                      </span>
                                    </div>
                                    <div className="space-y-4 pb-2">
                                      {renderTaskGroup(day.problems, day.dayNumber, 'problems')}
                                    </div>
                                  </div>
                                );
                              })}
                              {maxVisibleProblemDayIndex <= level.end && maxVisibleProblemDayIndex >= level.start && (
                                <div className="flex flex-col items-center justify-center py-6 opacity-50 space-y-2">
                                  <Lock className="w-6 h-6 text-zinc-600" />
                                  <p className="text-zinc-500 font-medium uppercase tracking-widest text-xs">
                                    Complete Day {maxVisibleProblemDayIndex} Problems
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                        </div>

                        {/* SMART AUTO-COLLAPSE FINISHED LEVEL BUTTON */}
                        {isCompleted && (
                          <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => toggleCollapse(levelId)}
                            className="mt-6 w-full py-4 text-center text-xs font-bold text-zinc-500 hover:text-emerald-400 transition-colors uppercase tracking-widest border border-dashed border-zinc-800 hover:border-emerald-500/30 rounded-2xl flex items-center justify-center gap-2"
                          >
                            <ChevronDown className="w-4 h-4 -rotate-90" />
                            Collapse Finished Level
                          </motion.button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.section>
              );
            })}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}
