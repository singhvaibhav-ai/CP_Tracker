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
import { Task, CourseDay } from '../types';

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
  const [todaySectionsCollapsed, setTodaySectionsCollapsed] = useState<Record<string, boolean>>({
    lectures_backlogs: false,
    lectures_completed: false,
    lectures_pending: false,
    lectures_additional: false,
    problems_backlogs: false,
    problems_completed: false,
    problems_pending: false,
    problems_additional: false,
  });

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



  const renderTasksWithModules = (tasks: (Task & { dayNumber: number })[], type: 'lectures' | 'problems', disabled?: boolean) => {
    if (!tasks || tasks.length === 0) return null;

    // 1. Group Tasks Strictly
    const groupedTasks = tasks.reduce((acc, task) => {
      const mod = task.moduleName || "General";
      if (!acc[mod]) acc[mod] = [];
      acc[mod].push(task);
      return acc;
    }, {} as Record<string, (Task & { dayNumber: number })[]>);

    // 2. Render with Strict Flex-Col Flow
    return (
      <div className="space-y-3 pt-1">
        {Object.entries(groupedTasks).map(([moduleName, moduleTasks]) => {
          const isModuleComplete = moduleTasks.length > 0 && moduleTasks.every(t => t.isCompleted);

          return (
            <div key={moduleName} className="bg-zinc-950/40 border border-zinc-900/60 rounded-xl mb-3 flex flex-col overflow-hidden">
              
              {/* MODULE HEADER */}
              <div className="relative z-20 bg-zinc-950/95 border-b border-zinc-900/60 px-3 py-2 flex items-center justify-between rounded-t-xl">
                <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                  {moduleName}
                </span>
                {isModuleComplete && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                )}
              </div>

              {/* TASKS CONTAINER */}
              <div className="flex flex-col space-y-1.5 p-2 bg-transparent">
                {moduleTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    dayNumber={task.dayNumber} 
                    type={type} 
                    task={task} 
                    disabled={disabled} 
                  />
                ))}
              </div>

            </div>
          );
        })}
      </div>
    );
  };

  const renderTodayBuckets = (dayNumber: number, type: 'lectures' | 'problems') => {
    // 1. Backlogs: Tasks from Day 1 to Yesterday where isCompleted === false
    const backlogs: (Task & { dayNumber: number })[] = [];
    for (let d = 1; d < baseRealWorldDayIndex; d++) {
      const dayData = courseDays[d - 1];
      if (dayData) {
        dayData[type].forEach(task => {
          if (!task.isCompleted) {
            backlogs.push({ ...task, dayNumber: d });
          }
        });
      }
    }

    // 2. Today's Completed: Tasks assigned to Today where isCompleted === true
    const todayDayData = courseDays[dayNumber - 1];
    const todayCompleted = todayDayData 
      ? todayDayData[type].filter(t => t.isCompleted).map(t => ({ ...t, dayNumber })) 
      : [];

    // 3. Today's Pending: Tasks assigned to Today where isCompleted === false
    const todayPending = todayDayData 
      ? todayDayData[type].filter(t => !t.isCompleted).map(t => ({ ...t, dayNumber })) 
      : [];

    // 4. Additional Tasks: Tasks assigned to Tomorrow or beyond where isCompleted === true AND updatedAt matches Today
    const localTodayStr = format(new Date(), 'yyyy-MM-dd');
    const additional: (Task & { dayNumber: number })[] = [];
    for (let d = baseRealWorldDayIndex + 1; d <= 70; d++) {
      const dayData = courseDays[d - 1];
      if (dayData) {
        dayData[type].forEach(task => {
          if (task.isCompleted && task.updatedAt && task.updatedAt.startsWith(localTodayStr)) {
            additional.push({ ...task, dayNumber: d });
          }
        });
      }
    }

    const backlogKey = `${type}_backlogs` as const;
    const completedKey = `${type}_completed` as const;
    const pendingKey = `${type}_pending` as const;
    const additionalKey = `${type}_additional` as const;

    const toggleSection = (section: keyof typeof todaySectionsCollapsed) => {
      setTodaySectionsCollapsed(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    };

    return (
      <div className="space-y-4 pt-4">
        {/* BACKLOGS */}
        <div 
          style={{ overflow: todaySectionsCollapsed[backlogKey] ? 'hidden' : 'visible' }}
          className="border border-red-500/20 bg-red-950/5 rounded-xl shadow-sm transition-all duration-300"
        >
          <button
            onClick={() => toggleSection(backlogKey)}
            className="w-full flex items-center justify-between px-4 py-3 bg-red-950/10 border-b border-red-500/10 text-left transition-colors hover:bg-red-950/20"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-red-400 uppercase">Backlogs</span>
              <span className="px-1.5 py-0.5 text-[10px] font-black bg-red-500/20 text-red-400 rounded">
                {backlogs.length}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-red-400 transition-transform duration-300 ${todaySectionsCollapsed[backlogKey] ? "-rotate-90" : "rotate-0"}`} />
          </button>
          {!todaySectionsCollapsed[backlogKey] && (
            <div className="p-3 space-y-2">
              {backlogs.length === 0 ? (
                <div className="text-zinc-500 text-xs italic px-2 py-1">No pending backlogs! Great job!</div>
              ) : (
                renderTasksWithModules(backlogs, type, false)
              )}
            </div>
          )}
        </div>

        {/* COMPLETED TODAY */}
        <div 
          style={{ overflow: todaySectionsCollapsed[completedKey] ? 'hidden' : 'visible' }}
          className="border border-emerald-500/20 bg-emerald-950/5 rounded-xl shadow-sm transition-all duration-300"
        >
          <button
            onClick={() => toggleSection(completedKey)}
            className="w-full flex items-center justify-between px-4 py-3 bg-emerald-950/10 border-b border-emerald-500/10 text-left transition-colors hover:bg-emerald-950/20"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">Completed Today</span>
              <span className="px-1.5 py-0.5 text-[10px] font-black bg-emerald-500/20 text-emerald-400 rounded">
                {todayCompleted.length}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-emerald-400 transition-transform duration-300 ${todaySectionsCollapsed[completedKey] ? "-rotate-90" : "rotate-0"}`} />
          </button>
          {!todaySectionsCollapsed[completedKey] && (
            <div className="p-3 space-y-2">
              {todayCompleted.length === 0 ? (
                <div className="text-zinc-500 text-xs italic px-2 py-1">No completed tasks yet. Get grinding!</div>
              ) : (
                renderTasksWithModules(todayCompleted, type, false)
              )}
            </div>
          )}
        </div>

        {/* PENDING TODAY */}
        <div 
          style={{ overflow: todaySectionsCollapsed[pendingKey] ? 'hidden' : 'visible' }}
          className="border border-blue-500/20 bg-blue-950/5 rounded-xl shadow-sm transition-all duration-300"
        >
          <button
            onClick={() => toggleSection(pendingKey)}
            className="w-full flex items-center justify-between px-4 py-3 bg-blue-950/10 border-b border-blue-500/10 text-left transition-colors hover:bg-blue-950/20"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-blue-400 uppercase">Pending Today</span>
              <span className="px-1.5 py-0.5 text-[10px] font-black bg-blue-500/20 text-blue-400 rounded">
                {todayPending.length}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-blue-400 transition-transform duration-300 ${todaySectionsCollapsed[pendingKey] ? "-rotate-90" : "rotate-0"}`} />
          </button>
          {!todaySectionsCollapsed[pendingKey] && (
            <div className="p-3 space-y-2">
              {todayPending.length === 0 ? (
                <div className="text-zinc-500 text-xs italic px-2 py-1">All of today&apos;s tasks completed!</div>
              ) : (
                renderTasksWithModules(todayPending, type, false)
              )}
            </div>
          )}
        </div>

        {/* ADDITIONAL TASKS */}
        <div 
          style={{ overflow: todaySectionsCollapsed[additionalKey] ? 'hidden' : 'visible' }}
          className="border border-purple-500/20 bg-purple-950/5 rounded-xl shadow-sm transition-all duration-300"
        >
          <button
            onClick={() => toggleSection(additionalKey)}
            className="w-full flex items-center justify-between px-4 py-3 bg-purple-950/10 border-b border-purple-500/10 text-left transition-colors hover:bg-purple-950/20"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-purple-400 uppercase">Additional Tasks</span>
              <span className="px-1.5 py-0.5 text-[10px] font-black bg-purple-500/20 text-purple-400 rounded">
                {additional.length}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-purple-400 transition-transform duration-300 ${todaySectionsCollapsed[additionalKey] ? "-rotate-90" : "rotate-0"}`} />
          </button>
          {!todaySectionsCollapsed[additionalKey] && (
            <div className="p-3 space-y-2">
              {additional.length === 0 ? (
                <div className="text-zinc-500 text-xs italic px-2 py-1">No future tasks completed today.</div>
              ) : (
                renderTasksWithModules(additional, type, false)
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPastDay = (day: CourseDay, type: 'lectures' | 'problems') => {
    const completed = day[type].filter(t => t.isCompleted).map(t => ({ ...t, dayNumber: day.dayNumber }));
    const incompleted = day[type].filter(t => !t.isCompleted).map(t => ({ ...t, dayNumber: day.dayNumber }));

    // Historical Additional Tasks: completed tasks on days d > day.dayNumber where updatedAt matches day.date
    const pastDayDateStr = day.date;
    const additional: (Task & { dayNumber: number })[] = [];
    if (pastDayDateStr) {
      for (let d = day.dayNumber + 1; d <= 70; d++) {
        const dayData = courseDays[d - 1];
        if (dayData) {
          dayData[type].forEach(task => {
            if (task.isCompleted && task.updatedAt && task.updatedAt.startsWith(pastDayDateStr)) {
              additional.push({ ...task, dayNumber: d });
            }
          });
        }
      }
    }

    // Historical Backlogs Cleared: completed tasks on days d < day.dayNumber where updatedAt matches day.date
    const backlogsCleared: (Task & { dayNumber: number })[] = [];
    if (pastDayDateStr) {
      for (let d = 1; d < day.dayNumber; d++) {
        const dayData = courseDays[d - 1];
        if (dayData) {
          dayData[type].forEach(task => {
            if (task.isCompleted && task.updatedAt && task.updatedAt.startsWith(pastDayDateStr)) {
              backlogsCleared.push({ ...task, dayNumber: d });
            }
          });
        }
      }
    }

    const completedKey = `past_${day.dayNumber}_${type}_completed`;
    const additionalKey = `past_${day.dayNumber}_${type}_additional`;
    const backlogsClearedKey = `past_${day.dayNumber}_${type}_backlogs_cleared`;
    const incompletedKey = `past_${day.dayNumber}_${type}_incompleted`;

    const isCompletedCollapsed = todaySectionsCollapsed[completedKey] ?? true;
    const isAdditionalCollapsed = todaySectionsCollapsed[additionalKey] ?? true;
    const isBacklogsClearedCollapsed = todaySectionsCollapsed[backlogsClearedKey] ?? true;
    const isIncompletedCollapsed = todaySectionsCollapsed[incompletedKey] ?? false;

    const toggleSection = (section: string) => {
      setTodaySectionsCollapsed(prev => ({
        ...prev,
        [section]: !(prev[section] ?? (section.endsWith('_incompleted') ? false : true))
      }));
    };

    return (
      <div className="space-y-4 pt-4">
        {/* COMPLETED */}
        {completed.length > 0 && (
          <div 
            style={{ overflow: isCompletedCollapsed ? 'hidden' : 'visible' }}
            className="border border-emerald-500/20 bg-emerald-950/5 rounded-xl shadow-sm transition-all duration-300"
          >
            <button
              onClick={() => toggleSection(completedKey)}
              className="w-full flex items-center justify-between px-4 py-3 bg-emerald-950/10 border-b border-emerald-500/10 text-left transition-colors hover:bg-emerald-950/20"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">Completed</span>
                <span className="px-1.5 py-0.5 text-[10px] font-black bg-emerald-500/20 text-emerald-400 rounded">
                  {completed.length}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-emerald-400 transition-transform duration-300 ${isCompletedCollapsed ? "-rotate-90" : "rotate-0"}`} />
            </button>
            {!isCompletedCollapsed && (
              <div className="p-3 space-y-2">
                {renderTasksWithModules(completed, type, false)}
              </div>
            )}
          </div>
        )}

        {/* ADDITIONAL TASKS COMPLETED */}
        {additional.length > 0 && (
          <div 
            style={{ overflow: isAdditionalCollapsed ? 'hidden' : 'visible' }}
            className="border border-purple-500/20 bg-purple-950/5 rounded-xl shadow-sm transition-all duration-300"
          >
            <button
              onClick={() => toggleSection(additionalKey)}
              className="w-full flex items-center justify-between px-4 py-3 bg-purple-950/10 border-b border-purple-500/10 text-left transition-colors hover:bg-purple-950/20"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black tracking-widest text-purple-400 uppercase text-xs md:text-sm">Additional Tasks Completed</span>
                <span className="px-1.5 py-0.5 text-[10px] font-black bg-purple-500/20 text-purple-400 rounded">
                  {additional.length}
                </span>
                <span className="text-[9px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded leading-none uppercase tracking-wider font-bold">Ahead of Schedule</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-purple-400 transition-transform duration-300 ${isAdditionalCollapsed ? "-rotate-90" : "rotate-0"}`} />
            </button>
            {!isAdditionalCollapsed && (
              <div className="p-3 space-y-2">
                {renderTasksWithModules(additional, type, false)}
              </div>
            )}
          </div>
        )}

        {/* BACKLOGS CLEARED */}
        {backlogsCleared.length > 0 && (
          <div 
            style={{ overflow: isBacklogsClearedCollapsed ? 'hidden' : 'visible' }}
            className="border border-indigo-500/20 bg-indigo-950/5 rounded-xl shadow-sm transition-all duration-300"
          >
            <button
              onClick={() => toggleSection(backlogsClearedKey)}
              className="w-full flex items-center justify-between px-4 py-3 bg-indigo-950/10 border-b border-indigo-500/10 text-left transition-colors hover:bg-indigo-950/20"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black tracking-widest text-indigo-400 uppercase text-xs md:text-sm">Backlogs Cleared</span>
                <span className="px-1.5 py-0.5 text-[10px] font-black bg-indigo-500/20 text-indigo-400 rounded">
                  {backlogsCleared.length}
                </span>
                <span className="text-[9px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded leading-none uppercase tracking-wider font-bold">Caught Up</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-indigo-400 transition-transform duration-300 ${isBacklogsClearedCollapsed ? "-rotate-90" : "rotate-0"}`} />
            </button>
            {!isBacklogsClearedCollapsed && (
              <div className="p-3 space-y-2">
                {renderTasksWithModules(backlogsCleared, type, false)}
              </div>
            )}
          </div>
        )}

        {/* INCOMPLETED (LOCKED) */}
        {incompleted.length > 0 && (
          <div 
            style={{ overflow: isIncompletedCollapsed ? 'hidden' : 'visible' }}
            className="border border-red-500/20 bg-red-950/5 rounded-xl shadow-sm transition-all duration-300"
          >
            <button
              onClick={() => toggleSection(incompletedKey)}
              className="w-full flex items-center justify-between px-4 py-3 bg-red-950/10 border-b border-red-500/10 text-left transition-colors hover:bg-red-950/20"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black tracking-widest text-red-400 uppercase text-xs md:text-sm">Incompleted</span>
                <span className="px-1.5 py-0.5 text-[10px] font-black bg-red-500/20 text-red-400 rounded">
                  {incompleted.length}
                </span>
                <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded leading-none uppercase tracking-wider font-bold">Locked (Read-Only)</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-red-400 transition-transform duration-300 ${isIncompletedCollapsed ? "-rotate-90" : "rotate-0"}`} />
            </button>
            {!isIncompletedCollapsed && (
              <div className="p-3 space-y-2">
                {renderTasksWithModules(incompleted, type, true)}
              </div>
            )}
          </div>
        )}

        {completed.length === 0 && additional.length === 0 && backlogsCleared.length === 0 && incompleted.length === 0 && (
          <div className="text-zinc-600 text-xs italic px-2">No {type} for this day.</div>
        )}
      </div>
    );
  };

  const renderFutureDay = (day: CourseDay, type: 'lectures' | 'problems') => {
    if (day[type].length === 0) {
      return <div className="text-zinc-600 text-sm italic px-4 py-2">No {type} for this day</div>;
    }
    const tasks = day[type].map(t => ({ ...t, dayNumber: day.dayNumber }));
    return renderTasksWithModules(tasks, type);
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
                            
                            <div className="space-y-0 pb-8">
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
                                const isDayCollapsed = collapsedItems.includes(dayCollapseId)
                                  ? (day.dayNumber === baseRealWorldDayIndex ? true : false)
                                  : (day.dayNumber === baseRealWorldDayIndex ? false : true);

                                return (
                                  <div 
                                    key={`lectures-day-${day.dayNumber}`} 
                                    className={`bg-zinc-900/30 px-5 pt-0 pb-0 rounded-2xl border border-zinc-800/40 transition-all duration-300 ${
                                      isDayCollapsed ? 'overflow-hidden mb-0' : 'overflow-visible mb-6'
                                    }`}
                                  >
                                    <button
                                      onClick={() => toggleCollapse(dayCollapseId)}
                                      className="flex items-center gap-4 h-[60px] py-0 -mx-5 px-5 w-[calc(100%+2.5rem)] border-b border-zinc-800/50 rounded-t-2xl rounded-b-none shadow-lg bg-zinc-950/90 backdrop-blur-md sticky top-[184px] z-30 group transition-all hover:bg-zinc-900/50 text-left"
                                    >
                                      <ChevronDown 
                                        className={`w-5 h-5 text-zinc-500 transition-transform duration-300 group-hover:text-zinc-300 ${isDayCollapsed ? '-rotate-90' : 'rotate-0'}`} 
                                      />
                                      <span className="text-sm font-black text-blue-500 tracking-[0.2em] uppercase whitespace-nowrap">
                                        Day {day.dayNumber}
                                      </span>
                                      {day.dayNumber === baseRealWorldDayIndex && (
                                        <span className="text-[10px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded uppercase tracking-wider">
                                          Today
                                        </span>
                                      )}
                                      <div className="h-px flex-1 bg-zinc-800/80"></div>
                                      <span className="text-xs text-zinc-500 font-medium whitespace-nowrap">
                                        {format(day.date ? new Date(day.date) : addDays(START_DATE, day.dayNumber - 1), 'MMM do')}
                                      </span>
                                    </button>
                                    
                                    <AnimatePresence initial={false}>
                                      {!isDayCollapsed && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                                          style={{ overflow: isDayCollapsed ? 'hidden' : 'visible' }}
                                          className="space-y-4 pt-4 pb-5"
                                        >
                                          {day.dayNumber === baseRealWorldDayIndex ? (
                                            renderTodayBuckets(day.dayNumber, 'lectures')
                                          ) : day.dayNumber < baseRealWorldDayIndex ? (
                                            renderPastDay(day, 'lectures')
                                          ) : (
                                            renderFutureDay(day, 'lectures')
                                          )}
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
                            
                            <div className="space-y-0 pb-8">
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
                                const isDayCollapsed = collapsedItems.includes(dayCollapseId)
                                  ? (day.dayNumber === baseRealWorldDayIndex ? true : false)
                                  : (day.dayNumber === baseRealWorldDayIndex ? false : true);

                                return (
                                  <div 
                                    key={`problems-day-${day.dayNumber}`} 
                                    className={`bg-zinc-900/30 px-5 pt-0 pb-0 rounded-2xl border border-zinc-800/40 transition-all duration-300 ${
                                      isDayCollapsed ? 'overflow-hidden mb-0' : 'overflow-visible mb-6'
                                    }`}
                                  >
                                    <button
                                      onClick={() => toggleCollapse(dayCollapseId)}
                                      className="flex items-center gap-4 h-[60px] py-0 -mx-5 px-5 w-[calc(100%+2.5rem)] border-b border-zinc-800/50 rounded-t-2xl rounded-b-none shadow-lg bg-zinc-950/90 backdrop-blur-md sticky top-[184px] z-30 group transition-all hover:bg-zinc-900/50 text-left"
                                    >
                                      <ChevronDown 
                                        className={`w-5 h-5 text-zinc-500 transition-transform duration-300 group-hover:text-zinc-300 ${isDayCollapsed ? '-rotate-90' : 'rotate-0'}`} 
                                      />
                                      <span className="text-sm font-black text-emerald-500 tracking-[0.2em] uppercase whitespace-nowrap">
                                        Day {day.dayNumber}
                                      </span>
                                      {day.dayNumber === baseRealWorldDayIndex && (
                                        <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded uppercase tracking-wider">
                                          Today
                                        </span>
                                      )}
                                      <div className="h-px flex-1 bg-zinc-800/80"></div>
                                      <span className="text-xs text-zinc-500 font-medium whitespace-nowrap">
                                        {format(day.date ? new Date(day.date) : addDays(START_DATE, day.dayNumber - 1), 'MMM do')}
                                      </span>
                                    </button>
                                    
                                    <AnimatePresence initial={false}>
                                      {!isDayCollapsed && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                                          style={{ overflow: isDayCollapsed ? 'hidden' : 'visible' }}
                                          className="space-y-4 pt-4 pb-5"
                                        >
                                          {day.dayNumber === baseRealWorldDayIndex ? (
                                            renderTodayBuckets(day.dayNumber, 'problems')
                                          ) : day.dayNumber < baseRealWorldDayIndex ? (
                                            renderPastDay(day, 'problems')
                                          ) : (
                                            renderFutureDay(day, 'problems')
                                          )}
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
