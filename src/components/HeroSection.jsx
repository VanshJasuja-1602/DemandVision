import { Play, Layers, Cpu, Server, Sliders } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Premium Hero Section featuring titles, metadata cards, scrolling CTA, 
 * and an animated SVG forecasting line graph illustration.
 */
export function HeroSection({ scrollToSection }) {
  const infoCards = [
    { label: 'Model', value: 'SARIMAX', icon: Cpu, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { label: 'Platform', value: 'Databricks', icon: Server, color: 'text-cyan-600 bg-cyan-50 border-cyan-100' },
    { label: 'Input Features', value: '4 Fields', icon: Sliders, color: 'text-purple-600 bg-purple-50 border-purple-100' },
    { label: 'Engineered', value: '5 Cyclical', icon: Layers, color: 'text-teal-600 bg-teal-50 border-teal-100' }
  ];

  // SVG Line Animation Variants
  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { duration: 2.2, ease: "easeInOut" }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', bounce: 0.25 } }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-indigo-50/20 via-white to-slate-50/50 py-16 md:py-24">
      {/* Decorative Floating Background Orbs */}
      <div className="absolute top-10 left-10 -z-10 h-72 w-72 rounded-full bg-indigo-300 opacity-20 blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 -z-10 h-96 w-96 rounded-full bg-cyan-200 opacity-25 blur-3xl animate-pulse-slow-reverse" />
      <div className="absolute top-1/2 left-1/3 -z-10 h-64 w-64 rounded-full bg-purple-300 opacity-15 blur-3xl animate-pulse-slow" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
          
          {/* Left Text Column */}
          <motion.div 
            className="lg:col-span-7 text-left space-y-6 md:space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >


            <div className="space-y-4">
              <motion.h1 
                variants={itemVariants} 
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight"
              >
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                  Demand Forecasting
                </span>
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl font-light leading-relaxed"
              >
                Forecast retail sales and inventory requirements in seconds. Our system converts pricing, promotions, and discounts into cyclical time-series features processed by a high-performance <strong>SARIMAX forecasting model</strong> served directly on Databricks.
              </motion.p>
            </div>

            {/* Info Badges */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2"
            >
              {infoCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <div 
                    key={i} 
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100/80 shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className={`p-2 rounded-xl border ${card.color} mb-2`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">{card.label}</span>
                    <span className="text-sm font-semibold text-slate-800">{card.value}</span>
                  </div>
                );
              })}
            </motion.div>

            {/* Call To Action Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <button
                onClick={() => scrollToSection('forecast-section')}
                className="group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200/50 hover:shadow-indigo-300/60 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
              >
                <span>Generate Demand Forecast</span>
                <Play className="h-4 w-4 fill-white group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
            </motion.div>
          </motion.div>

          {/* Right SVG Illustration Column */}
          <motion.div 
            className="lg:col-span-5 flex justify-center items-center relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            {/* Ambient Background Glow behind Illustration */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-cyan-500/10 rounded-3xl filter blur-2xl -z-10" />

            <div className="w-full max-w-[420px] aspect-square p-6 rounded-3xl glass-panel border border-white/60 shadow-xl shadow-slate-100 flex flex-col justify-between">
              
              {/* Card Title */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-sm">Demand Projections</h3>
                  <p className="text-[10px] text-slate-400">Databricks Serving (Daily Cycles)</p>
                </div>
                <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              </div>

              {/* Graphic Area */}
              <div className="flex-1 py-6 flex items-end relative h-[180px]">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 200 120">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="200" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="50" x2="200" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="80" x2="200" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="110" x2="200" y2="110" stroke="#e2e8f0" strokeWidth="1.5" />

                  {/* Confidence Interval Shading (Simulated) */}
                  <motion.path 
                    d="M 10 90 Q 50 20 90 60 T 170 30 L 170 60 Q 130 90 90 90 T 10 110 Z" 
                    fill="url(#ci-gradient)" 
                    opacity="0.15" 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.15 }}
                    transition={{ delay: 0.8, duration: 1 }}
                  />

                  {/* Forecast Line */}
                  <motion.path 
                    d="M 10 100 Q 50 30 90 70 T 170 40" 
                    fill="none" 
                    stroke="url(#line-gradient)" 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                    variants={lineVariants}
                    initial="hidden"
                    animate="visible"
                  />

                  {/* Confidence Interval Bounds (Dashed lines) */}
                  <motion.path 
                    d="M 10 90 Q 50 20 90 60 T 170 30" 
                    fill="none" 
                    stroke="#8b5cf6" 
                    strokeWidth="1" 
                    strokeDasharray="3 3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                  />
                  <motion.path 
                    d="M 10 110 Q 50 40 90 80 T 170 50" 
                    fill="none" 
                    stroke="#8b5cf6" 
                    strokeWidth="1" 
                    strokeDasharray="3 3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                  />

                  {/* Data Points */}
                  <motion.circle 
                    cx="90" cy="70" r="4.5" 
                    fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 1.5 }}
                  />
                  <motion.circle 
                    cx="170" cy="40" r="4.5" 
                    fill="#10b981" stroke="#ffffff" strokeWidth="1.5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 1.8 }}
                  />

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                    <linearGradient id="ci-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>



            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
export default HeroSection;
