/**
 * Computes statistical and business summaries from the normalized forecast results.
 * Used for building KPI cards, visual highlights, and trend metrics.
 * 
 * @param {Array} normalizedData - Array of normalized prediction records
 * @returns {Object} Metric values for presentation
 */
export function calculateForecastStats(normalizedData) {
  if (!normalizedData || normalizedData.length === 0) {
    return {
      totalDemand: 0,
      averageDemand: 0,
      highestDemand: 0,
      lowestDemand: 0,
      peakDate: 'N/A',
      troughDate: 'N/A',
      totalPromoDays: 0,
      averagePrice: 0,
      averageDiscount: 0,
      trendPercent: 0,
      count: 0
    };
  }

  const count = normalizedData.length;
  let totalDemand = 0;
  let highestDemand = -Infinity;
  let lowestDemand = Infinity;
  let peakDate = '';
  let troughDate = '';
  let totalPromoDays = 0;
  let totalPrice = 0;
  let totalDiscount = 0;

  normalizedData.forEach(row => {
    totalDemand += row.predictedDemand;
    totalPrice += row.price;
    totalDiscount += row.discount;
    
    if (row.promotion === 1 || row.promotion === true) {
      totalPromoDays += 1;
    }

    if (row.predictedDemand > highestDemand) {
      highestDemand = row.predictedDemand;
      peakDate = row.date;
    }
    
    if (row.predictedDemand < lowestDemand) {
      lowestDemand = row.predictedDemand;
      troughDate = row.date;
    }
  });

  const averageDemand = Math.round(totalDemand / count);
  const averagePrice = Math.round((totalPrice / count) * 100) / 100;
  const averageDiscount = Math.round((totalDiscount / count) * 100) / 100;

  // Percentage difference between the first and last forecast days
  let trendPercent = 0;
  if (count > 1) {
    const firstDayDemand = normalizedData[0].predictedDemand;
    const lastDayDemand = normalizedData[count - 1].predictedDemand;
    if (firstDayDemand > 0) {
      trendPercent = Math.round(((lastDayDemand - firstDayDemand) / firstDayDemand) * 1000) / 10;
    }
  }

  return {
    totalDemand,
    averageDemand,
    highestDemand: highestDemand === -Infinity ? 0 : highestDemand,
    lowestDemand: lowestDemand === Infinity ? 0 : lowestDemand,
    peakDate: peakDate || 'N/A',
    troughDate: troughDate || 'N/A',
    totalPromoDays,
    averagePrice,
    averageDiscount,
    trendPercent,
    count
  };
}

export default calculateForecastStats;
