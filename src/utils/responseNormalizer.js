/**
 * Safely parses and normalizes predictions returned from Databricks Model Serving
 * into a standardized structure required by the charts and tables.
 * Supports various shapes: nested arrays, objects, case-insensitive keys, and numbers.
 * 
 * @param {Object|Array} apiResponse - The raw API response
 * @param {Array} inputs - The original user inputs sent in the request (to merge context)
 * @returns {Array} Normalized prediction objects
 */
export function normalizePredictions(apiResponse, inputs) {
  if (!apiResponse) {
    throw new Error("No response payload received from the forecasting service.");
  }

  let list = null;

  // 1. Traverse and extract the array of predictions
  if (Array.isArray(apiResponse)) {
    list = apiResponse;
  } else if (apiResponse.predictions) {
    if (Array.isArray(apiResponse.predictions)) {
      list = apiResponse.predictions;
    } else if (apiResponse.predictions.predictions && Array.isArray(apiResponse.predictions.predictions)) {
      list = apiResponse.predictions.predictions;
    } else if (typeof apiResponse.predictions === 'object') {
      // Single prediction object wrap
      list = [apiResponse.predictions];
    }
  } else if (apiResponse.dataframe_records) {
    list = apiResponse.dataframe_records;
  }

  // 2. Fallbacks for single prediction value keys
  if (!list && apiResponse.prediction) {
    list = Array.isArray(apiResponse.prediction) ? apiResponse.prediction : [apiResponse.prediction];
  }

  // 3. Fallback if response is a direct number
  if (!list) {
    if (typeof apiResponse === 'number') {
      list = [apiResponse];
    } else if (typeof apiResponse === 'object' && Object.keys(apiResponse).length > 0) {
      // Look for any array property
      const arrayKey = Object.keys(apiResponse).find(k => Array.isArray(apiResponse[k]));
      if (arrayKey) {
        list = apiResponse[arrayKey];
      } else {
        list = [apiResponse];
      }
    } else {
      throw new Error("Unable to identify valid forecasting prediction format in API response.");
    }
  }

  // 4. Map, parse, and zip with corresponding input features
  return list.map((item, index) => {
    const inputRow = inputs[index] || {};
    
    let date = inputRow.date || '';
    let predictedDemand = 0;
    let lowerBound = null;
    let upperBound = null;

    if (item !== null && typeof item === 'object') {
      const keys = Object.keys(item);
      const getValueCaseInsensitive = (synonyms) => {
        const key = keys.find(k => synonyms.includes(k.toLowerCase()));
        return key !== undefined ? item[key] : null;
      };

      // Extract date
      const dateVal = getValueCaseInsensitive(['date', 'date_string', 'ds', 'time']);
      if (dateVal) date = String(dateVal);

      // Extract predicted demand
      const demandVal = getValueCaseInsensitive([
        'predicted_demand', 'predicteddemand', 'predictions', 
        'prediction', 'demand', 'yhat', 'value', 'predicted'
      ]);
      predictedDemand = demandVal !== null ? Number(demandVal) : 0;

      // Extract confidence bounds
      const lowerVal = getValueCaseInsensitive([
        'lower_95_ci', 'lowerbound', 'lower_bound', 'lower', 
        'yhat_lower', 'ci_lower', 'lowerci', 'min_demand'
      ]);
      lowerBound = lowerVal !== null ? Number(lowerVal) : null;

      const upperVal = getValueCaseInsensitive([
        'upper_95_ci', 'upperbound', 'upper_bound', 'upper', 
        'yhat_upper', 'ci_upper', 'upperci', 'max_demand'
      ]);
      upperBound = upperVal !== null ? Number(upperVal) : null;
    } else if (typeof item === 'number' || typeof item === 'string') {
      predictedDemand = Number(item);
    }

    // Fallback confidence interval calculations (95% CI simulation: standard +/- 12%)
    // This allows graphing confidence bounds even if a basic model deployment omits them.
    if (lowerBound === null || isNaN(lowerBound)) {
      lowerBound = Math.max(0, predictedDemand * 0.88);
    }
    if (upperBound === null || isNaN(upperBound)) {
      upperBound = predictedDemand * 1.12;
    }

    return {
      date: date || inputRow.date || new Date().toISOString().split('T')[0],
      predictedDemand: Math.round(predictedDemand),
      lowerBound: Math.max(0, Math.round(lowerBound)),
      upperBound: Math.round(upperBound),
      price: Number(inputRow.price || 0),
      discount: Number(inputRow.discount || 0),
      promotion: Number(inputRow.promotion || 0)
    };
  });
}
export default normalizePredictions;
