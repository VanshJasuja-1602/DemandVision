import { calculateCalendarFeatures } from './calendarFeatures';

/**
 * Generates and triggers download of a CSV file containing inputs,
 * engineered features, and forecasting bounds.
 * 
 * @param {Array} data - Normalized forecast array
 */
export function downloadAsCSV(data) {
  if (!data || data.length === 0) return;

  const headers = [
    "Date",
    "Price",
    "Discount",
    "Promotion",
    "IsWeekend",
    "DayOfWeek_sin",
    "DayOfWeek_cos",
    "Month_sin",
    "Month_cos",
    "Predicted_Demand",
    "Lower_95_CI",
    "Upper_95_CI"
  ];

  const rows = data.map(row => {
    const calendar = calculateCalendarFeatures(row.date) || {};
    return [
      row.date,
      row.price,
      row.discount,
      row.promotion ? 1 : 0,
      calendar.isWeekend ?? 0,
      calendar.dayOfWeekSin !== undefined ? Number(calendar.dayOfWeekSin).toFixed(6) : 0,
      calendar.dayOfWeekCos !== undefined ? Number(calendar.dayOfWeekCos).toFixed(6) : 0,
      calendar.monthSin !== undefined ? Number(calendar.monthSin).toFixed(6) : 0,
      calendar.monthCos !== undefined ? Number(calendar.monthCos).toFixed(6) : 0,
      row.predictedDemand,
      row.lowerBound,
      row.upperBound
    ];
  });

  const csvContent = "data:text/csv;charset=utf-8," 
    + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `demandvision_forecast_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Triggers JSON download of the forecast data structure.
 * 
 * @param {Array} data - Normalized forecast array
 */
export function downloadAsJSON(data) {
  if (!data || data.length === 0) return;

  const exportData = data.map(row => {
    const calendar = calculateCalendarFeatures(row.date) || {};
    return {
      Date: row.date,
      Price: row.price,
      Discount: row.discount,
      Promotion: row.promotion ? 1 : 0,
      IsWeekend: calendar.isWeekend ?? 0,
      DayOfWeek_sin: calendar.dayOfWeekSin ?? 0,
      DayOfWeek_cos: calendar.dayOfWeekCos ?? 0,
      Month_sin: calendar.monthSin ?? 0,
      Month_cos: calendar.monthCos ?? 0,
      Predicted_Demand: row.predictedDemand,
      Lower_95_CI: row.lowerBound,
      Upper_95_CI: row.upperBound
    };
  });

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", dataStr);
  link.setAttribute("download", `demandvision_forecast_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Triggers browser print overlay. Page CSS takes care of hiding controls.
 */
export function printReport() {
  window.print();
}
