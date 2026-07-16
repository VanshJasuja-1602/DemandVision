import { useState, useMemo } from 'react';
import { calculateCalendarFeatures } from '../utils/calendarFeatures';
import { downloadAsCSV } from '../utils/exportForecast';
import { 
  ArrowUpDown, 
  Search, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  TrendingDown, 
  CalendarDays 
} from 'lucide-react';

/**
 * Detailed paginated grid showing calculated demands.
 * Highlights high/low peaks, weekend flags, and promotion intervals.
 */
export function ForecastResultsTable({ data }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date'); // 'date' | 'price' | 'discount' | 'demand'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [copied, setCopied] = useState(false);
  const itemsPerPage = 8;

  // Identify peak and trough values
  const { maxDemand, minDemand } = useMemo(() => {
    if (!data || data.length === 0) return { maxDemand: null, minDemand: null };
    let max = -Infinity;
    let min = Infinity;
    data.forEach(r => {
      if (r.predictedDemand > max) max = r.predictedDemand;
      if (r.predictedDemand < min) min = r.predictedDemand;
    });
    return { maxDemand: max, minDemand: min };
  }, [data]);

  // Adjust sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Process rows with sorting and searching
  const processedRows = useMemo(() => {
    if (!data) return [];
    
    // 1. Map calendar features for searching
    let rows = data.map((row) => {
      const calendar = calculateCalendarFeatures(row.date) || {};
      return {
        ...row,
        weekday: calendar.weekdayName || '',
        monthName: calendar.monthName || '',
        isWeekend: calendar.isWeekend === 1
      };
    });

    // 2. Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      rows = rows.filter(row => 
        row.date.includes(term) || 
        row.weekday.toLowerCase().includes(term) ||
        row.monthName.toLowerCase().includes(term)
      );
    }

    // 3. Sort rows
    rows.sort((a, b) => {
      let valA, valB;
      if (sortField === 'date') {
        valA = a.date;
        valB = b.date;
      } else if (sortField === 'price') {
        valA = a.price;
        valB = b.price;
      } else if (sortField === 'discount') {
        valA = a.discount;
        valB = b.discount;
      } else if (sortField === 'demand') {
        valA = a.predictedDemand;
        valB = b.predictedDemand;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return rows;
  }, [data, searchTerm, sortField, sortDirection]);

  // Paginated chunk
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedRows.slice(start, start + itemsPerPage);
  }, [processedRows, currentPage]);

  const totalPages = Math.ceil(processedRows.length / itemsPerPage);

  // Copy rows as clipboard string
  const handleCopyClipboard = () => {
    if (!data || data.length === 0) return;
    
    const header = "Date\tWeekday\tPrice\tDiscount\tPromotion\tDemand\tLower_CI\tUpper_CI\n";
    const body = data.map(row => {
      const calendar = calculateCalendarFeatures(row.date) || {};
      return `${row.date}\t${calendar.weekdayName}\t₹${row.price.toFixed(2)}\t${row.discount}%\t${row.promotion ? 'PROMO' : 'STANDARD'}\t${row.predictedDemand}\t${row.lowerBound}\t${row.upperBound}`;
    }).join("\n");

    navigator.clipboard.writeText(header + body)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error("Clipboard copy failed:", err);
      });
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
      
      {/* Table Toolbar controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search dates or weekdays..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-2xl p-2.5 pl-9 text-xs glass-input border border-slate-200"
          />
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleCopyClipboard}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-teal-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied Grid' : 'Copy Data'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => downloadAsCSV(data)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download CSV</span>
          </button>
        </div>

      </div>

      {/* Grid wrapper */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-inner">
        <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" onClick={() => handleSort('date')} className="px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider cursor-pointer hover:bg-slate-100 select-none">
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th scope="col" className="px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider select-none">Day</th>
              <th scope="col" onClick={() => handleSort('price')} className="px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider cursor-pointer hover:bg-slate-100 select-none">
                <div className="flex items-center gap-1">
                  <span>Price</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th scope="col" onClick={() => handleSort('discount')} className="px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider cursor-pointer hover:bg-slate-100 select-none">
                <div className="flex items-center gap-1">
                  <span>Discount</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th scope="col" className="px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider select-none">Promotion</th>
              <th scope="col" onClick={() => handleSort('demand')} className="px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider cursor-pointer hover:bg-slate-100 select-none">
                <div className="flex items-center gap-1 text-indigo-700">
                  <span>Forecast Demand</span>
                  <ArrowUpDown className="h-3 w-3 text-indigo-600" />
                </div>
              </th>
              <th scope="col" className="px-4 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider select-none">95% CI Range</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100 bg-white text-xs">
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row) => {
                const isPeak = row.predictedDemand === maxDemand;
                const isTrough = row.predictedDemand === minDemand;
                
                return (
                  <tr 
                    key={row.date} 
                    className={`hover:bg-slate-50/50 transition-colors ${
                      row.isWeekend ? 'bg-amber-50/15' : ''
                    } ${row.promotion === 1 ? 'bg-indigo-50/5' : ''}`}
                  >
                    {/* Date */}
                    <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-700 font-mono">
                      {row.date}
                    </td>
                    
                    {/* Day name */}
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600 font-medium">{row.weekday}</span>
                        {row.isWeekend && (
                          <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 border border-amber-200/50">
                            Weekend
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Unit Price */}
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600 font-medium">
                      ₹{row.price.toFixed(2)}
                    </td>

                    {/* Discount */}
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-slate-600 font-medium">
                      {row.discount}%
                    </td>

                    {/* Promotion status */}
                    <td className="whitespace-nowrap px-4 py-3.5">
                      {row.promotion === 1 ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-[9px] font-bold text-teal-700 border border-teal-200/60 shadow-sm animate-pulse">
                          <span className="h-1 w-1 bg-teal-500 rounded-full" />
                          <span>PROMO ACTIVE</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-light">None</span>
                      )}
                    </td>

                    {/* Predicted Demand value */}
                    <td className="whitespace-nowrap px-4 py-3.5 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-indigo-700 text-sm">
                          {row.predictedDemand.toLocaleString()}
                        </span>
                        
                        {/* Highlight Peak or Trough */}
                        {isPeak && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-purple-550 to-indigo-600 text-white px-2 py-0.5 text-[9px] font-bold shadow-sm shadow-purple-200">
                            <Sparkles className="h-2.5 w-2.5 animate-spin-slow" />
                            <span>PEAK</span>
                          </span>
                        )}
                        {isTrough && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 text-[9px] font-bold">
                            <TrendingDown className="h-2.5 w-2.5" />
                            <span>MIN</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Bounds */}
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-400 font-mono font-light">
                      {row.lowerBound.toLocaleString()} – {row.upperBound.toLocaleString()}
                    </td>

                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-slate-400 font-light">
                  No prediction records match your query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-500 font-light">
            Showing page <strong className="font-semibold text-slate-800">{currentPage}</strong> of <strong className="font-semibold text-slate-800">{totalPages}</strong> ({processedRows.length} total rows)
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer select-none transition-all ${
                currentPage === 1
                  ? 'border-slate-100 bg-white text-slate-300 cursor-not-allowed'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer select-none transition-all ${
                currentPage === totalPages
                  ? 'border-slate-100 bg-white text-slate-300 cursor-not-allowed'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
export default ForecastResultsTable;
