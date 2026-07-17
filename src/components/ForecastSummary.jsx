import { useEffect, useState } from 'react';
import { TrendingUp, Calendar, Zap, IndianRupee, Percent, Tag, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { calculateForecastStats } from '../utils/forecastCalculations';
import { calculateCalendarFeatures } from '../utils/calendarFeatures';
import { motion } from 'framer-motion';

/**
 * Lightweight, high-performance local counter animation.
 */
function CountUp({ to, duration = 1.2 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Number(to) || 0;
    if (end === 0) {
      setCount(0);
      return;
    }
    
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Ease out quad formula
      const easeProgress = progress * (2 - progress);
      
      setCount(Math.floor(easeProgress * (end - start) + start));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [to, duration]);

  return <span>{count.toLocaleString()}</span>;
}

/**
 * Renders statistical totals and aggregates from predictions.
 * Varies output between a single-day details layout and a multi-day KPI panel.
 */
export function ForecastSummary({ data, mode }) {
  if (!data || data.length === 0) return null;

  const stats = calculateForecastStats(data);

  // Layout for Single Day Forecast
  if (mode === 'single' || data.length === 1) {
    const row = data[0];
    let calendar = null;
    try {
      calendar = calculateCalendarFeatures(row.date);
    } catch (e) {}

    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        
        {/* Main predicted value hero */}
        <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-8 text-white shadow-lg shadow-indigo-150 flex flex-col justify-between text-left relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute right-0 bottom-0 h-48 w-48 bg-cyan-400 opacity-20 blur-3xl rounded-full" />
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-indigo-200 tracking-wider">
                Databricks SARIMAX prediction
              </span>
              {data.isCached && (
                <span className="inline-flex items-center rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-bold text-cyan-200 border border-cyan-400/35">
                  ⚡ Cached
                </span>
              )}
            </div>
            <h3 className="font-display font-extrabold text-2xl">Predicted Sales Demand</h3>
          </div>

          <div className="my-8">
            <div className="text-6xl sm:text-7xl font-extrabold font-display tracking-tight flex items-baseline">
              <CountUp to={row.predictedDemand} />
              <span className="text-xl font-medium text-indigo-200 ml-2">units</span>
            </div>
            
            {/* Confidence bounds */}
            <p className="text-xs text-indigo-100 font-light mt-2.5">
              95% Confidence interval bounds: <span className="font-mono font-semibold">{row.lowerBound.toLocaleString()}</span> to <span className="font-mono font-semibold">{row.upperBound.toLocaleString()}</span> units.
            </p>
          </div>

          {/* Date Stamp */}
          <div className="pt-4 border-t border-indigo-500/40 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-indigo-200" />
              <span className="font-semibold">{row.date}</span>
            </div>
            {calendar && (
              <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold">
                {calendar.weekdayName}, {calendar.monthName}
              </span>
            )}
          </div>

        </div>

        {/* Selected parameters review card */}
        <div className="rounded-3xl bg-white border border-slate-100 p-8 shadow-sm text-left flex flex-col justify-between">
          <h4 className="font-display font-bold text-slate-800 text-lg border-b border-slate-100 pb-3">
            Inference Parameters
          </h4>

          <div className="space-y-4 my-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 flex items-center gap-1.5 font-light">
                <IndianRupee className="h-4 w-4 text-indigo-500" /> Price Point
              </span>
              <span className="font-bold text-slate-700">₹{row.price.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 flex items-center gap-1.5 font-light">
                <Percent className="h-4 w-4 text-indigo-500" /> Discount Rate
              </span>
              <span className="font-bold text-indigo-600 font-mono">{row.discount}%</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 flex items-center gap-1.5 font-light">
                <Tag className="h-4 w-4 text-indigo-500" /> Promotion Campaign
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                row.promotion === 1 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : 'bg-slate-50 text-slate-500 border border-slate-100'
              }`}>
                {row.promotion === 1 ? 'Promo Active' : 'No Promo'}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 flex items-center gap-1.5 font-light">
                <Zap className="h-4 w-4 text-indigo-500" /> Weekend Impact
              </span>
              <span className="font-semibold text-slate-700">
                {calendar?.isWeekend === 1 ? 'Positive multiplier' : 'Standard pattern'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[10px] text-slate-400 leading-relaxed font-light">
            Inference computed in real-time. Features including `DayOfWeek_sin` and `Month_cos` engineered client-side.
          </div>

        </div>

      </motion.div>
    );
  }

  // Layout for Multi Day Forecast
  const kpiCards = [
    {
      label: 'Total Forecasted Demand',
      value: stats.totalDemand,
      suffix: 'units',
      desc: 'Accumulated volume across window',
      icon: TrendingUp,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      trend: stats.trendPercent
    },
    {
      label: 'Average Daily Demand',
      value: stats.averageDemand,
      suffix: 'units/day',
      desc: 'Forecast period daily mean',
      icon: Calendar,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
      trend: null
    },
    {
      label: 'Peak demand peak',
      value: stats.highestDemand,
      suffix: 'units',
      desc: `Occurs on ${stats.peakDate}`,
      icon: Zap,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      trend: null
    },
    {
      label: 'Promotion Lift Days',
      value: stats.totalPromoDays,
      suffix: `/ ${stats.count} Days`,
      desc: `Avg Price: ₹${stats.averagePrice.toFixed(2)}`,
      icon: Tag,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      trend: null
    }
  ];

  return (
    <div className="space-y-6">
      {data.isCached && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-2xl bg-teal-50 px-4 py-2 border border-teal-200/50 shadow-sm"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-700">
            <Zap className="h-3.5 w-3.5 text-teal-600 animate-pulse" />
            <span>Forecast results retrieved instantly from memory cache.</span>
          </div>
        </motion.div>
      )}
      {/* Grid of Multi-Day stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[140px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {card.label}
                </span>
                <div className={`p-1.5 rounded-xl border ${card.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold font-display text-slate-800">
                    <CountUp to={card.value} />
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {card.suffix}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between text-xs text-slate-400 font-light">
                  <span>{card.desc}</span>
                  {card.trend !== null && card.trend !== 0 && (
                    <span className={`inline-flex items-center gap-0.5 font-bold ${
                      card.trend > 0 ? 'text-teal-600' : 'text-rose-600'
                    }`}>
                      {card.trend > 0 ? (
                        <>
                          <ArrowUpRight className="h-3 w-3" />
                          <span>+{card.trend}%</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="h-3 w-3" />
                          <span>{card.trend}%</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
export default ForecastSummary;
