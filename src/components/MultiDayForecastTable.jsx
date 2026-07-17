import { Trash2, Copy, CopyCheck, Eraser, Plus, HelpCircle, ArrowDown } from 'lucide-react';
import { calculateCalendarFeatures } from '../utils/calendarFeatures';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * An interactive, editable grid showing consecutive future dates.
 * Offers cell validation, bulk copies, bulk applications, row insertions, and deletions.
 */
export function MultiDayForecastTable({ rows, setRows }) {
  
  // Re-calculates dates to ensure they remain sequential starting from index 0 date
  const adjustDates = (targetRows) => {
    if (targetRows.length === 0) return targetRows;
    const startStr = targetRows[0].date;
    const parts = startStr.split('-');
    let current;
    if (parts.length === 3) {
      current = new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
    } else {
      current = new Date(startStr);
    }
    
    return targetRows.map((row, idx) => {
      if (idx > 0) {
        current.setUTCDate(current.getUTCDate() + 1);
      }
      return {
        ...row,
        date: current.toISOString().split('T')[0]
      };
    });
  };

  // Modify cell values
  const handleCellChange = (index, field, value) => {
    const updated = [...rows];
    updated[index] = {
      ...updated[index],
      [field]: value
    };

    // If changing the first row's date, we need to adjust subsequent consecutive dates
    if (field === 'date') {
      setRows(adjustDates(updated));
    } else {
      setRows(updated);
    }
  };

  // Add consecutive day to the end of the table
  const handleAddDay = () => {
    const lastRow = rows[rows.length - 1];
    let nextDateStr = new Date().toISOString().split('T')[0];
    
    if (lastRow && lastRow.date) {
      const parts = lastRow.date.split('-');
      let lastDate;
      if (parts.length === 3) {
        lastDate = new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
      } else {
        lastDate = new Date(lastRow.date);
      }
      lastDate.setUTCDate(lastDate.getUTCDate() + 1);
      nextDateStr = lastDate.toISOString().split('T')[0];
    }

    const newRow = {
      date: nextDateStr,
      price: lastRow ? lastRow.price : 100,
      discount: lastRow ? lastRow.discount : 0,
      promotion: lastRow ? lastRow.promotion : 0
    };

    setRows([...rows, newRow]);
  };

  // Remove day row from table
  const handleRemoveDay = (index) => {
    if (rows.length <= 1) return; // Prevent deleting the last row
    const filtered = rows.filter((_, idx) => idx !== index);
    setRows(adjustDates(filtered));
  };

  // Copy values from previous day
  const handleCopyPrevious = (index) => {
    if (index === 0) return;
    const updated = [...rows];
    updated[index] = {
      ...updated[index],
      price: updated[index - 1].price,
      discount: updated[index - 1].discount,
      promotion: updated[index - 1].promotion
    };
    setRows(updated);
  };

  // Apply row parameters to all other table rows
  const handleApplyToAll = (index) => {
    const sourceRow = rows[index];
    const updated = rows.map((row) => ({
      ...row,
      price: sourceRow.price,
      discount: sourceRow.discount,
      promotion: sourceRow.promotion
    }));
    setRows(updated);
  };

  // Resets price, discount, and promotion values to default baselines
  const handleClearAll = () => {
    const cleared = rows.map((row) => ({
      ...row,
      price: 100,
      discount: 0,
      promotion: 0
    }));
    setRows(cleared);
  };

  return (
    <div className="mt-8 space-y-4">
      
      {/* Action Toolbar Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="text-left">
          <h3 className="font-semibold text-slate-800 text-sm">Forecasting Days Config</h3>
          <p className="text-xs text-slate-500">Configure parameters for each consecutive calendar day.</p>
        </div>
        
        {/* General Table Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddDay}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Day</span>
          </button>
          
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 text-xs font-bold border border-slate-200 transition-all cursor-pointer"
          >
            <Eraser className="h-3.5 w-3.5" />
            <span>Clear Parameters</span>
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Day</th>
              <th scope="col" className="px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Date</th>
              <th scope="col" className="px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Price (₹)</th>
              <th scope="col" className="px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Discount (%)</th>
              <th scope="col" className="px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Promotion</th>
              <th scope="col" className="px-4 py-3.5 text-center font-semibold text-slate-500 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100 bg-white">
            <AnimatePresence initial={false}>
              {rows.map((row, index) => {
                let calendar = null;
                try {
                  calendar = calculateCalendarFeatures(row.date);
                } catch (e) {
                  // Catch partial dates
                }

                return (
                  <motion.tr
                    key={row.date + '-' + index}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`hover:bg-slate-50/50 transition-colors ${
                      calendar?.isWeekend ? 'bg-amber-50/10' : ''
                    }`}
                  >
                    {/* Index Day */}
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700 font-mono text-xs">
                      #{index + 1}
                    </td>

                    {/* Date Selector/Display */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex flex-col">
                        {index === 0 ? (
                          <input
                            type="date"
                            value={row.date}
                            onChange={(e) => handleCellChange(index, 'date', e.target.value)}
                            className="text-xs font-semibold p-1.5 bg-slate-100 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-32"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-slate-700 font-mono">{row.date}</span>
                        )}
                        {calendar && (
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            {calendar.weekdayName.substring(0, 3)}, {calendar.monthName.substring(0, 3)} {calendar.dayOfMonth}
                            {calendar.isWeekend === 1 && <span className="text-amber-600 font-medium ml-1">(Weekend)</span>}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Price Input */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="relative w-24">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-xs text-slate-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.price}
                          onChange={(e) => handleCellChange(index, 'price', e.target.value)}
                          className="w-full text-xs font-semibold pl-5 pr-1.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </td>

                    {/* Discount Input */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="relative w-20">
                        <input
                          type="number"
                          min="0"
                          max="25"
                          value={row.discount}
                          onChange={(e) => handleCellChange(index, 'discount', Math.min(25, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                          className="w-full text-xs font-semibold pl-2 pr-5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-[10px] text-slate-400 font-bold">%</span>
                      </div>
                    </td>

                    {/* Promotion Toggle */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleCellChange(index, 'promotion', row.promotion === 1 ? 0 : 1)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all border cursor-pointer ${
                          row.promotion === 1
                            ? 'bg-gradient-to-r from-indigo-550 to-indigo-600 border-indigo-600 text-white shadow-sm'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        {row.promotion === 1 ? 'Promo Active' : 'No Promo'}
                      </button>
                    </td>

                    {/* Action buttons */}
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Copy previous */}
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleCopyPrevious(index)}
                            title="Copy previous day's inputs"
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {/* Apply to all */}
                        <button
                          type="button"
                          onClick={() => handleApplyToAll(index)}
                          title="Apply this day's settings to all days"
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
                        >
                          <CopyCheck className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete row */}
                        <button
                          type="button"
                          onClick={() => handleRemoveDay(index)}
                          disabled={rows.length <= 1}
                          title="Remove day"
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            rows.length <= 1
                              ? 'text-slate-200 cursor-not-allowed'
                              : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                          }`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Helper text */}
      <p className="text-[11px] text-slate-400 text-left leading-normal flex items-start gap-1">
        <HelpCircle className="h-3.5 w-3.5 inline shrink-0 text-slate-400" />
        <span>Dates must remain consecutive. Changing the date of Day #1 automatically rolls dates forward for all subsequent rows.</span>
      </p>
    </div>
  );
}
export default MultiDayForecastTable;
