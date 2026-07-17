import { Calendar, IndianRupee, Percent, Tag, Sliders, CalendarDays } from 'lucide-react';
import { calculateCalendarFeatures } from '../utils/calendarFeatures';
import { motion } from 'framer-motion';

/**
 * Handles parameters for Single-day forecasting and establishes
 * parameters to initialize a Multi-day sequential table.
 */
export function ForecastForm({
  mode,
  setMode,
  singleRow,
  setSingleRow,
  multiParams,
  setMultiParams,
  errors,
  onSubmit,
  isLoading
}) {
  
  // Calculate calendar info for single date preview
  let calendarPreview = null;
  if (singleRow.date) {
    try {
      calendarPreview = calculateCalendarFeatures(singleRow.date);
    } catch (e) {
      // Ignore invalid date typing
    }
  }

  // Handle single row input updates
  const handleSingleChange = (field, value) => {
    setSingleRow(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle multi parameters updates
  const handleMultiParamChange = (field, value) => {
    setMultiParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full">
      {/* Tab Switcher */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-2xl bg-slate-100 p-1 border border-slate-200/50 shadow-inner">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${
              mode === 'single'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Single-Day Forecast</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('multi')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${
              mode === 'multi'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            <span>Multi-Day Forecast</span>
          </button>
        </div>
      </div>

      {/* Model Boundary Notice Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-left flex gap-2.5 items-start">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold font-mono font-semibold">!</span>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-slate-800">SARIMAX Model Date Constraint</h4>
          <p className="text-[11px] text-slate-500 font-light leading-relaxed">
            The Databricks model served endpoint was trained on historical data up to <strong>2024-01-30</strong>. Due to auto-regressive time-series constraints, the first forecast date must be exactly <strong>2024-01-31</strong>.
          </p>
        </div>
      </div>

      {mode === 'single' ? (
        /* Single-Day Input Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          
          {/* Date Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-indigo-500" />
              <span>Forecast Date</span>
            </label>
            <div className="relative">
              <input
                type="date"
                min="2024-01-31"
                value={singleRow.date}
                onChange={(e) => handleSingleChange('date', e.target.value)}
                className={`w-full rounded-2xl p-3.5 pl-4 text-sm glass-input border ${
                  errors.date ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200'
                }`}
              />
            </div>
            
            {/* Calendar Preview pill */}
            {calendarPreview && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 flex gap-1.5 flex-wrap"
              >
                <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 border border-indigo-100">
                  {calendarPreview.weekdayName}
                </span>
                <span className="inline-flex items-center rounded-lg bg-cyan-50 px-2 py-0.5 text-xs font-medium text-cyan-700 border border-cyan-100">
                  {calendarPreview.monthName}
                </span>
                {calendarPreview.isWeekend === 1 && (
                  <span className="inline-flex items-center rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-100">
                    Weekend
                  </span>
                )}
              </motion.div>
            )}
            {errors.date && <p className="text-xs text-rose-500 font-medium mt-1">{errors.date}</p>}
          </div>

          {/* Price Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <IndianRupee className="h-4 w-4 text-indigo-500" />
              <span>Price</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm">₹</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="100.00"
                value={singleRow.price}
                onChange={(e) => handleSingleChange('price', e.target.value)}
                className={`w-full rounded-2xl p-3.5 pl-7 text-sm glass-input border ${
                  errors.price ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200'
                }`}
              />
            </div>
            {errors.price && <p className="text-xs text-rose-500 font-medium mt-1">{errors.price}</p>}
          </div>

          {/* Discount Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Percent className="h-4 w-4 text-indigo-500" />
                <span>Discount</span>
              </span>
              <span className="text-xs font-bold text-indigo-600 font-mono">{singleRow.discount}%</span>
            </label>
            <div className="flex items-center gap-3 h-[46px]">
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={singleRow.discount}
                onChange={(e) => handleSingleChange('discount', parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <input
                type="number"
                min="0"
                max="25"
                value={singleRow.discount}
                onChange={(e) => handleSingleChange('discount', Math.min(25, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                className="w-16 text-center text-sm font-semibold text-slate-800 rounded-xl p-2 bg-slate-100 border border-slate-200"
              />
            </div>
            {errors.discount && <p className="text-xs text-rose-500 font-medium mt-1">{errors.discount}</p>}
          </div>

          {/* Promotion Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-indigo-500" />
              <span>Promotion Campaign</span>
            </label>
            <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1 border border-slate-200/50 h-[46px] items-center">
              <button
                type="button"
                onClick={() => handleSingleChange('promotion', 0)}
                className={`rounded-xl py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  singleRow.promotion === 0
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                No Promo
              </button>
              <button
                type="button"
                onClick={() => handleSingleChange('promotion', 1)}
                className={`rounded-xl py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  singleRow.promotion === 1
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Promo Active
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* Multi-Day Parameter Initializer */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 text-left">
          
          {/* Start Date */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-indigo-500" />
              <span>Forecast Start Date</span>
            </label>
            <input
              type="date"
              min="2024-01-31"
              value={multiParams.startDate}
              onChange={(e) => handleMultiParamChange('startDate', e.target.value)}
              className={`w-full rounded-2xl p-3.5 pl-4 text-sm glass-input border ${
                errors.startDate ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200'
              }`}
            />
            {errors.startDate && <p className="text-xs text-rose-500 font-medium mt-1">{errors.startDate}</p>}
          </div>

          {/* Number of Days */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-indigo-500" />
              <span>Duration (Days)</span>
            </label>
            <input
              type="number"
              min="2"
              max="30"
              value={multiParams.days}
              onChange={(e) => handleMultiParamChange('days', parseInt(e.target.value, 10) || 0)}
              className={`w-full rounded-2xl p-3.5 pl-4 text-sm glass-input border ${
                errors.days ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200'
              }`}
            />
            {errors.days && <p className="text-xs text-rose-500 font-medium mt-1">{errors.days}</p>}
          </div>

          {/* Baseline Price */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <IndianRupee className="h-4 w-4 text-indigo-500" />
              <span>Base Price</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm">₹</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={multiParams.price}
                onChange={(e) => handleMultiParamChange('price', e.target.value)}
                className={`w-full rounded-2xl p-3.5 pl-7 text-sm glass-input border ${
                  errors.price ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200'
                }`}
              />
            </div>
          </div>

          {/* Baseline Discount */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Percent className="h-4 w-4 text-indigo-500" />
                <span>Base Discount</span>
              </span>
              <span className="text-xs font-bold text-indigo-600 font-mono">{multiParams.discount}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={multiParams.discount}
              onChange={(e) => handleMultiParamChange('discount', parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 my-auto"
            />
          </div>

          {/* Baseline Promo */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-indigo-500" />
              <span>Base Promo</span>
            </label>
            <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1 border border-slate-200/50 h-[46px] items-center">
              <button
                type="button"
                onClick={() => handleMultiParamChange('promotion', 0)}
                className={`rounded-xl py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  multiParams.promotion === 0
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                No Promo
              </button>
              <button
                type="button"
                onClick={() => handleMultiParamChange('promotion', 1)}
                className={`rounded-xl py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  multiParams.promotion === 1
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Promo Active
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
export default ForecastForm;
