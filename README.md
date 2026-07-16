# DemandVision 📈

DemandVision is a modern, high-performance retail demand forecasting web application. The frontend connects securely to a deployed **Databricks SARIMAX time-series serving endpoint** to predict future sales demand based on date, price, discount, and promotion adjustments. 

---

## 🌟 Key Features

* **Time-Series Parameter Adjustments**: Input specific forecasting days with pricing (₹), discount margins, and active marketing promotions.
* **Auto-Feature Engineering**: Automatically calculates model inputs from the chosen calendar dates:
  * `IsWeekend` (Saturday/Sunday indicator)
  * Cyclical Weekday Coordinates (`DayOfWeek_sin` / `DayOfWeek_cos` transforms)
  * Cyclical Seasonal Coordinates (`Month_sin` / `Month_cos` transforms)
* **Databricks Auto-Sequence Padding**: Satisfies the SARIMAX model's auto-regressive constraints. If the user selects a forecast date after `2024-01-31`, the API client automatically generates sequential padding dates starting at the model's boundary (`2024-01-31`), queries the endpoint, and returns only the filtered user-requested dates.
* **Interactive Line Chart**: Visualizes forecasted demand curves along with their **95% Confidence Interval (CI)** bands.
* **Sandbox Simulation Mode**: Seamlessly falls back to a high-fidelity client-side model simulator if Databricks serving variables are not provided in the environment.
* **Export Utilities**: Export forecast tables and charts to CSV or JSON formats for inventory planning reports.
* **Minimalist Premium Design**: Built using sleek modern styling, micro-animations, glassmorphism containers, and responsive views.

---

## 🛠️ Tech Stack

* **Frontend Framework**: React 19 (Vite 8 + Rolldown)
* **Styling**: Tailwind CSS v4 (with custom `@import` Google Fonts integration)
* **Animations**: Framer Motion
* **Visualizations**: Recharts
* **API Handlers**: Native Fetch API with local Vite proxy redirects & Netlify Serverless Proxy routing.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/VanshJasuja-1602/DemandVision.git
   cd DemandVision
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Local Configuration (Connecting to Databricks)

Create a `.env.local` file in the root directory of the project and specify your serving endpoint credentials:

```ini
VITE_DATABRICKS_ENDPOINT_URL=https://dbc-39bf23e8-bdbe.cloud.databricks.com/serving-endpoints/DemandForecasting/invocations
VITE_DATABRICKS_TOKEN=your_databricks_personal_access_token
```

*Note: If these variables are omitted, the application will automatically start in **Sandbox Simulation Mode**.*

### Running Locally

To spin up the Vite development server on localhost:

```bash
npm run dev
```

Open [**http://localhost:5173/**](http://localhost:5173/) in your browser. Local requests are automatically routed through Vite's local dev server proxy rules (configured in `vite.config.js`) to bypass browser **CORS** restrictions and keep your Access Token hidden.

### Production Build

To compile a minified, production-ready static bundle:

```bash
npm run build
```

---

## 📊 Databricks Endpoint Schema

The SARIMAX model served on Databricks expects the following columns inside the payload array `dataframe_records`:

| Column | Type | Description |
| :--- | :--- | :--- |
| `Date` | String | Target forecast date (format: `YYYY-MM-DD`) |
| `Price` | Double | Unit Price in Indian Rupees (₹) |
| `Discount` | Double | Applied discount percentage (e.g. `15.0`) |
| `Promotion` | Double/Int | Promotion campaign status (`1` for active, `0` for standard) |

### Auto-Regressive Constraints
Because the SARIMAX model was trained through **`2024-01-30`**, the first forecasting date submitted in the API payload must be exactly **`2024-01-31`**. The frontend automatically handles date-padding sequences for selected dates between `2024-01-31` and `2024-06-30`.

---

## 🔗 Developer Profiles

* **Model Notebook**: [Kaggle Notebook Implementation](https://www.kaggle.com/code/vanshjasuja16/demand-forecasting)
* **Portfolio**: [Vansh Jasuja Netlify Portfolio](https://vanshjasuja16.netlify.app/)
