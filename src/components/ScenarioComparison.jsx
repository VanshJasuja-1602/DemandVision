import { useState } from 'react';
import { fetchDemandForecast } from '../services/databricksApi';
import { calculateCalendarFeatures } from '../utils/calendarFeatures';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Play, 
  TrendingUp, 
  Tag, 
  IndianRupee, 
  Percent, 
  Trophy, 
  Info,
  Loader2 
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Custom Tooltip for the Scenario Grouped Bar Chart.
 */
function ComparisonTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-lg text-left text-xs space-y-2 backdrop-blur-sm">
        <div className="border-b border-slate-100 pb-1 font-bold text-slate-800 font-mono">
          Date: {label}
        </div>
        <div className="space-y-1">
          {payload.map((p, i) => (
            <div key={i} className="flex justify-between items-center gap-6">
              <span className="flex items-center gap-1.5 font-light text-slate-500">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                {p.name}:
              </span>
              <span className="font-bold text-slate-800 font-mono">
                {p.value.toLocaleString()} units
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

/**
 * Handles comparative pipelines (Baseline vs Promo vs Discount vs Premium Price)
 * to evaluate sales sensitivity.
 */
export function ScenarioComparison({ baseRows }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scenariosData, setScenariosData] = useState(null);

  const runAnalysis = async () => {
    if (!baseRows || baseRows.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Establish the four parameter configurations
      const baselineRows = baseRows.map(r => ({ ...r }));
      
      const promoRows = baseRows.map(r => ({
        ...r,
        promotion: 1
      }));

      const discountRows = baseRows.map(r => ({
        ...r,
        discount: Math.min(25, Number(r.discount) + 15)
      }));

      const priceRows = baseRows.map(r => ({
        ...r,
        price: Number((Number(r.price) * 1.2).toFixed(2))
      }));

      // 2. Fetch predictions in batch
      const [baselineRes, promoRes, discountRes, priceRes] = await Promise.all([
        fetchDemandForecast(baselineRows),
        fetchDemandForecast(promoRows),
        fetchDemandForecast(discountRows),
        fetchDemandForecast(priceRows)
      ]);

      // 3. Compile statistics
      const totalBaseline = baselineRes.reduce((sum, r) => sum + r.predictedDemand, 0);
      const totalPromo = promoRes.reduce((sum, r) => sum + r.predictedDemand, 0);
      const totalDiscount = discountRes.reduce((sum, r) => sum + r.predictedDemand, 0);
      const totalPrice = priceRes.reduce((sum, r) => sum + r.predictedDemand, 0);

      const compilations = [
        {
          id: 'baseline',
          name: 'Baseline Scenario',
          desc: 'Current form values',
          total: totalBaseline,
          pctChange: 0,
          color: '#4f46e5',
          icon: TrendingUp
        },
        {
          id: 'promotion',
          name: 'Promotion Lift',
          desc: 'Campaign active (100% days)',
          total: totalPromo,
          pctChange: totalBaseline > 0 ? Math.round(((totalPromo - totalBaseline) / totalBaseline) * 100) : 0,
          color: '#10b981',
          icon: Tag
        },
        {
          id: 'discount',
          name: 'Discount Boost',
          desc: 'Base discounts +15% off',
          total: totalDiscount,
          pctChange: totalBaseline > 0 ? Math.round(((totalDiscount - totalBaseline) / totalBaseline) * 100) : 0,
          color: '#8b5cf6',
          icon: Percent
        },
        {
          id: 'pricing',
          name: 'Premium Pricing',
          desc: 'Pricing list +20% hike',
          total: totalPrice,
          pctChange: totalBaseline > 0 ? Math.round(((totalPrice - totalBaseline) / totalBaseline) * 100) : 0,
          color: '#f59e0b',
          icon: IndianRupee
        }
      ];

      // 4. Combine row by row datasets for grouped Recharts bar chart
      const chartRows = baseRows.map((row, idx) => {
        return {
          date: row.date,
          'Baseline': baselineRes[idx]?.predictedDemand || 0,
          'Promotion Lift': promoRes[idx]?.predictedDemand || 0,
          'Discount Boost': discountRes[idx]?.predictedDemand || 0,
          'Premium Pricing': priceRes[idx]?.predictedDemand || 0
        };
      });

      setScenariosData({
        compilations,
        chartRows
      });

    } catch (err) {
      console.error("Scenario batch fetching error:", err);
      setError(err.message || "Unable to retrieve scenario predictions from Databricks.");
    } finally {
      setLoading(false);
    }
  };

  // Find best scenario (maximizing volume)
  const bestScenario = scenariosData
    ? [...scenariosData.compilations].sort((a, b) => b.total - a.total)[0]
    : null;

  return (
    <section id="scenarios" className="py-16 border-t border-slate-100 bg-slate-50/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Scenario Planner & Elasticity
          </h2>
          <p className="mt-4 text-lg text-slate-500 leading-relaxed font-light">
            Evaluate how pricing adjustments, discount changes, and marketing promotions affect sales. Runs comparative model iterations side-by-side.
          </p>
        </div>

        {/* Action Execute Panel */}
        {!scenariosData && !loading && (
          <div className="max-w-xl mx-auto rounded-3xl bg-white p-8 border border-slate-100 shadow-sm text-center space-y-6">
            <Info className="h-10 w-10 text-indigo-500 mx-auto" />
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">Compare Forecast Scenarios</h4>
              <p className="text-xs text-slate-500 font-light leading-relaxed">
                We will evaluate the current configurations, generate promotional models, hike discounts, and raise price sheets to compare projected output side-by-side.
              </p>
            </div>
            <button
              onClick={runAnalysis}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-150 transition-all cursor-pointer"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Execute Scenario Analysis</span>
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="max-w-xl mx-auto rounded-3xl bg-white p-8 border border-slate-100 shadow-sm text-center space-y-4">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm animate-pulse">Running scenarios on Databricks...</h4>
            <p className="text-xs text-slate-400 font-light">
              Submitting baseline, promo lift, discount boost, and premium pricing models. This involves 4 distinct runs.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-xl mx-auto rounded-3xl border border-rose-100 bg-rose-50/20 p-6 text-center space-y-3">
            <h4 className="font-bold text-rose-700 text-sm">Scenario Execution Failed</h4>
            <p className="text-xs text-slate-600 font-light">{error}</p>
            <button 
              onClick={runAnalysis}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Analysis Results Display */}
        {scenariosData && !loading && (
          <div className="space-y-8">
            
            {/* Compilations KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {scenariosData.compilations.map((scenario) => {
                const Icon = scenario.icon;
                const isBest = bestScenario && bestScenario.id === scenario.id;

                return (
                  <motion.div
                    key={scenario.id}
                    className={`bg-white p-5 rounded-3xl border shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[160px] ${
                      isBest ? 'ring-2 ring-indigo-600' : 'border-slate-100'
                    }`}
                    whileHover={{ y: -2 }}
                  >
                    {/* Best Scenario Badge */}
                    {isBest && (
                      <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-extrabold px-3.5 py-1 rounded-bl-xl flex items-center gap-1 shadow-sm">
                        <Trophy className="h-3 w-3" />
                        <span>VOLUME WINNER</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{scenario.name}</h4>
                        <p className="text-[10px] text-slate-400 font-light mt-0.5">{scenario.desc}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-2xl font-extrabold font-display text-slate-800">
                        {scenario.total.toLocaleString()}
                        <span className="text-xs font-semibold text-slate-500 ml-1">units</span>
                      </div>
                      
                      {/* Percent Change Badge */}
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-light">Accumulated demand</span>
                        {scenario.id !== 'baseline' && (
                          <span className={`text-xs font-bold ${
                            scenario.pctChange > 0 ? 'text-teal-600' : 
                            scenario.pctChange < 0 ? 'text-rose-600' : 'text-slate-500'
                          }`}>
                            {scenario.pctChange > 0 ? `+${scenario.pctChange}%` : `${scenario.pctChange}%`} vs base
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Comparison Grouped Bar Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="text-left border-b border-slate-100 pb-3">
                <h3 className="font-display font-bold text-slate-800 text-base">Grouped Scenario demand Trend</h3>
                <p className="text-xs text-slate-400">Date-by-date projection comparison across all scenarios</p>
              </div>

              <div className="h-[280px] sm:h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={scenariosData.chartRows}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
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
                    <Tooltip content={<ComparisonTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 11, pt: 10 }} />
                    
                    <Bar dataKey="Baseline" fill="#4f46e5" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Promotion Lift" fill="#10b981" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Discount Boost" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Premium Pricing" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recalculate CTA */}
            <div className="flex justify-center">
              <button
                onClick={runAnalysis}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Re-run Scenario Forecasts</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
export default ScenarioComparison;
