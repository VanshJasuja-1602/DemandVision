import { useState, useEffect } from 'react';
import { calculateCalendarFeatures } from '../utils/calendarFeatures';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Layers, HelpCircle, CalendarDays } from 'lucide-react';

/**
 * Expandable Accordion component previewing calculated cyclical calendar features
 * (trig transforms, weekend flags) for the model's consumption.
 */
export function CalendarFeaturePreview({ dateString, availableDates = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dateString);

  // Keep selected date in sync with single mode date updates
  useEffect(() => {
    if (dateString) {
      setSelectedDate(dateString);
    }
  }, [dateString]);

  // If availableDates is updated, ensure selectedDate is in the list
  useEffect(() => {
    if (availableDates.length > 0 && !availableDates.includes(selectedDate)) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates]);

  let features = null;
  try {
    if (selectedDate) {
      features = calculateCalendarFeatures(selectedDate);
    }
  } catch (e) {
    // Suppress partial input errors
  }

  // Define grid items
  const items = features
    ? [
        { label: "Is Weekend", value: features.isWeekend, badge: features.isWeekend === 1 ? "Weekend" : "Weekday", color: "from-blue-50 to-indigo-50 border-indigo-100 text-indigo-700" },
        { label: "Day of Week Index", value: features.adjustedDayOfWeek, badge: features.weekdayName, color: "from-cyan-50 to-blue-50 border-cyan-100 text-cyan-700" },
        { label: "Day of Week (Sin)", value: Number(features.dayOfWeekSin).toFixed(4), desc: "Cyclical week transform", color: "from-teal-50 to-cyan-50 border-teal-100 text-teal-700" },
        { label: "Day of Week (Cos)", value: Number(features.dayOfWeekCos).toFixed(4), desc: "Cyclical week transform", color: "from-emerald-50 to-teal-50 border-emerald-100 text-emerald-700" },
        { label: "Month Index", value: features.month, badge: features.monthName, color: "from-purple-50 to-pink-50 border-purple-100 text-purple-700" },
        { label: "Month (Sin)", value: Number(features.monthSin).toFixed(4), desc: "Cyclical year transform", color: "from-fuchsia-50 to-purple-50 border-fuchsia-100 text-fuchsia-700" },
        { label: "Month (Cos)", value: Number(features.monthCos).toFixed(4), desc: "Cyclical year transform", color: "from-pink-50 to-rose-50 border-pink-100 text-pink-700" }
      ]
    : [];

  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    show: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 350, damping: 25 } }
  };

  return (
    <div className="w-full border border-slate-100 bg-white rounded-3xl overflow-hidden shadow-sm">
      
      {/* Header Button Accordion Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors text-left focus:outline-none cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-800 text-sm">
              Automatically Generated Calendar Features
            </h3>
            <p className="text-xs text-slate-500 font-light">
              Cyclical coordinates calculated client-side to feed the SARIMAX regression.
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
      </button>

      {/* Expandable Content Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden bg-slate-50/30 border-t border-slate-100"
          >
            <div className="p-6 space-y-6">
              
              {/* Optional multi-day target date picker */}
              {availableDates.length > 1 && (
                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 inline-flex">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Inspect date:</span>
                  </span>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg p-1.5 border border-slate-200 focus:outline-none cursor-pointer"
                  >
                    {availableDates.map((d, i) => (
                      <option key={d} value={d}>
                        Day #{i + 1} ({d})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {features ? (
                <>
                  {/* Grid of Micro-cards */}
                  <motion.div 
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4"
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                  >
                    {items.map((item, idx) => (
                      <motion.div
                        key={idx}
                        variants={cardVariants}
                        className={`flex flex-col justify-between p-3.5 rounded-2xl border ${item.color} shadow-sm relative overflow-hidden`}
                      >
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          {item.label}
                        </span>
                        
                        <div className="mt-4">
                          <span className="text-lg font-extrabold font-mono tracking-tight text-slate-800">
                            {item.value}
                          </span>
                          
                          {item.badge ? (
                            <span className="block mt-1 text-[9px] font-bold py-0.5 px-1.5 bg-white border border-slate-100 rounded-md inline-block">
                              {item.badge}
                            </span>
                          ) : (
                            <span className="block mt-1 text-[9px] text-slate-400 font-light leading-normal">
                              {item.desc}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Informational Note */}
                  <div className="flex gap-2.5 items-start p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/40">
                    <HelpCircle className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-indigo-950 font-light text-left leading-relaxed">
                      <strong>Automatic Feature Engineering:</strong> To maximize accuracy, the SARIMAX model incorporates time cycles rather than absolute timestamps. These cyclical transforms are computed client-side for validation and transparency, but the Databricks model serving wrapper handles them internally as well. No manual inputs are needed.
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400">Select a valid date above to engineer cyclical calendar features.</p>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
export default CalendarFeaturePreview;
