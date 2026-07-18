import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ThreeFlower } from '../components/ThreeFlower';
import { InteractiveGarden } from '../components/InteractiveGarden';
import { InteractiveButton } from '../components/InteractiveButton';
import { TiltCard } from '../components/TiltCard';
import { Sparkles, ArrowRight, Heart, Moon, Sun, Smile, Flower, Flower2, Sprout } from 'lucide-react';

interface HomeProps {
  onNavigateToCollection: () => void;
  onNavigateToKeychains: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

// Custom hook to wrap import path for InteractiveButton
// InteractiveButton was created at '../components/InteractiveButton' but write_to_file wrote to 'src/components/InteractiveButton.tsx'.
// Oh! Let's double check where I wrote it: TargetFile was 'c:\Users\user\Desktop\petalorah\src\components\InteractiveButton.tsx'.
// Yes! So the import is '../components/InteractiveButton'. Let's write the correct import.

export const Home: React.FC<HomeProps> = ({
  onNavigateToCollection,
  onNavigateToKeychains,
  isDarkMode,
  toggleDarkMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  


  // Story text reveal setup
  const storyText = "Petalorah is a handmade pipe cleaner craft studio where every flower, keychain and miniature is carefully handcrafted with creativity, patience and love. Every creation is designed to become a meaningful keepsake.";
  const storyWords = storyText.split(" ");

  const storyRef = useRef<HTMLDivElement>(null);
  const isStoryInView = useInView(storyRef, { once: false, amount: 0.3 });



  // Featured products data (only 3)
  const featuredProducts = [
    { 
      name: 'Keychains', 
      price: 'Starts from ₹35', 
      desc: 'Explore our collection of fluffy, premium handcrafted keychains, including roses, tulips, and charms.', 
      img: '/assets/price_list.jpg',
      isComingSoon: false 
    },
    { 
      name: 'Table Tops', 
      price: 'Coming Soon', 
      desc: 'Handcrafted miniature flower pots and table decorations that bring a touch of nature to your workspace.', 
      img: '/assets/products/table_tops.jpg',
      isComingSoon: true 
    },
    { 
      name: 'Flowers and Bouquets', 
      price: 'Coming Soon', 
      desc: 'Beautiful, custom-designed pipe cleaner flower bouquets that stay fresh and vibrant forever.', 
      img: '/assets/products/flower_bouquets.png',
      isComingSoon: true 
    },
  ];

  return (
    <div ref={containerRef} className="relative w-full min-h-screen">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full min-h-screen lg:h-screen flex flex-col justify-between py-6 lg:py-0 overflow-hidden">
        {/* Full background interactive garden */}
        <InteractiveGarden />

        {/* Top Navbar */}
        <header className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 z-30 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3 select-none cursor-pointer logo-click-target">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-primary/20 overflow-hidden shadow-sm">
              <img src="/assets/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-serif text-lg sm:text-2xl font-semibold tracking-wider text-primary dark:text-secondary-light hidden min-[380px]:inline-block">
              PETALORAH
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-full bg-white/40 dark:bg-navy-light/40 border border-white/40 dark:border-white/10 text-primary dark:text-secondary-light hover:scale-105 transition-transform"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* Hero Content Grid */}
        <div className="relative w-full max-w-7xl mx-auto px-6 flex-grow grid grid-cols-1 lg:grid-cols-2 items-center gap-8 z-20">
          
          {/* Hero Left: Text Content */}
          <div className="flex flex-col items-start text-left max-w-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border-primary/10 text-primary dark:text-secondary-light text-xs font-semibold uppercase tracking-wider mb-6"
            >
              <Sparkles size={12} className="animate-pulse" />
              Luxury Handmade Crafts
            </motion.div>

            <motion.h1
              className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-primary dark:text-white leading-[1.1] mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              PETALORAH
            </motion.h1>

            <motion.h2
              className="text-lg md:text-xl font-medium tracking-[0.25em] text-primary/70 dark:text-secondary-light/80 uppercase mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Handmade With Love
            </motion.h2>

            <motion.p
              className="text-base text-primary/70 dark:text-gray-300 leading-relaxed mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Beautiful handmade pipe cleaner flowers, keychains, miniatures and gifts crafted with creativity, patience and love. Each creation is designed to bring warm smiles and become a keepsake.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <InteractiveButton variant="glass" onClick={() => {
                document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                View Featured
              </InteractiveButton>
            </motion.div>
          </div>

          {/* Hero Right: 3D interactive flower Canvas */}
          <div className="w-full h-[40vh] lg:h-[70vh] flex items-center justify-center relative select-none">
            <ThreeFlower />
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="relative pb-8 w-full flex justify-center items-center z-20">
          <motion.div
            className="flex flex-col items-center gap-1.5 cursor-pointer text-primary/40"
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-xs uppercase tracking-widest font-semibold text-primary/60 dark:text-secondary-light/60">Scroll Down</span>
            <div className="w-1.5 h-6 rounded-full bg-primary/20 dark:bg-secondary/20 flex justify-center py-1">
              <motion.div className="w-1 h-1.5 rounded-full bg-primary dark:bg-secondary-light" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <section id="about" className="relative w-full py-16 sm:py-28 overflow-hidden bg-white dark:bg-navy-light/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-row lg:grid lg:grid-cols-12 gap-4 sm:gap-8 lg:gap-16 items-start lg:items-center">
          
          {/* About Left: Emblem Image Frame */}
          <div className="flex-shrink-0 lg:col-span-5 flex justify-start lg:justify-center">
            <motion.div
              className="relative w-20 sm:w-36 md:w-56 lg:w-full lg:max-w-[360px] aspect-[4/5] rounded-[12px] sm:rounded-[24px] lg:rounded-[40px] overflow-hidden border border-white/60 dark:border-white/10 shadow-lg lg:shadow-2xl glass-card p-1 sm:p-2 lg:p-4"
              whileInView={{ opacity: [0, 1], scale: [0.95, 1], rotate: [-2, 0] }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.0, ease: 'easeOut' }}
            >
              <div className="w-full h-full rounded-[8px] sm:rounded-[18px] lg:rounded-[28px] overflow-hidden relative shadow-inner">
                <img
                  src="/assets/logo.jpg"
                  alt="Petalorah Logo Craft"
                  className="w-full h-full object-cover scale-105 hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
              </div>
            </motion.div>
          </div>

          {/* About Right: Story Scroll Reveal */}
          <div ref={storyRef} className="flex-grow lg:col-span-7 text-left flex flex-col items-start">
            <h2 className="font-serif text-[10px] sm:text-xs md:text-base font-bold text-primary dark:text-secondary-light tracking-[0.25em] uppercase mb-1 sm:mb-4">
              Our Story
            </h2>
            <h3 className="font-serif text-xs sm:text-lg md:text-3xl lg:text-4xl font-semibold text-primary dark:text-white leading-tight mb-2 sm:mb-8">
              Crafting Kept Memories
            </h3>
            
            <p className="text-[10px] sm:text-base md:text-xl lg:text-2xl font-serif text-primary/95 dark:text-gray-200 leading-relaxed flex flex-wrap gap-x-1 gap-y-0.5 sm:gap-x-2 sm:gap-y-1">
              {storyWords.map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0.15, y: 5 }}
                  animate={isStoryInView ? { opacity: 1, y: 0 } : { opacity: 0.15, y: 5 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.04,
                    ease: 'easeOut',
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </p>
          </div>

        </div>
      </section>

      {/* ================= WHY CHOOSE PETALORAH ================= */}
      <section className="relative w-full py-16 sm:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="font-serif text-base font-bold text-primary dark:text-secondary-light tracking-[0.25em] uppercase mb-4">
            Quality & Detail
          </h2>
          <h3 className="font-serif text-3xl md:text-4xl font-semibold text-primary dark:text-white mb-16">
            Why Petalorah Creation
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8 items-stretch">
            {/* Card 1: 100% Handcrafted (Highlighted variant) */}
            <TiltCard 
              glowColor="rgba(255, 105, 180, 0.25)" 
              className="group border border-primary/20 dark:border-secondary/20 shadow-[0_0_20px_rgba(255,105,180,0.05)] bg-white/50 dark:bg-navy-light/40"
            >
              <div className="flex flex-col items-start text-left h-full relative overflow-hidden">
                {/* Rose background SVG watermark */}
                <div className="absolute -bottom-8 -right-8 w-20 h-20 sm:w-36 sm:h-36 text-pink-500/10 dark:text-pink-400/5 pointer-events-none z-0 transition-all duration-700 group-hover:scale-110 group-hover:rotate-12 group-hover:text-pink-500/20 dark:group-hover:text-pink-400/15">
                  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <path strokeWidth="1.5" d="M50 20 C40 10, 30 25, 50 45 C70 25, 60 10, 50 20 Z" />
                    <path strokeWidth="1.5" d="M50 28 C45 20, 38 30, 50 42 C62 30, 55 20, 50 28 Z" />
                    <path strokeWidth="1.5" d="M50 45 C45 55, 30 60, 35 70 C40 80, 50 80, 50 85" />
                    <path strokeWidth="1.5" d="M50 45 C55 55, 70 60, 65 70 C60 80, 50 80, 50 85" />
                    <path strokeWidth="1.5" d="M50 85 L50 95" />
                    <path strokeWidth="1.5" d="M50 60 C42 62, 38 58, 36 52 C38 48, 45 52, 50 60" />
                  </svg>
                </div>

                <div className="relative z-10 flex flex-col h-full justify-between w-full">
                  <div>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-300 mb-3 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Flower size={16} className="animate-spin-slow sm:size-[22px]" style={{ animationDuration: '20s' }} />
                    </div>
                    <h4 className="font-serif text-sm sm:text-lg md:text-xl font-semibold text-primary dark:text-white mb-1.5 sm:mb-3">
                      100% Handcrafted
                    </h4>
                    <p className="text-[10px] sm:text-sm text-primary/70 dark:text-gray-300 leading-relaxed mb-2 sm:mb-4">
                      No machinery, no shortcuts. Every single loop of pipe cleaner is twisted and formed carefully by hand, ensuring authenticity in every blossom.
                    </p>
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* Card 2: Premium Finish (Highly Highlighted signature variant) */}
            <TiltCard 
              glowColor="rgba(245, 158, 11, 0.35)" 
              className="group border-2 border-amber-400/60 dark:border-amber-400/40 shadow-[0_0_30px_rgba(245,158,11,0.15)] bg-amber-500/5 dark:bg-amber-950/20 lg:scale-[1.03]"
            >
              <div className="flex flex-col items-start text-left h-full relative overflow-hidden">
                {/* Tulip background SVG watermark */}
                <div className="absolute -bottom-8 -right-8 w-20 h-20 sm:w-36 sm:h-36 text-amber-500/10 dark:text-amber-400/5 pointer-events-none z-0 transition-all duration-700 group-hover:scale-110 group-hover:-translate-y-2 group-hover:text-amber-500/20 dark:group-hover:text-amber-400/15">
                  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <path strokeWidth="1.5" d="M35 35 C35 60, 50 65, 50 65 C50 65, 65 60, 65 35 C60 45, 55 45, 50 38 C45 45, 40 45, 35 35 Z" />
                    <path strokeWidth="1.5" d="M50 38 C50 25, 50 25, 50 25" />
                    <path strokeWidth="1.5" d="M50 65 L50 90" />
                    <path strokeWidth="1.5" d="M50 75 C58 75, 65 70, 68 62 C65 62, 55 70, 50 75" />
                  </svg>
                </div>

                {/* Signature badge */}
                <div className="absolute top-0 right-0 px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-[10px] uppercase font-bold tracking-widest bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/30 shadow-sm z-20">
                  Signature
                </div>

                <div className="relative z-10 flex flex-col h-full justify-between w-full">
                  <div>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-300 mb-3 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Sparkles size={16} className="animate-pulse sm:size-[22px]" />
                    </div>
                    <h4 className="font-serif text-sm sm:text-lg md:text-xl font-semibold text-primary dark:text-white mb-1.5 sm:mb-3">
                      Premium Finish
                    </h4>
                    <p className="text-[10px] sm:text-sm text-primary/80 dark:text-amber-100/90 leading-relaxed mb-2 sm:mb-4">
                      We use selected heavy-density, soft-bristle pipe cleaners and high-grade metal fittings to ensure your keychains remain fluffy, durable and luxurious.
                    </p>
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* Card 3: Unique Designs */}
            <TiltCard 
              glowColor="rgba(186, 85, 211, 0.25)" 
              className="group border border-primary/20 dark:border-secondary/20 bg-white/50 dark:bg-navy-light/40"
            >
              <div className="flex flex-col items-start text-left h-full relative overflow-hidden">
                {/* Sunflower background SVG watermark */}
                <div className="absolute -bottom-8 -right-8 w-20 h-20 sm:w-36 sm:h-36 text-purple-500/10 dark:text-purple-400/5 pointer-events-none z-0 transition-all duration-700 group-hover:scale-110 group-hover:rotate-45 group-hover:text-purple-500/20 dark:group-hover:text-purple-400/15">
                  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <circle cx="50" cy="50" r="10" strokeWidth="1.5" />
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                      <path
                        key={angle}
                        strokeWidth="1.5"
                        d="M50 40 C47 30, 53 30, 50 40"
                        transform={`rotate(${angle} 50 50)`}
                      />
                    ))}
                  </svg>
                </div>

                <div className="relative z-10 flex flex-col h-full justify-between w-full">
                  <div>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-300 mb-3 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Flower2 size={16} className="animate-spin-slow sm:size-[22px]" style={{ animationDuration: '30s' }} />
                    </div>
                    <h4 className="font-serif text-sm sm:text-lg md:text-xl font-semibold text-primary dark:text-white mb-1.5 sm:mb-3">
                      Unique Designs
                    </h4>
                    <p className="text-[10px] sm:text-sm text-primary/70 dark:text-gray-300 leading-relaxed mb-2 sm:mb-4">
                      Custom artistic color choices and original shape patterns that make each piece a miniature art gallery piece, unlike standard factory replicas.
                    </p>
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* Card 4: Perfect Keepsake Gifts */}
            <TiltCard 
              glowColor="rgba(30, 144, 255, 0.25)" 
              className="group border border-primary/20 dark:border-secondary/20 bg-white/50 dark:bg-navy-light/40"
            >
              <div className="flex flex-col items-start text-left h-full relative overflow-hidden">
                {/* Cherry background SVG watermark */}
                <div className="absolute -bottom-8 -right-8 w-20 h-20 sm:w-36 sm:h-36 text-blue-500/10 dark:text-blue-400/5 pointer-events-none z-0 transition-all duration-700 group-hover:scale-110 group-hover:rotate-12 group-hover:text-blue-500/20 dark:group-hover:text-blue-400/15">
                  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <circle cx="35" cy="65" r="14" strokeWidth="1.5" />
                    <circle cx="65" cy="70" r="12" strokeWidth="1.5" />
                    <path strokeWidth="1.5" d="M35 51 C35 35, 50 25, 50 25" />
                    <path strokeWidth="1.5" d="M65 58 C65 42, 50 25, 50 25" />
                    <path strokeWidth="1.5" d="M50 25 C45 20, 55 15, 58 28" />
                  </svg>
                </div>

                <div className="relative z-10 flex flex-col h-full justify-between w-full">
                  <div>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-300 mb-3 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Heart size={16} className="animate-pulse sm:size-[22px]" />
                    </div>
                    <h4 className="font-serif text-sm sm:text-lg md:text-xl font-semibold text-primary dark:text-white mb-1.5 sm:mb-3">
                      Perfect Keepsake Gifts
                    </h4>
                    <p className="text-[10px] sm:text-sm text-primary/70 dark:text-gray-300 leading-relaxed mb-2 sm:mb-4">
                      Ideal custom gestures for birthday tags, token gifts, key charms, or desk companions that stay fresh and never wither.
                    </p>
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* Card 5: Crafted With Patience (Highlighted variant) */}
            <TiltCard 
              glowColor="rgba(52, 211, 153, 0.25)" 
              className="group border border-emerald-400/40 dark:border-emerald-500/30 shadow-[0_0_20px_rgba(52,211,153,0.05)] bg-white/50 dark:bg-navy-light/40"
            >
              <div className="flex flex-col items-start text-left h-full relative overflow-hidden">
                {/* Lavender background SVG watermark */}
                <div className="absolute -bottom-8 -right-8 w-20 h-20 sm:w-36 sm:h-36 text-emerald-500/10 dark:text-emerald-400/5 pointer-events-none z-0 transition-all duration-700 group-hover:scale-110 group-hover:-rotate-12 group-hover:text-emerald-500/20 dark:group-hover:text-emerald-400/15">
                  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <path strokeWidth="1.5" d="M50 90 L50 20" />
                    <path strokeWidth="1.5" d="M50 20 C46 15, 54 15, 50 20 Z" />
                    {[30, 45, 60, 75].map((y) => (
                      <g key={y}>
                        <path strokeWidth="1.5" d={`M50 ${y} C38 ${y-10}, 42 ${y-18}, 50 ${y}`} />
                        <path strokeWidth="1.5" d={`M50 ${y} C62 ${y-10}, 58 ${y-18}, 50 ${y}`} />
                      </g>
                    ))}
                  </svg>
                </div>

                <div className="relative z-10 flex flex-col h-full justify-between w-full">
                  <div>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-300 mb-3 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Sprout size={16} className="animate-bounce sm:size-[22px]" style={{ animationDuration: '3s' }} />
                    </div>
                    <h4 className="font-serif text-sm sm:text-lg md:text-xl font-semibold text-primary dark:text-white mb-1.5 sm:mb-3">
                      Crafted With Patience
                    </h4>
                    <p className="text-[10px] sm:text-sm text-primary/70 dark:text-gray-300 leading-relaxed mb-2 sm:mb-4">
                      Hours of careful wire-molding go into composing a single creation. Craftsmanship you can feel in the weight and balance of the product.
                    </p>
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* Card 6: Made to Bring Smiles */}
            <TiltCard 
              glowColor="rgba(255, 215, 0, 0.25)" 
              className="group border border-primary/20 dark:border-secondary/20 bg-white/50 dark:bg-navy-light/40"
            >
              <div className="flex flex-col items-start text-left h-full relative overflow-hidden">
                {/* Daisy bloom background SVG watermark */}
                <div className="absolute -bottom-8 -right-8 w-20 h-20 sm:w-36 sm:h-36 text-yellow-500/10 dark:text-yellow-400/5 pointer-events-none z-0 transition-all duration-700 group-hover:scale-110 group-hover:rotate-90 group-hover:text-yellow-500/20 dark:group-hover:text-yellow-400/15">
                  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
                    <circle cx="50" cy="50" r="10" strokeWidth="1.5" />
                    {[0, 60, 120, 180, 240, 300].map((angle) => (
                      <path
                        key={angle}
                        strokeWidth="1.5"
                        d="M50 40 C42 22, 58 22, 50 40"
                        transform={`rotate(${angle} 50 50)`}
                      />
                    ))}
                  </svg>
                </div>

                <div className="relative z-10 flex flex-col h-full justify-between w-full">
                  <div>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-600 dark:text-yellow-300 mb-3 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Smile size={16} className="animate-pulse sm:size-[22px]" />
                    </div>
                    <h4 className="font-serif text-sm sm:text-lg md:text-xl font-semibold text-primary dark:text-white mb-1.5 sm:mb-3">
                      Made to Bring Smiles
                    </h4>
                    <p className="text-[10px] sm:text-sm text-primary/70 dark:text-gray-300 leading-relaxed mb-2 sm:mb-4">
                      Cute aesthetics designed to trigger immediate joy. A little touch of handmade warmth added to your everyday life.
                    </p>
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>

        </div>
      </section>



      {/* ================= FEATURED COLLECTION ================= */}
      <section id="featured" className="relative w-full py-16 sm:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="font-serif text-base font-bold text-primary dark:text-secondary-light tracking-[0.25em] uppercase mb-4">
            Spotlight
          </h2>
          <h3 className="font-serif text-3xl md:text-4xl font-semibold text-primary dark:text-white mb-16">
            Featured Creations
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-8 mb-16">
            {featuredProducts.map((prod, idx) => (
              <TiltCard
                key={idx}
                glowColor={prod.isComingSoon ? "rgba(0, 0, 0, 0)" : "rgba(30, 78, 156, 0.15)"}
                onClick={prod.isComingSoon ? undefined : () => {
                  console.log("Spotlight card clicked:", prod.name);
                  if (prod.name === 'Keychains') {
                    onNavigateToKeychains();
                  } else {
                    onNavigateToCollection();
                  }
                }}
                className={prod.isComingSoon ? "opacity-75" : ""}
              >
                <div className="flex flex-col items-center text-center">
                  
                  {/* Image container with nice arched shape */}
                  <div className="w-full aspect-[4/5] rounded-[16px] sm:rounded-[32px] overflow-hidden border border-primary/40 bg-white/40 dark:border-white/10 dark:bg-navy-light/20 p-1 sm:p-2 mb-2 sm:mb-6">
                    <div className="w-full h-full rounded-[12px] sm:rounded-[24px] overflow-hidden relative shadow-inner">
                      <img
                        src={prod.img}
                        alt={prod.name}
                        className={`w-full h-full object-cover ${prod.isComingSoon ? '' : 'hover:scale-105'} transition-transform duration-500`}
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 w-full mb-1.5 sm:mb-3">
                    <h4 className="font-serif text-xs sm:text-lg md:text-2xl font-semibold text-primary dark:text-white text-left">{prod.name}</h4>
                    <span className={`px-1.5 py-0.5 sm:px-3.5 sm:py-1 text-[9px] sm:text-xs md:text-sm font-semibold rounded-full whitespace-nowrap w-fit ${
                      prod.isComingSoon 
                        ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/25 dark:text-amber-300'
                        : 'bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary-light'
                    }`}>
                      {prod.price}
                    </span>
                  </div>

                  <p className="text-sm text-primary/70 dark:text-gray-300 leading-relaxed text-left mb-6 hidden sm:block">
                    {prod.desc}
                  </p>

                  <div className="w-full">
                    <InteractiveButton
                      variant="glass"
                      className="w-full py-2 sm:py-3 text-[10px] sm:text-sm"
                      disabled={prod.isComingSoon}
                    >
                      View Collection <ArrowRight size={14} className="hidden sm:inline-block ml-1" />
                    </InteractiveButton>
                  </div>

                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="relative w-full pt-12 sm:pt-20 pb-8 border-t border-primary/10 dark:border-white/5 bg-white dark:bg-navy-dark/10 overflow-hidden">
        
        {/* Animated growing flowers in footer corners (SVGs) */}
        <CornerFlowers />

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
          
          <div className="flex flex-col md:flex-row justify-between items-center w-full gap-8 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-primary/20 overflow-hidden">
                <img src="/assets/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-serif text-xl font-bold tracking-wider text-primary dark:text-secondary-light">PETALORAH</span>
            </div>

            {/* Social channels */}
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/petalorah"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-full bg-white dark:bg-navy-light border border-primary/10 text-primary dark:text-secondary-light shadow-md hover:-translate-y-1 transition-all"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="https://wa.me/916382735751"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-full bg-white dark:bg-navy-light border border-primary/10 text-primary dark:text-secondary-light shadow-md hover:-translate-y-1 transition-all"
                aria-label="WhatsApp"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </a>
            </div>

            {/* Theme Toggle in footer */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-white/40 dark:bg-navy-light/40 text-sm text-primary dark:text-secondary-light hover:scale-105 transition-transform"
            >
              {isDarkMode ? (
                <>
                  <Sun size={14} /> Light Theme
                </>
              ) : (
                <>
                  <Moon size={14} /> Dark Theme
                </>
              )}
            </button>
          </div>

          <div className="w-full border-t border-primary/10 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary/40">
            <p>© {new Date().getFullYear()} Petalorah. All rights reserved.</p>
            <p className="flex items-center gap-1.5 font-medium text-primary/70 dark:text-secondary-light/70 footer-credit-trigger cursor-pointer select-none">
              Made with <Heart size={10} className="fill-current text-red-500 animate-bounce heart-bloom-trigger" /> in India
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
};



// ================= FOOTER CORNER FLOWERS =================
const CornerFlowers: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none select-none z-0">
      {/* Bottom Left Flower */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute left-0 bottom-0 w-24 h-24 md:w-40 md:h-40 origin-bottom-left text-primary/10 dark:text-secondary/5 fill-current"
        initial={{ scale: 0, rotate: -45 }}
        animate={isInView ? { scale: 1, rotate: 0 } : {}}
        transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <path d="M0 100 C 10 70 30 70 40 100" stroke="green" strokeWidth="2" fill="none" />
        <circle cx="40" cy="100" r="10" fill="#FFFFF0" />
        <circle cx="45" cy="95" r="8" fill="#1E4E9C" />
        <circle cx="35" cy="95" r="8" fill="#1E4E9C" />
      </motion.svg>

      {/* Bottom Right Flower */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute right-0 bottom-0 w-24 h-24 md:w-40 md:h-40 origin-bottom-right text-primary/10 dark:text-secondary/5 fill-current"
        initial={{ scale: 0, rotate: 45 }}
        animate={isInView ? { scale: 1, rotate: 0 } : {}}
        transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
      >
        <path d="M100 100 C 90 70 70 70 60 100" stroke="green" strokeWidth="2" fill="none" />
        <circle cx="60" cy="100" r="10" fill="#FFFFF0" />
        <circle cx="55" cy="95" r="8" fill="#1E4E9C" />
        <circle cx="65" cy="95" r="8" fill="#1E4E9C" />
      </motion.svg>
    </div>
  );
};
