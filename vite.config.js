import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from process.cwd()
  const env = loadEnv(mode, process.cwd(), '');
  const databricksUrl = env.VITE_DATABRICKS_ENDPOINT_URL || '';
  const token = env.VITE_DATABRICKS_TOKEN || '';
  
  const proxyConfig = {};

  if (databricksUrl && token) {
    try {
      const urlObj = new URL(databricksUrl);
      const targetHost = urlObj.origin;      // e.g. https://dbc-39bf23e8-bdbe.cloud.databricks.com
      const targetPath = urlObj.pathname;    // e.g. /serving-endpoints/DemandForecasting/invocations

      proxyConfig['/api/forecast'] = {
        target: targetHost,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/forecast/, targetPath),
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      console.log(`[Vite Proxy] Configured proxy mapping /api/forecast -> ${targetHost}${targetPath}`);
    } catch (e) {
      console.error("[Vite Proxy] Invalid VITE_DATABRICKS_ENDPOINT_URL specified in env file:", e.message);
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: proxyConfig
    }
  };
})
