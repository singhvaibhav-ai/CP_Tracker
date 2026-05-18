"use client";

import { useEffect, useState } from 'react';
import { differenceInDays, startOfDay, format, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Calendar as CalendarIcon, Zap, Video, Code, Lock, CheckCircle2, ChevronDown, Unlock, Sun, Moon } from 'lucide-react';
import Image from 'next/image';
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Load and apply persistent theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme === 'light') {
      setTheme('light');
      document.documentElement.classList.add('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      setTheme('dark');
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  };
  
  const courseDays = useTrackerStore((state) => state.courseDays);
  const getOverallProgress = useTrackerStore((state) => state.getOverallProgress);
  const getLevelProgress = useTrackerStore((state) => state.getLevelProgress);
  const isModuleComplete = useTrackerStore((state) => state.isModuleComplete);
  const isLevelComplete = useTrackerStore((state) => state.isLevelComplete);
  const collapsedItems = useTrackerStore((state) => state.collapsedItems);
  const toggleCollapse = useTrackerStore((state) => state.toggleCollapse);
  const initHydration = useTrackerStore((state) => state.initHydration);
  const isAuthenticated = useTrackerStore((state) => state.isAuthenticated);
  const login = useTrackerStore((state) => state.login);
  const logout = useTrackerStore((state) => state.logout);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
    }
  };

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
                className="flex items-center gap-2 px-3 h-[48px] py-0 w-full text-left group border-b border-zinc-800/50 rounded-none bg-zinc-950/90 backdrop-blur-md shadow-md sticky top-[244px] z-20"
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
                    initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                    animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                    exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
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
                <div className="relative w-12 h-12 md:w-16 md:h-16 overflow-hidden rounded-xl md:rounded-2xl shadow-lg border border-zinc-800 bg-zinc-900 shrink-0">
                  <Image src="/logo.png" alt="TLE Logo" fill className="object-cover" />
                </div>
                <span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500">
                    TLE
                  </span>
                  {' '}CP Tracker
                </span>
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
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 w-full text-left">
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
                        
                        {/* LEVEL PROGRESS BAR */}
                        {(() => {
                          const levelProg = getLevelProgress(level.start, level.end);
                          return (
                            <div className="flex flex-col sm:flex-row items-center gap-6 lg:ml-auto pl-12 lg:pl-0">
                              <div className="shrink-0 text-left">
                                <div className="text-[10px] font-black text-zinc-500 tracking-widest mb-1.5 uppercase text-left">
                                  Level Progress
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="w-56 sm:w-64 h-3 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 shadow-inner relative">
                                    <motion.div 
                                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${levelProg.percentage}%` }}
                                      transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                  </div>
                                  <div className="flex flex-col text-left justify-center min-w-[80px]">
                                    <span className="font-extrabold text-base text-emerald-400 leading-none">
                                      {levelProg.percentage}%
                                    </span>
                                    <span className="text-[10px] text-zinc-500 font-bold mt-1 whitespace-nowrap">
                                      {levelProg.completed}/{levelProg.total} Tasks
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="hidden lg:flex shrink-0 px-6 py-3 bg-zinc-950/80 backdrop-blur-md rounded-2xl border border-zinc-800 text-zinc-400 font-medium items-center gap-3">
                                {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                Days {level.start} — {level.end}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </button>

                  {/* 2-COLUMN GRID FOR THIS LEVEL (COLLAPSIBLE) */}
                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                        exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
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
                            <div className="bg-zinc-950/90 backdrop-blur-md h-[72px] py-0 border-b border-zinc-800 flex items-center gap-3 sticky top-[112px] z-40 shadow-md">
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

                                const dayCollapseId = `day-${day.dayNumber}-lectures`;
                                const isDayCollapsed = collapsedItems.includes(dayCollapseId);

                                return (
                                  <div key={`lectures-day-${day.dayNumber}`} className="space-y-4 bg-zinc-900/30 p-5 pt-0 rounded-2xl border border-zinc-800/40">
                                    <button
                                      onClick={() => toggleCollapse(dayCollapseId)}
                                      className="w-full flex items-center gap-4 h-[60px] py-0 px-4 border-b border-zinc-800/50 rounded-none shadow-lg bg-zinc-950/90 backdrop-blur-md sticky top-[184px] z-30 group transition-all hover:bg-zinc-900/50 text-left"
                                    >
                                      <ChevronDown 
                                        className={`w-5 h-5 text-zinc-500 transition-transform duration-300 group-hover:text-zinc-300 ${isDayCollapsed ? '-rotate-90' : 'rotate-0'}`} 
                                      />
                                      <span className="text-sm font-black text-blue-500 tracking-[0.2em] uppercase whitespace-nowrap">
                                        Day {day.dayNumber}
                                      </span>
                                      <div className="h-px flex-1 bg-zinc-800/80"></div>
                                      <span className="text-xs text-zinc-500 font-medium whitespace-nowrap">
                                        {format(day.date ? new Date(day.date) : addDays(START_DATE, day.dayNumber - 1), 'MMM do')}
                                      </span>
                                    </button>
                                    
                                    <AnimatePresence initial={false}>
                                      {!isDayCollapsed && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                                          animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                                          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                                          className="space-y-4 pb-2"
                                        >
                                          {renderTaskGroup(day.lectures, day.dayNumber, 'lectures')}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
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
                            <div className="bg-zinc-950/90 backdrop-blur-md h-[72px] py-0 border-b border-zinc-800 flex items-center gap-3 sticky top-[112px] z-40 shadow-md">
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

                                const dayCollapseId = `day-${day.dayNumber}-problems`;
                                const isDayCollapsed = collapsedItems.includes(dayCollapseId);

                                return (
                                  <div key={`problems-day-${day.dayNumber}`} className="space-y-4 bg-zinc-900/30 p-5 pt-0 rounded-2xl border border-zinc-800/40">
                                    <button
                                      onClick={() => toggleCollapse(dayCollapseId)}
                                      className="w-full flex items-center gap-4 h-[60px] py-0 px-4 border-b border-zinc-800/50 rounded-none shadow-lg bg-zinc-950/90 backdrop-blur-md sticky top-[184px] z-30 group transition-all hover:bg-zinc-900/50 text-left"
                                    >
                                      <ChevronDown 
                                        className={`w-5 h-5 text-zinc-500 transition-transform duration-300 group-hover:text-zinc-300 ${isDayCollapsed ? '-rotate-90' : 'rotate-0'}`} 
                                      />
                                      <span className="text-sm font-black text-emerald-500 tracking-[0.2em] uppercase whitespace-nowrap">
                                        Day {day.dayNumber}
                                      </span>
                                      <div className="h-px flex-1 bg-zinc-800/80"></div>
                                      <span className="text-xs text-zinc-500 font-medium whitespace-nowrap">
                                        {format(day.date ? new Date(day.date) : addDays(START_DATE, day.dayNumber - 1), 'MMM do')}
                                      </span>
                                    </button>
                                    
                                    <AnimatePresence initial={false}>
                                      {!isDayCollapsed && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                                          animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                                          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                                          className="space-y-4 pb-2"
                                        >
                                          {renderTaskGroup(day.problems, day.dayNumber, 'problems')}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
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

      {/* THEME TOGGLE BUTTON */}
      <button 
        onClick={toggleTheme}
        className="fixed bottom-[88px] right-6 p-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-amber-400 hover:border-amber-500/30 transition-all shadow-xl z-50 group"
        title="Toggle Theme"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" /> : <Moon className="w-5 h-5 text-amber-500" />}
      </button>

      {/* ADMIN AUTH BUTTON */}
      <button 
        onClick={() => isAuthenticated ? logout() : setShowAuthModal(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all shadow-xl z-50 group"
        title="Owner Mode"
      >
        {isAuthenticated ? <Unlock className="w-5 h-5 text-emerald-500" /> : <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />}
      </button>

      {/* AUTH MODAL */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-2">Owner Mode</h2>
              <p className="text-zinc-500 text-sm mb-6">Log in to unlock progress tracking.</p>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input 
                    type="email" 
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
                    required
                  />
                </div>
                <div>
                  <input 
                    type="password" 
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowAuthModal(false)}
                    className="flex-1 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors font-bold"
                  >
                    Unlock
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
