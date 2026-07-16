import { normalizePredictions } from '../utils/responseNormalizer';
import { calculateCalendarFeatures } from '../utils/calendarFeatures';

/**
 * Checks if the Databricks Serving Endpoint (or proxy) is active.
 * For local sandbox evaluation, if no env variables exist, returns online in simulator mode.
 * 
 * @returns {Promise<Object>} Status object { online: boolean, mode: 'live'|'sandbox' }
 */
export async function checkEndpointStatus() {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (isLocalhost) {
    const endpointUrl = import.meta.env.VITE_DATABRICKS_ENDPOINT_URL;
    const token = import.meta.env.VITE_DATABRICKS_TOKEN;

    if (!endpointUrl || !token) {
      // Sandbox mode connectivity is simulated as active
      return { online: true, mode: 'sandbox' };
    }
    return { online: true, mode: 'live' };
  } else {
    // On Netlify, query the serverless function to check configuration status
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      const response = await fetch('/.netlify/functions/forecast', {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.configured) {
          return { online: true, mode: 'live' };
        }
      }
      return { online: true, mode: 'sandbox' };
    } catch (err) {
      console.warn("Netlify function check failed, falling back to sandbox:", err);
      return { online: true, mode: 'sandbox' };
    }
  }
}

/**
 * Sends rows to Databricks Model Serving.
 * Falls back to a high-fidelity client-side model simulator if env variables are not present.
 * 
 * @param {Array} forecastRows - Rows containing { date, price, discount, promotion }
 * @returns {Promise<Array>} Normalized prediction objects
 */
export async function fetchDemandForecast(forecastRows) {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  let isLive = false;

  if (isLocalhost) {
    const endpointUrl = import.meta.env.VITE_DATABRICKS_ENDPOINT_URL;
    const token = import.meta.env.VITE_DATABRICKS_TOKEN;
    isLive = !!(endpointUrl && token);
  } else {
    try {
      const response = await fetch('/.netlify/functions/forecast', { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        isLive = !!data.configured;
      }
    } catch (e) {
      isLive = false;
    }
  }

  // 1. Sandbox simulation mode fallback
  if (!isLive) {
    // Introduce latency to demonstrate premium dashboard loaders
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    const simulatedPredictions = forecastRows.map(row => {
      const calendar = calculateCalendarFeatures(row.date) || {};
      
      const base = 1600;
      const pricePenalty = -6.8 * Number(row.price || 0);
      const discountLift = 9.5 * Number(row.discount || 0);
      const promoLift = (Number(row.promotion || 0) === 1) ? 580 : 0;
      const weekendLift = calendar.isWeekend * 320;
      
      const weekdayCycle = (calendar.dayOfWeekSin * 120) + (calendar.dayOfWeekCos * 60);
      const monthCycle = (calendar.monthSin * 200) - (calendar.monthCos * 110);
      
      let predicted = base + pricePenalty + discountLift + promoLift + weekendLift + weekdayCycle + monthCycle;
      
      // Keep within realistic bounds
      predicted = Math.max(120, predicted);
      
      // Inject slight random variance (+/- 3%) for organic graph rendering
      const randomNoise = (Math.random() - 0.5) * (predicted * 0.06);
      predicted += randomNoise;
      
      // CI calculation (standard model error approximation of +/- 12%)
      const margin = predicted * 0.12;

      return {
        Date: row.date,
        Predicted_Demand: Math.round(predicted),
        Lower_95_CI: Math.round(Math.max(40, predicted - margin)),
        Upper_95_CI: Math.round(predicted + margin)
      };
    });

    return normalizePredictions({ predictions: simulatedPredictions }, forecastRows);
  }

  // 2. Build sequence starting at 2024-01-31 to satisfy the SARIMAX model's strict autoregression constraints
  const sortedUserRows = [...forecastRows].sort((a, b) => new Date(a.date) - new Date(b.date));
  const requestedDates = new Set(forecastRows.map(r => r.date));
  
  const firstDateStr = sortedUserRows[0].date;
  const firstDate = new Date(firstDateStr);
  const boundaryDate = new Date("2024-01-31");
  
  let apiForecastRows = [];

  if (firstDate > boundaryDate) {
    // Generate consecutive daily sequence from 2024-01-31 up to the day before the first date
    let current = new Date(boundaryDate);
    const templateRow = sortedUserRows[0]; // Copy price/discount/promo parameters from first day as filler defaults
    
    while (current < firstDate) {
      const dateString = current.toISOString().split('T')[0];
      apiForecastRows.push({
        date: dateString,
        price: Number(templateRow.price),
        discount: Number(templateRow.discount),
        promotion: Number(templateRow.promotion)
      });
      current.setDate(current.getDate() + 1);
    }
  }

  // Append user rows
  apiForecastRows = [...apiForecastRows, ...sortedUserRows];

  // Prepare payload structure matching Databricks specs
  const payload = {
    dataframe_records: apiForecastRows.map((row) => ({
      Date: row.date,
      Price: Number(row.price),
      Discount: Number(row.discount),
      Promotion: Number(row.promotion)
    }))
  };

  // 3. Direct request (local dev with env variables via Vite proxy) or production Netlify proxy
  let targetUrl = '/.netlify/functions/forecast';
  const headers = {
    'Content-Type': 'application/json'
  };

  if (isLocalhost) {
    // Use local dev server proxy configured in vite.config.js to bypass CORS
    targetUrl = '/api/forecast';
  }

  const response = await fetch(targetUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Databricks API Error Response Body:", errorData);
    const message = errorData.message || errorData.error || errorData.details || (errorData.error_code ? `${errorData.error_code}: ${errorData.message}` : null) || `Forecasting failed (HTTP ${response.status})`;
    throw new Error(message);
  }

  const data = await response.json();
  const normalized = normalizePredictions(data, apiForecastRows);
  
  // Filter output to return ONLY the user's originally requested dates
  return normalized.filter(row => requestedDates.has(row.date));
}
export default fetchDemandForecast;
