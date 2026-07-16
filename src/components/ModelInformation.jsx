import { ArrowDown, CheckCircle, Database, Layers, ShieldCheck, TrendingUp, HelpCircle, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Model Information section containing feature lists, 
 * pipeline diagrams, and time-series parameter guides.
 */
export function ModelInformation() {
  const inputs = ["Date", "Price", "Discount", "Promotion"];
  const engineered = [
    { name: "IsWeekend", desc: "Flag (0 or 1) indicating Saturday or Sunday" },
    { name: "DayOfWeek_sin", desc: "Sine transform mapping cyclical weekly demand trends" },
    { name: "DayOfWeek_cos", desc: "Cosine transform mapping cyclical weekly demand trends" },
    { name: "Month_sin", desc: "Sine transform mapping seasonal yearly patterns" },
    { name: "Month_cos", desc: "Cosine transform mapping seasonal yearly patterns" }
  ];

  const pipelineNodes = [
    { label: "User Inputs", icon: Layers, desc: "Date, Price, Discount, Promo", color: "from-blue-500 to-indigo-500 shadow-blue-100" },
    { label: "Calendar Feature Engineering", icon: CheckCircle, desc: "Transforms cyclical date indexes", color: "from-indigo-500 to-purple-500 shadow-indigo-100" },
    { label: "Secure API Request", icon: ShieldCheck, desc: "Authentication via Serverless Proxy", color: "from-purple-500 to-pink-500 shadow-purple-100" },
    { label: "Databricks Serving (SARIMAX)", icon: Database, desc: "Performs auto-regressive prediction", color: "from-pink-500 to-teal-500 shadow-pink-100" },
    { label: "Dashboard Visualization", icon: TrendingUp, desc: "Interactive charts and tables", color: "from-teal-500 to-cyan-500 shadow-teal-100" }
  ];

  return (
    <section id="model-info" className="py-16 border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Model Architecture & Pipeline
          </h2>
          <p className="mt-4 text-lg text-slate-500 leading-relaxed font-light">
            Understanding the forecasting engineering, cyclicity transformations, and secure inference pipelines of the DemandVision system.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Flow Diagram */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-slate-50/50 border border-slate-100">
            <h3 className="font-display font-bold text-slate-800 text-lg mb-8 text-center">
              Real-Time Inference Data Flow
            </h3>
            
            <div className="relative flex flex-col items-center w-full max-w-sm">
              {pipelineNodes.map((node, idx) => {
                const Icon = node.icon;
                const isLast = idx === pipelineNodes.length - 1;

                return (
                  <div key={idx} className="flex flex-col items-center w-full">
                    {/* Node Card */}
                    <motion.div 
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm z-10"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${node.color} text-white shadow-md`}>
                        <Icon className="h-5.5 w-5.5" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-slate-800 text-sm">{node.label}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{node.desc}</p>
                      </div>
                    </motion.div>

                    {/* Arrow down unless last */}
                    {!isLast && (
                      <div className="my-3 flex flex-col items-center justify-center">
                        <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-500/50 to-purple-500/50 animate-pulse" />
                        <ArrowDown className="h-4 w-4 text-purple-400 -mt-1.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Text Details */}
          <div className="lg:col-span-6 space-y-8 text-left">
            
            {/* Model Metadata Card */}
            <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-slate-900 text-xl border-b border-slate-100 pb-3 flex items-center gap-2">
                <Cpu className="h-5.5 w-5.5 text-indigo-600" />
                <span>Forecasting System Specifications</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Model Type</span>
                  <span className="font-semibold text-slate-800 text-base">SARIMAX Regressor</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Target Variable</span>
                  <span className="font-semibold text-slate-800 text-base">Demand (Units)</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Platform Host</span>
                  <span className="font-semibold text-indigo-600 text-base">Databricks Serving</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Prediction Interval</span>
                  <span className="font-semibold text-slate-800 text-base">95% Confidence (CI)</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Data Frequency</span>
                  <span className="font-semibold text-slate-800 text-base">Daily Granularity</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Base Inputs</span>
                  <span className="font-semibold text-slate-800 text-base">4 Numerical/Date</span>
                </div>
              </div>
            </div>

            {/* Cyclical Periodicity Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
              <h3 className="font-display font-bold text-slate-900 text-xl flex items-center gap-2">
                <Layers className="h-5.5 w-5.5 text-indigo-600" />
                <span>Cyclical Feature engineering</span>
              </h3>
              <p className="text-sm text-slate-500 font-light leading-relaxed">
                Standard calendars represent weekdays (0-6) and months (1-12) numerically. However, to prevent models from seeing discontinuous steps (e.g. December 12 vs January 1), we map these indexes onto cyclical trigonometric coordinates.
              </p>
              
              <div className="space-y-3 pt-2">
                {engineered.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="text-indigo-600 font-mono text-sm font-semibold select-none">#0{index+1}</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 font-mono">{item.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-light">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cyclical Formula Box */}
              <div className="mt-4 p-4 rounded-xl bg-slate-900/90 text-indigo-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                <span className="text-indigo-400 font-bold">// Cyclical Coordinate Formulas</span><br />
                dayOfWeekSin = Math.sin((2 * Math.PI * adjustedDayOfWeek) / 7);<br />
                monthSin = Math.sin((2 * Math.PI * month) / 12);
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
export default ModelInformation;
