import { TrendingUp } from 'lucide-react';

/**
 * Global site footer with links and branding.
 */
export function Footer({ scrollToSection }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-8">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('dashboard')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-md">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              DemandVision
            </span>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm">
            <button onClick={() => scrollToSection('dashboard')} className="hover:text-white transition-colors cursor-pointer">Dashboard</button>
            <button onClick={() => scrollToSection('forecast-section')} className="hover:text-white transition-colors cursor-pointer">Forecaster</button>
          </div>



        </div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-xs text-slate-500">
          <p>© {currentYear} DemandVision. Deployed on Databricks Model Serving. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span className="h-3 w-px bg-slate-800" />
            <span>Terms of Service</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
export default Footer;
