import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Cpu, Layers, BarChart2 } from 'lucide-react';

/**
 * Premium skeleton dashboard displaying stage-specific messaging
 * and pulsing layout panels to keep the user engaged during model execution.
 */
export function LoadingForecast() {
  const [stage, setStage] = useState(0);

  const stages = [
    { text: "Preparing calendar features...", icon: Layers, progress: 25 },
    { text: "Establishing secure token handshake...", icon: Database, progress: 50 },
    { text: "Running Databricks SARIMAX forecasting...", icon: Cpu, progress: 75 },
    { text: "Assembling business demand insights...", icon: BarChart2, progress: 95 }
  ];

  // Rotate messages to simulate progress
  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 500);
    const timer2 = setTimeout(() => setStage(2), 1100);
    const timer3 = setTimeout(() => setStage(3), 1600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const ActiveIcon = stages[stage].icon;

  return (
    <div className="w-full space-y-8 animate-pulse-slow">
      
      {/* Visual Loader Card */}
      <div className="rounded-3xl glass-panel p-8 border border-indigo-100 shadow-md text-center max-w-xl mx-auto flex flex-col items-center">
        
        {/* Pulsing Core */}
        <div className="relative flex items-center justify-center h-16 w-16 mb-6">
          <div className="absolute inset-0 rounded-2xl bg-indigo-500/25 animate-ping" />
          <div className="relative rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 p-4 text-white shadow-lg shadow-indigo-200">
            <ActiveIcon className="h-6 w-6" />
          </div>
        </div>

        {/* Text Sequence Transition */}
        <div className="h-14 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.h4
              key={stage}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-slate-800 font-bold text-base"
            >
              {stages[stage].text}
            </motion.h4>
          </AnimatePresence>
        </div>

        {/* Custom Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2 mb-4 border border-slate-200/50">
          <motion.div 
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400"
            initial={{ width: "5%" }}
            animate={{ width: `${stages[stage].progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Databricks served SARIMAX model inference active
        </span>

      </div>

      {/* Skeleton Dashboard Mockup */}
      <div className="space-y-6">
        
        {/* KPI Skeletons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
              <div className="h-3 w-16 bg-slate-100 rounded-full" />
              <div className="h-7 w-28 bg-slate-100 rounded-full" />
              <div className="h-3.5 w-full bg-slate-50 rounded-full" />
            </div>
          ))}
        </div>

        {/* Graph Skeleton */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-[320px] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-50">
            <div className="space-y-2">
              <div className="h-4.5 w-36 bg-slate-100 rounded-full" />
              <div className="h-3 w-24 bg-slate-50 rounded-full" />
            </div>
            <div className="flex gap-2">
              <div className="h-7 w-16 bg-slate-100 rounded-xl" />
              <div className="h-7 w-16 bg-slate-100 rounded-xl" />
            </div>
          </div>
          
          {/* Pulsing Chart Waveform */}
          <div className="flex-1 flex items-end justify-between px-4 py-8 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120">
              <path 
                d="M 10 90 Q 70 30 130 80 T 250 40 T 370 70" 
                fill="none" 
                stroke="#e2e8f0" 
                strokeWidth="4" 
                strokeLinecap="round" 
              />
              <path 
                d="M 10 90 Q 70 30 130 80 T 250 40 T 370 70" 
                fill="none" 
                stroke="#8b5cf6" 
                strokeWidth="4" 
                strokeDasharray="6 6"
                strokeLinecap="round"
                className="animate-pulse"
                opacity="0.3"
              />
            </svg>
          </div>

          <div className="h-3 w-40 bg-slate-100 rounded-full mx-auto" />
        </div>

      </div>

    </div>
  );
}
export default LoadingForecast;
