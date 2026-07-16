import { AlertTriangle, RotateCcw } from 'lucide-react';

/**
 * Renders user-friendly error banners or cards, hiding raw technical
 * stack traces while providing recovery triggers.
 */
export function ErrorState({ error, onRetry }) {
  // Determine standard readable message
  let displayMessage = "An unexpected error occurred while communicating with the model endpoint.";
  let details = "";

  if (typeof error === 'string') {
    displayMessage = error;
  } else if (error && typeof error === 'object') {
    displayMessage = error.message || displayMessage;
    details = error.details ? JSON.stringify(error.details) : "";
  }

  // Hide typical developer stack traces and log them to console
  if (error && error.stack) {
    console.error("Technical Stack Trace:", error);
  }

  return (
    <div className="rounded-3xl border border-rose-100 bg-rose-50/20 p-6 md:p-8 text-center max-w-xl mx-auto space-y-5">
      
      {/* Icon warning */}
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 border border-rose-100 text-rose-600">
        <AlertTriangle className="h-6 w-6" />
      </div>

      <div className="space-y-2">
        <h3 className="font-display font-extrabold text-slate-800 text-lg">
          Forecasting Request Failed
        </h3>
        <p className="text-sm text-slate-600 font-light leading-relaxed max-w-md mx-auto">
          {displayMessage}
        </p>
        
        {details && (
          <span className="block text-[10px] text-slate-400 font-mono bg-slate-100/50 p-2 rounded-xl border border-slate-200/40 select-all overflow-x-auto max-h-24">
            {details}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold shadow-sm shadow-rose-150 transition-all cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Try Again</span>
        </button>
      </div>

    </div>
  );
}
export default ErrorState;
