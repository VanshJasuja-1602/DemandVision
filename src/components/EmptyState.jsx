import { BarChart3, HelpCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Empty state prompt rendered prior to generating predictions.
 */
export function EmptyState({ onTriggerMock }) {
  return (
    <div className="relative overflow-hidden p-8 sm:p-12 md:p-16 rounded-3xl border border-slate-100 bg-white shadow-sm text-center">
      
      {/* Background glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 bg-indigo-150/30 rounded-full blur-3xl -z-10" />

      <div className="max-w-md mx-auto flex flex-col items-center space-y-6">
        
        {/* Animated chart icon */}
        <motion.div 
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100/60 text-indigo-600 shadow-sm"
          animate={{ 
            y: [0, -6, 0],
            scale: [1, 1.02, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <BarChart3 className="h-8 w-8" />
        </motion.div>

        {/* Text descriptions */}
        <div className="space-y-2">
          <h3 className="font-display font-extrabold text-slate-800 text-xl">
            Your demand forecast will appear here.
          </h3>
          <p className="text-sm text-slate-500 font-light leading-relaxed">
            Enter pricing, discounts, and select promotional active statuses above, then click **Generate Demand Forecast** to query the Databricks-served model.
          </p>
        </div>

        {/* Informational checklist */}
        <div className="w-full text-left p-4 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs text-slate-500 space-y-2.5">
          <span className="font-bold text-slate-700 block border-b border-slate-200/50 pb-1.5 uppercase tracking-wider text-[9px]">How to proceed:</span>
          
          <div className="flex gap-2">
            <span className="text-indigo-600 font-mono font-bold font-semibold select-none">1.</span>
            <span>Choose single or multi-day configuration modes.</span>
          </div>
          <div className="flex gap-2">
            <span className="text-indigo-600 font-mono font-bold font-semibold select-none">2.</span>
            <span>Specify custom prices and discounts. Weekend cycles will be computed automatically.</span>
          </div>
          <div className="flex gap-2">
            <span className="text-indigo-600 font-mono font-bold font-semibold select-none">3.</span>
            <span>Execute the pipeline to query the SARIMAX model.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
export default EmptyState;
