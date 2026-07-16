import { useState } from 'react';
import { Menu, X, Database, Activity, Cpu, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Sticky Glassmorphism Header containing navigation, brand logo, 
 * and live Databricks serving connection status widgets.
 */
export function Navbar({ activeSection, scrollToSection, connectionStatus }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'forecast-section', label: 'Forecast' },
  ];

  const handleLinkClick = (id) => {
    setMobileMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleLinkClick('dashboard')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 text-white shadow-md shadow-indigo-200">
              <TrendingUp className="h-5 w-5 animate-pulse" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
              DemandVision
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="bubble"
                      className="absolute inset-0 z-[-1] rounded-full bg-indigo-50/80"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Connection Status badges */}
          <div className="hidden lg:flex items-center">
            {connectionStatus.mode === 'sandbox' ? (
              <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200/60 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <Cpu className="h-3 w-3 inline mr-0.5" />
                <span>Sandbox Simulation Active</span>
              </div>
            ) : connectionStatus.online ? (
              <div className="flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 border border-teal-200/60 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                <Database className="h-3 w-3 inline mr-0.5" />
                <span>Databricks Model Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-200/60 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <Activity className="h-3 w-3 inline mr-0.5 text-rose-500" />
                <span>Model Endpoint Unavailable</span>
              </div>
            )}
          </div>

          {/* Mobile Menu Buttons */}
          <div className="flex md:hidden items-center gap-3">
            {/* Status indicator on mobile (reduced size) */}
            <div className="flex h-5 w-5 items-center justify-center">
              <span className={`h-2.5 w-2.5 rounded-full ${
                connectionStatus.mode === 'sandbox' ? 'bg-amber-500 animate-pulse' :
                connectionStatus.online ? 'bg-teal-500 animate-pulse' : 'bg-rose-500'
              }`} title={
                connectionStatus.mode === 'sandbox' ? 'Sandbox Simulation' :
                connectionStatus.online ? 'Databricks Online' : 'Endpoint Offline'
              }/>
            </div>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md overflow-hidden"
          >
            <div className="space-y-1 px-4 py-3 pb-4">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-base font-medium transition-colors ${
                    activeSection === link.id
                      ? 'bg-indigo-50/80 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              
              <div className="pt-4 border-t border-slate-100 mt-2">
                {connectionStatus.mode === 'sandbox' ? (
                  <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 border border-amber-100">
                    <Cpu className="h-4 w-4 text-amber-600" />
                    <span>Sandbox Simulation</span>
                  </div>
                ) : connectionStatus.online ? (
                  <div className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700 border border-teal-100">
                    <Database className="h-4 w-4 text-teal-600" />
                    <span>Databricks Model Online</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 border border-rose-100">
                    <Activity className="h-4 w-4 text-rose-500" />
                    <span>Model Endpoint Unavailable</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
export default Navbar;
