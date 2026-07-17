import { useState, useEffect, useRef } from 'react';
import { checkEndpointStatus, fetchDemandForecast } from '../services/databricksApi';
import { calculateCalendarFeatures } from '../utils/calendarFeatures';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ForecastForm from '../components/ForecastForm';
import MultiDayForecastTable from '../components/MultiDayForecastTable';
import CalendarFeaturePreview from '../components/CalendarFeaturePreview';
import LoadingForecast from '../components/LoadingForecast';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import ForecastSummary from '../components/ForecastSummary';
import DemandChart from '../components/DemandChart';
import ForecastResultsTable from '../components/ForecastResultsTable';



import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, TrendingUp, AlertCircle, FileSpreadsheet } from 'lucide-react';

export function Dashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [connectionStatus, setConnectionStatus] = useState({ online: true, mode: 'sandbox' });
  const [mode, setMode] = useState('single'); // 'single' | 'multi'
  
  // Dates initialization
  const modelBoundaryDate = "2024-01-31";

  // Single mode row
  const [singleRow, setSingleRow] = useState({
    date: modelBoundaryDate,
    price: 99.99,
    discount: 5,
    promotion: 0
  });

  // Multi mode initialization parameters
  const [multiParams, setMultiParams] = useState({
    startDate: modelBoundaryDate,
    days: 7,
    price: 99.99,
    discount: 5,
    promotion: 0
  });

  // Multi mode grid rows
  const [multiRows, setMultiRows] = useState([]);

  // Orchestrator states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [forecastResults, setForecastResults] = useState(null);

  // Refs for smooth navigation scroll targets
  const resultsRef = useRef(null);

  // 1. Connection check on mount
  useEffect(() => {
    async function verifyConn() {
      const status = await checkEndpointStatus();
      setConnectionStatus(status);
    }
    verifyConn();
  }, [forecastResults]); // Check connection after attempts

  // 2. Automatically generate multi-day sequential rows when multi parameters change
  useEffect(() => {
    if (mode === 'multi') {
      const daysCount = Math.max(2, Math.min(30, multiParams.days || 7));
      const targetRows = [];
      const parts = multiParams.startDate.split('-');
      let currentDate;
      
      if (parts.length === 3) {
        currentDate = new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
      } else {
        currentDate = new Date(multiParams.startDate);
      }

      for (let i = 0; i < daysCount; i++) {
        if (i > 0) {
          currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }
        targetRows.push({
          date: currentDate.toISOString().split('T')[0],
          price: Number(multiParams.price) || 100,
          discount: Number(multiParams.discount) || 0,
          promotion: Number(multiParams.promotion) || 0
        });
      }
      setMultiRows(targetRows);
    }
  }, [mode, multiParams.startDate, multiParams.days]);

  // Scroll to HTML element by ID
  const scrollToSection = (id) => {
    setActiveSection(id);
    if (id === 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Perform form validations
  const validateForm = () => {
    const newErrors = {};

    if (mode === 'single') {
      if (!singleRow.date) {
        newErrors.date = "Forecast Date is required.";
      } else if (new Date(singleRow.date) < new Date("2024-01-31")) {
        newErrors.date = "Forecast Date must be 2024-01-31 or later.";
      } else if (new Date(singleRow.date) > new Date("2024-06-30")) {
        newErrors.date = "Forecast Date must be on or before 2024-06-30.";
      }
      
      const price = Number(singleRow.price);
      if (isNaN(price) || price < 0) {
        newErrors.price = "Price must be a positive numeric value.";
      }
      
      const discount = Number(singleRow.discount);
      if (isNaN(discount) || discount < 0 || discount > 25) {
        newErrors.discount = "Discount must be between 0 and 25.";
      }
    } else {
      if (!multiParams.startDate) {
        newErrors.startDate = "Start Date is required.";
      } else if (new Date(multiParams.startDate) < new Date("2024-01-31")) {
        newErrors.startDate = "Start Date must be 2024-01-31 or later.";
      } else if (new Date(multiParams.startDate) > new Date("2024-06-30")) {
        newErrors.startDate = "Start Date must be on or before 2024-06-30.";
      }
      
      const days = parseInt(multiParams.days, 10);
      if (isNaN(days) || days < 2 || days > 30) {
        newErrors.days = "Window duration must be between 2 and 30 days.";
      }

      // Validate individual table rows
      multiRows.forEach((row, idx) => {
        const price = Number(row.price);
        if (isNaN(price) || price < 0) {
          newErrors.price = `Row #${idx + 1}: Price must be positive.`;
        }
        const discount = Number(row.discount);
        if (isNaN(discount) || discount < 0 || discount > 25) {
          newErrors.discount = `Row #${idx + 1}: Discount must be between 0 and 25.`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Triggers forecast request
  const handleGenerateForecast = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorState(null);
    setForecastResults(null);

    // Prepare rows list to send
    const rowsToForecast = mode === 'single' ? [singleRow] : multiRows;

    try {
      const normalizedResults = await fetchDemandForecast(rowsToForecast);
      setForecastResults(normalizedResults);

      // Scroll to predictions container after state paints
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err) {
      console.error("Forecasting service error caught in orchestrator:", err);
      setErrorState(err.message || "An connection error occurred while generating forecasting predictions.");
    } finally {
      setIsLoading(false);
    }
  };

  // Compile list of available dates for calendar feature preview
  const availableDatesList = mode === 'single' ? [singleRow.date] : multiRows.map(r => r.date);
  const inspectionTargetDate = mode === 'single' ? singleRow.date : (multiRows[0]?.date || '');

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Sticky Header */}
      <Navbar 
        activeSection={activeSection} 
        scrollToSection={scrollToSection} 
        connectionStatus={connectionStatus} 
      />

      {/* Hero Banner Area */}
      <div id="dashboard">
        <HeroSection scrollToSection={scrollToSection} />
      </div>

      {/* Form Input Section */}
      <main className="flex-1 py-12 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Main Forecasting Form Section */}
          <section id="forecast-section" className="rounded-3xl glass-panel p-6 sm:p-8 md:p-10 border border-slate-100 shadow-sm space-y-8">
            
            <div className="text-left border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                Configure Future Parameters
              </h2>
              <p className="text-sm text-slate-500 font-light mt-0.5">
                Set parameters to run demand scenarios.
              </p>
            </div>

            {/* Inputs Form */}
            <ForecastForm
              mode={mode}
              setMode={setMode}
              singleRow={singleRow}
              setSingleRow={setSingleRow}
              multiParams={multiParams}
              setMultiParams={setMultiParams}
              errors={errors}
              isLoading={isLoading}
            />

            {/* If multi mode active, render inline rows table */}
            {mode === 'multi' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <MultiDayForecastTable rows={multiRows} setRows={setMultiRows} />
              </motion.div>
            )}

            {/* Cyclical feature previews accordion */}
            <CalendarFeaturePreview 
              dateString={inspectionTargetDate} 
              availableDates={availableDatesList} 
            />

            {/* Submit forecast trigger */}
            <div className="flex flex-col items-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleGenerateForecast}
                disabled={isLoading}
                className={`group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:shadow-indigo-300/40 hover:-translate-y-0.5 active:translate-y-0 text-white font-bold px-8 py-4 text-sm shadow-md transition-all cursor-pointer ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <Play className="h-4.5 w-4.5 fill-white" />
                <span>Generate Demand Forecast</span>
              </button>
              
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-3">
                Queries Databricks Serving Endpoint via safe proxy
              </span>
            </div>

          </section>

          {/* Forecast Predictions Container */}
          <div ref={resultsRef} className="scroll-mt-20 space-y-10">
            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div 
                  key="loading" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                >
                  <LoadingForecast />
                </motion.div>
              )}

              {errorState && (
                <motion.div 
                  key="error" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }}
                >
                  <ErrorState error={errorState} onRetry={handleGenerateForecast} />
                </motion.div>
              )}

              {!isLoading && !errorState && !forecastResults && (
                <motion.div 
                  key="empty" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                >
                  <EmptyState />
                </motion.div>
              )}

              {!isLoading && !errorState && forecastResults && (
                <motion.div 
                  key="results" 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-10"
                >
                  {/* Summary aggregate cards */}
                  <ForecastSummary data={forecastResults} mode={mode} />

                  {/* Chart and results grid */}
                  <div className="grid grid-cols-1 gap-10">
                    {mode === 'multi' && <DemandChart data={forecastResults} />}
                    <ForecastResultsTable data={forecastResults} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>





        </div>
      </main>

      {/* Model Preview CTA Section */}
      <div className="py-12 border-t border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center gap-3 text-center">
        <h4 className="font-display font-bold text-slate-800 text-base">
          Explore Model Implementation
        </h4>
        <p className="text-xs text-slate-500 max-w-md font-light leading-relaxed px-4">
          Review the full model training notebook, SARIMAX fitting parameters, and dataset evaluation pipeline on Kaggle.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-1 w-full max-w-lg px-4">
          <a 
            href="https://www.kaggle.com/code/vanshjasuja16/demand-forecasting"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-indigo-700 border border-slate-200/80 shadow-sm hover:shadow-md hover:bg-slate-50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer w-full sm:w-auto justify-center"
          >
            <span>Model Preview</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          
          <a 
            href="https://vanshjasuja16.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer w-full sm:w-auto justify-center"
          >
            <span>Know About Developer</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Global Footer */}
      <Footer scrollToSection={scrollToSection} />

    </div>
  );
}
export default Dashboard;
