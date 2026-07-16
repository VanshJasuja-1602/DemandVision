/**
 * Netlify Serverless Function serving as a secure proxy to Databricks Model Serving.
 * Keeps the Databricks Personal Access Token (PAT) hidden from the browser client.
 */
export async function handler(event) {
  // Handle CORS preflight (OPTIONS)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
      body: "",
    };
  }

  // Handle configuration status check (GET)
  if (event.httpMethod === "GET") {
    const endpointUrl = process.env.DATABRICKS_ENDPOINT_URL;
    const token = process.env.DATABRICKS_TOKEN;
    const isConfigured = !!(endpointUrl && token);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        configured: isConfigured,
        mode: isConfigured ? "live" : "sandbox",
      }),
    };
  }

  // Only allow POST requests for model inference
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed. Use POST or GET/OPTIONS for status." }),
    };
  }

  try {
    const endpointUrl = process.env.DATABRICKS_ENDPOINT_URL;
    const token = process.env.DATABRICKS_TOKEN;

    if (!endpointUrl || !token) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Server configuration missing. DATABRICKS_ENDPOINT_URL or DATABRICKS_TOKEN is not defined in Netlify dashboard environment variables.",
        }),
      };
    }

    // Parse incoming frontend payload
    const payload = JSON.parse(event.body);

    // Call Databricks Serving Endpoint
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: "Databricks forecasting request failed",
          details: data,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        // Standard CORS support for security
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Netlify proxy invocation error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Unable to generate forecast via proxy server",
        details: error.message,
      }),
    };
  }
}
