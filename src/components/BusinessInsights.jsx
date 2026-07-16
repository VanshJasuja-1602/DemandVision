import { useMemo } from 'react';
import { calculateCalendarFeatures } from '../utils/calendarFeatures';
import { 
  TrendingUp, 
  TrendingDown, 
  Tag, 
  Percent, 
  Calendar, 
  Sparkles, 
  Lightbulb 
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Evaluates forecast statistics and outputs cards containing natural language recommendations.
 */
export function BusinessInsights({ data }) {
  const insights = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const results = [];

    // Pre-calculate features for each row
    const enriched = data.map(row => {
      const calendar = calculateCalendarFeatures(row.date) || {};
      return {
        ...row,
        weekday: calendar.weekdayName,
        isWeekend: calendar.isWeekend === 1
      };
    });

    const count = enriched.length;

    // 1. Identify Peak Date & Weekday Name
    let highestRow = enriched[0];
    enriched.forEach(row => {
      if (row.predictedDemand > highestRow.predictedDemand) {
        highestRow = row;
      }
    });

    results.push({
      id: 'peak-date',
      title: 'Peak Demand Targeted',
      text: `The peak demand date is forecasted to be ${highestRow.date} (${highestRow.weekday}) with a volume of ${highestRow.predictedDemand.toLocaleString()} units.`,
      icon: Sparkles,
      color: 'from-amber-500/10 to-orange-500/10 text-amber-700 border-amber-100'
    });

    // 2. Highest Weekday Average
    const weekdayDemands = {}; // { 'Monday': [demand1, demand2...]}
    enriched.forEach(row => {
      if (!weekdayDemands[row.weekday]) weekdayDemands[row.weekday] = [];
      weekdayDemands[row.weekday].push(row.predictedDemand);
    });

    let bestDay = '';
    let bestAvg = -Infinity;
    Object.keys(weekdayDemands).forEach(day => {
      const avg = weekdayDemands[day].reduce((a, b) => a + b, 0) / weekdayDemands[day].length;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestDay = day;
      }
    });

    if (bestDay) {
      results.push({
        id: 'peak-weekday',
        title: `Peak Demand Day: ${bestDay}`,
        text: `The highest average forecasted demand occurs on ${bestDay}, averaging ${Math.round(bestAvg).toLocaleString()} units. Ensure adequate staffing and logistics for this weekday cycle.`,
        icon: Calendar,
        color: 'from-indigo-500/10 to-blue-500/10 text-indigo-700 border-indigo-100'
      });
    }

    // 3. Weekend vs Weekday Lifts
    const weekendRows = enriched.filter(r => r.isWeekend);
    const weekdayRows = enriched.filter(r => !r.isWeekend);

    if (weekendRows.length > 0 && weekdayRows.length > 0) {
      const weekendAvg = weekendRows.reduce((sum, r) => sum + r.predictedDemand, 0) / weekendRows.length;
      const weekdayAvg = weekdayRows.reduce((sum, r) => sum + r.predictedDemand, 0) / weekdayRows.length;

      if (weekendAvg > weekdayAvg) {
        const lift = Math.round(((weekendAvg - weekdayAvg) / weekdayAvg) * 100);
        results.push({
          id: 'weekend-lift',
          title: 'Weekend Volume Expansion',
          text: `Average demand is ${lift}% higher on weekends (averaging ${Math.round(weekendAvg).toLocaleString()} units) compared to weekdays (${Math.round(weekdayAvg).toLocaleString()} units), suggesting strong leisure-time shopping behavior.`,
          icon: Lightbulb,
          color: 'from-cyan-500/10 to-blue-500/10 text-cyan-700 border-cyan-100'
        });
      }
    }

    // 4. Promo Efficacy
    const promoRows = enriched.filter(r => r.promotion === 1);
    const nonPromoRows = enriched.filter(r => r.promotion === 0);

    if (promoRows.length > 0 && nonPromoRows.length > 0) {
      const promoAvg = promoRows.reduce((sum, r) => sum + r.predictedDemand, 0) / promoRows.length;
      const nonPromoAvg = nonPromoRows.reduce((sum, r) => sum + r.predictedDemand, 0) / nonPromoRows.length;

      if (promoAvg > nonPromoAvg) {
        const lift = Math.round(((promoAvg - nonPromoAvg) / nonPromoAvg) * 100);
        results.push({
          id: 'promo-lift',
          title: 'Marketing Campaign Yield',
          text: `Demand increases during promotion days, averaging ${Math.round(promoAvg).toLocaleString()} units (+${lift}% lift) compared to non-promotional periods (${Math.round(nonPromoAvg).toLocaleString()} units).`,
          icon: Tag,
          color: 'from-teal-500/10 to-emerald-500/10 text-teal-700 border-teal-100'
        });
      }
    }

    // 5. Discount Impact correlation
    const discountRows = enriched.filter(r => r.discount > 0);
    const zeroDiscountRows = enriched.filter(r => r.discount === 0);

    if (discountRows.length > 0 && zeroDiscountRows.length > 0) {
      const discAvg = discountRows.reduce((sum, r) => sum + r.predictedDemand, 0) / discountRows.length;
      const flatAvg = zeroDiscountRows.reduce((sum, r) => sum + r.predictedDemand, 0) / zeroDiscountRows.length;

      if (discAvg > flatAvg) {
        results.push({
          id: 'discount-lift',
          title: 'Discount Elasticity Lift',
          text: "Higher discounts coincide with increased forecasted demand, demonstrating customer price sensitivity. Discount campaigns can be leveraged to clear surplus inventories.",
          icon: Percent,
          color: 'from-purple-500/10 to-pink-500/10 text-purple-700 border-purple-100'
        });
      }
    }

    // 6. Upward/Downward overall trend
    if (count > 1) {
      const firstVal = enriched[0].predictedDemand;
      const lastVal = enriched[count - 1].predictedDemand;
      const pct = Math.round(((lastVal - firstVal) / firstVal) * 100);

      if (pct > 5) {
        results.push({
          id: 'trend-insight',
          title: 'Upward Sales Velocity',
          text: `The forecast shows an upward demand trend. Predicted volume increases by ${pct}% from the starting date (${enriched[0].date}) to the terminal forecasting day (${enriched[count - 1].date}).`,
          icon: TrendingUp,
          color: 'from-emerald-500/10 to-teal-500/10 text-emerald-700 border-emerald-100'
        });
      } else if (pct < -5) {
        results.push({
          id: 'trend-insight',
          title: 'Downward Sales Velocity',
          text: `The forecast shows a downward demand trend. Predicted volume contracts by ${Math.abs(pct)}% over the forecasting period. Consider pricing reductions to stabilize demand.`,
          icon: TrendingDown,
          color: 'from-rose-500/10 to-orange-500/10 text-rose-700 border-rose-100'
        });
      }
    }

    return results;
  }, [data]);

  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="font-display font-bold text-slate-800 text-base">Model serving insights</h3>
        <p className="text-xs text-slate-400">Rule-based analytical observations extracted from current predictions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.map((insight, idx) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-5 rounded-3xl bg-gradient-to-br ${insight.color} border flex items-start gap-4 shadow-sm`}
            >
              <div className="p-2 rounded-xl bg-white shadow-sm shrink-0 mt-0.5">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">{insight.title}</h4>
                <p className="text-xs text-slate-600 font-light leading-relaxed">{insight.text}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
export default BusinessInsights;
