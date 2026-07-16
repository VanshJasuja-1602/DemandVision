import { useState, useRef } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Area 
} from 'recharts';
import { Shield, ShieldOff, Table, Download, Eye, EyeOff } from 'lucide-react';
import { calculateCalendarFeatures } from '../utils/calendarFeatures';

/**
 * Custom interactive HTML tooltip rendering for Recharts hover nodes.
 */
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const calendar = calculateCalendarFeatures(data.date) || {};

    return (
      <div className="rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-lg text-left text-xs space-y-2 backdrop-blur-sm max-w-[200px]">
        <div className="border-b border-slate-100 pb-1.5">
          <span className="font-bold text-slate-800 block font-mono">{data.date}</span>
          <span className="text-[10px] text-slate-400 font-light">{calendar.weekdayName}, {calendar.monthName}</span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Forecast:</span>
            <span className="font-bold text-slate-800 font-mono">{data.predictedDemand.toLocaleString()} u</span>
          </div>

          {data.lowerBound !== undefined && (
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>95% CI Range:</span>
              <span className="font-mono">{data.lowerBound} - {data.upperBound}</span>
            </div>
          )}

          <div className="h-px bg-slate-100 my-1" />

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Price:</span>
            <span className="font-semibold text-slate-700">₹{data.price.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Discount:</span>
            <span className="font-semibold text-indigo-600 font-mono">{data.discount}%</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Promotion:</span>
            <span className={`font-bold ${data.promotion === 1 ? 'text-emerald-600' : 'text-slate-400'}`}>
              {data.promotion === 1 ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

/**
 * Primary visualization displaying predicted demand curves.
 * Offers visual switches for line/bar types, confidence bounds, and data tables.
 */
export function DemandChart({ data }) {
  const [showCI, setShowCI] = useState(true);
  const [showTable, setShowTable] = useState(false);
  const chartContainerRef = useRef(null);

  if (!data || data.length === 0) return null;

  // Formats X-axis date stamps nicely (e.g., "17 Jul")
  const formatXAxis = (tickItem) => {
    try {
      const parts = tickItem.split('-');
      if (parts.length !== 3) return tickItem;
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return `${day} ${months[monthIdx]}`;
    } catch (e) {
      return tickItem;
    }
  };

  // Triggers vector SVG export download of the chart node
  const handleExportSVG = () => {
    try {
      const svgNode = chartContainerRef.current.querySelector('svg');
      if (!svgNode) return;

      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgNode);

      // Add XML namespaces if not present
      if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
      }

      // Add a white background for print/display context
      source = source.replace(/^<svg/, '<svg style="background-color: white;"');

      const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
      
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `demandvision_chart_${new Date().toISOString().split('T')[0]}.svg`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Failed to export chart SVG:", e);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
      
      {/* Toolbar Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="text-left">
          <h3 className="font-display font-bold text-slate-800 text-base">Forecasted Demand Trend</h3>
          <p className="text-xs text-slate-400">Daily projections alongside confidence limits</p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">


          {/* Confidence Intervals Toggle */}
          <button
            onClick={() => setShowCI(!showCI)}
            title={showCI ? "Hide Confidence Intervals" : "Show Confidence Intervals"}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              showCI
                ? 'bg-indigo-50 border-indigo-100 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
            }`}
          >
            {showCI ? <Shield className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Intervals</span>
          </button>

          {/* Inline Data Table Toggle */}
          <button
            onClick={() => setShowTable(!showTable)}
            title="Toggle data table preview"
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              showTable
                ? 'bg-cyan-50 border-cyan-100 text-cyan-700'
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
            }`}
          >
            <Table className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Table Overlay</span>
          </button>

          {/* Download Chart button */}
          <button
            onClick={handleExportSVG}
            title="Download chart as SVG image"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export SVG</span>
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      <div ref={chartContainerRef} className="h-[280px] sm:h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6"/>
                <stop offset="100%" stopColor="#06b6d4"/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              dy={8}
            />
            
            <YAxis 
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              dx={-8}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />

            {/* Shaded Confidence Interval Range Area */}
            {showCI && (
              <Area
                type="monotone"
                dataKey="upperBound"
                // Recharts trick to shade between boundaries
                stroke="none"
                fill="#8b5cf6"
                fillOpacity={0.08}
                name="95% CI Boundary"
              />
            )}

            {/* Chart types */}
            <Area 
              type="monotone" 
              dataKey="predictedDemand" 
              stroke="none" 
              fill="url(#colorDemand)" 
            />
            <Line 
              type="monotone" 
              dataKey="predictedDemand" 
              stroke="#4f46e5" 
              strokeWidth={3} 
              dot={{ r: 4, strokeWidth: 1.5, fill: '#ffffff', stroke: '#4f46e5' }}
              activeDot={{ r: 6, strokeWidth: 2, fill: '#4f46e5', stroke: '#ffffff' }}
              name="Forecasted Demand"
            />

            {/* Confidence boundaries dashed lines */}
            {showCI && (
              <>
                <Line 
                  type="monotone" 
                  dataKey="upperBound" 
                  stroke="#8b5cf6" 
                  strokeWidth={1.2} 
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={false}
                  name="Upper CI (95%)"
                />
                <Line 
                  type="monotone" 
                  dataKey="lowerBound" 
                  stroke="#8b5cf6" 
                  strokeWidth={1.2} 
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={false}
                  name="Lower CI (95%)"
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* DemandVision Watermark Label */}
      <div className="text-center pt-2">
        <span className="font-display text-sm font-bold tracking-widest text-slate-400 uppercase select-none">
          DemandVision
        </span>
      </div>

      {/* Inline Data Table Overlay (Toggleable accessibility feature) */}
      {showTable && (
        <div className="overflow-x-auto rounded-xl border border-slate-100 bg-slate-50/50 p-2 mt-4 text-[11px]">
          <table className="min-w-full text-left font-mono">
            <thead>
              <tr className="border-b border-slate-200/50 text-slate-400">
                <th className="p-2">Date</th>
                <th className="p-2 text-right">Price</th>
                <th className="p-2 text-right">Discount</th>
                <th className="p-2 text-center">Promo</th>
                <th className="p-2 text-right">Demand</th>
                {showCI && <th className="p-2 text-right">95% CI Range</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row) => (
                <tr key={row.date} className="hover:bg-slate-100/50 text-slate-600">
                  <td className="p-2 font-bold">{row.date}</td>
                  <td className="p-2 text-right">₹{row.price.toFixed(2)}</td>
                  <td className="p-2 text-right">{row.discount}%</td>
                  <td className="p-2 text-center">{row.promotion === 1 ? 'YES' : 'NO'}</td>
                  <td className="p-2 text-right text-indigo-700 font-bold">{row.predictedDemand.toLocaleString()}</td>
                  {showCI && (
                    <td className="p-2 text-right text-slate-450">
                      {row.lowerBound} - {row.upperBound}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
export default DemandChart;
