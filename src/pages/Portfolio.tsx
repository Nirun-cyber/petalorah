import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InteractiveGarden } from '../components/InteractiveGarden';
import { InteractiveButton } from '../components/InteractiveButton';
import { TiltCard } from '../components/TiltCard';
import { Sparkles, X, Heart, Sun, Moon } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  img: string;
  badge: string;
}

interface PortfolioProps {
  onNavigateHome: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({ 
  onNavigateHome,
  isDarkMode,
  toggleDarkMode,
}) => {
  const [boxState, setBoxState] = useState<'closed' | 'untying' | 'opening' | 'opened'>('closed');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 9 handmade products
  const products: Product[] = [
    { id: 'rose', name: 'Rose', price: '₹50', description: 'A timeless symbol of love, meticulously handcrafted with rich crimson pipe cleaner petals and a deep green stem. Perfect as a romantic keepsake or a luxury bag charm.', img: '/assets/products/rose.jpg', badge: 'Best Seller' },
    { id: 'tulip', name: 'Tulip', price: '₹50', description: 'An elegant pink tulip keychain carrying the gentle warmth of spring. Carefully twisted loops ensure a soft, fluffy texture that stays pristine forever.', img: '/assets/products/tulip.png', badge: 'Cute Accent' },
    { id: 'evil_eye', name: 'Evil Eye', price: '₹50', description: 'A protective charm crafted with Concentric circles of royal blue, soft blue, and white pipe cleaners. A beautiful blend of folklore and handmade artistry.', img: '/assets/products/evil_eye.jpg', badge: 'Popular' },
    { id: 'duck', name: 'Duck', price: '₹80', description: 'An adorable round yellow duck keychain wearing a tiny blue head bow. Guaranteed to bring happy vibes and smiles wherever it goes.', img: '/assets/products/duck.png', badge: 'Super Cute' },
    { id: 'moon_cloud', name: 'Cloud', price: '₹60', description: 'A soft, fluffy white cloud keychain. A miniature sky keepsake designed to bring a touch of daydreaming to your day.', img: '/assets/products/moon_cloud.jpg', badge: 'Dreamy' },
    { id: 'cherry', name: 'Cherry', price: '₹50', description: 'A sweet pair of twin red cherries suspended from green leafy stems. Adds a playful, delicious pop of color to keys and accessories.', img: '/assets/products/cherry.jpg', badge: 'Playful' },
    { id: 'rainbow', name: 'Rainbow', price: '₹60', description: 'A vibrant arched pastel rainbow anchored by two fluffy white clouds. Handcrafted with precision wire twisting to maintain a perfect arch shape.', img: '/assets/products/rainbow.jpg', badge: 'Colorful' },
    { id: 'daisy_pot', name: 'Daisy Pot', price: '₹60', description: 'Miniature flowerpots featuring blooming white and purple daisies. Ideal as a happy dashboard companion or workspace decoration.', img: '/assets/products/daisy_pot.png', badge: 'Table Decor' },
    { id: 'bow', name: 'Bow', price: '₹35', description: 'A classic blue pipe cleaner ribbon bow keychain with an elegant pearl accent. Simple, elegant, and perfectly handcrafted, representing the pure aesthetics of line art crafts.', img: '/assets/products/bow.png', badge: 'Classic' },
  ];

  // Instagram gallery items
  const instagramFeed = [
    { img: '/assets/products/rose.jpg', likes: '124' },
    { img: '/assets/products/tulip.jpg', likes: '98' },
    { img: '/assets/products/evil_eye.jpg', likes: '156' },
    { img: '/assets/products/duck.jpg', likes: '210' },
    { img: '/assets/products/moon_cloud.jpg', likes: '188' },
    { img: '/assets/products/daisy_pot.jpg', likes: '143' },
  ];

  // Trigger box opening sequence
  const handleOpenBox = () => {
    if (boxState !== 'closed') return;
    
    setBoxState('untying');
    
    // Step 1: Untie ribbon
    setTimeout(() => {
      setBoxState('opening');
      
      // Confetti burst
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#1E4E9C', '#A5C4F2', '#E6E6FA', '#FFFFF0'],
      });
      
      // Step 2: Open Box & Emerge cards
      setTimeout(() => {
        setBoxState('opened');
      }, 1000);
    }, 1200);
  };

  return (
    <div className="relative w-full min-h-screen bg-white dark:bg-navy">
      <InteractiveGarden />

      {/* Top Navbar */}
      <header className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 z-30 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3 select-none cursor-pointer logo-click-target" onClick={onNavigateHome}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-primary/20 overflow-hidden shadow-sm">
            <img src="/assets/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-serif text-lg sm:text-2xl font-semibold tracking-wider text-primary dark:text-secondary-light hidden min-[380px]:inline-block">
            PETALORAH
          </span>
        </div>

        <div className="flex items-center gap-4">
          <InteractiveButton variant="glass" onClick={onNavigateHome}>
            Back to Home
          </InteractiveButton>
          <button
            onClick={toggleDarkMode}
            className="p-3 rounded-full bg-white/40 dark:bg-navy-light/40 border border-white/40 dark:border-white/10 text-primary dark:text-secondary-light hover:scale-105 transition-transform"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* ================= COLLECTION HERO ================= */}
      <section className="relative pt-16 pb-12 text-center z-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center items-center gap-2 text-primary dark:text-secondary-light text-xs font-semibold uppercase tracking-widest mb-4"
          >
            <Sparkles size={12} /> Gallery Art Exhibition
          </motion.div>
          <motion.h1
            className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-primary dark:text-white leading-tight"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Our Handmade Collection
          </motion.h1>
          <motion.p
            className="text-sm md:text-base text-primary/70 dark:text-gray-300 mt-4 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Unwrap the magic. Click the luxury ribbon below to untie the gift box and let our creations bloom into the air.
          </motion.p>
        </div>
      </section>

      {/* ================= GIFT BOX INTERACTIVE SHOWCASE ================= */}
      <section className="relative w-full py-10 flex flex-col items-center justify-center min-h-[500px] z-20 overflow-visible">
        
        {boxState !== 'opened' && (
          <div className="relative w-[300px] h-[300px] cursor-pointer group" onClick={handleOpenBox}>
            {/* Golden light aura on hover */}
            <div className="absolute inset-0 bg-yellow-300/10 rounded-full filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none scale-150" />
            
            {/* Inside Glow rays */}
            {boxState === 'opening' && (
              <motion.div
                className="absolute inset-0 rounded-full filter blur-md pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, rgba(250, 204, 21, 0.6) 0%, transparent 70%)' }}
                animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            )}

            {/* Lid (Top portion of box) */}
            <motion.div
              className="absolute inset-x-0 top-0 h-[100px] z-30 flex items-center justify-center"
              animate={
                boxState === 'opening'
                  ? { y: -200, rotate: -25, opacity: 0, scale: 0.8 }
                  : { y: 0 }
              }
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            >
              {/* Luxury Blue Lid Mesh */}
              <div className="w-[280px] h-[75px] rounded-t-xl bg-gradient-to-r from-primary to-primary-dark border-b-4 border-yellow-500 shadow-lg relative flex items-center justify-center">
                {/* Horizontal Ribbon segment */}
                {boxState === 'closed' && (
                  <div className="absolute inset-y-0 w-8 bg-yellow-500 shadow-md" />
                )}
                {/* Ribbon Bow on top */}
                {boxState === 'closed' && (
                  <div className="absolute -top-6 w-14 h-8 bg-yellow-600 rounded-full border-2 border-yellow-400 flex items-center justify-center shadow-md animate-bounce">
                    <Heart size={14} className="text-white fill-current animate-pulse" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Ribbon ties */}
            <AnimatePresence>
              {boxState === 'closed' && (
                <motion.div
                  className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
                  exit={{ scale: 0, opacity: 0, transition: { duration: 0.5 } }}
                >
                  {/* Vertical Ribbon */}
                  <div className="w-8 h-full bg-yellow-500 shadow-md absolute" />
                  {/* Horizontal Ribbon */}
                  <div className="h-8 w-full bg-yellow-500 shadow-md absolute" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Box Body (Bottom portion) */}
            <motion.div
              className="absolute inset-x-0 bottom-0 h-[210px] z-10 flex items-center justify-center"
              animate={boxState === 'opening' ? { scale: 0.9, opacity: 0.3 } : { scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-[270px] h-[200px] rounded-b-2xl bg-gradient-to-b from-primary-dark to-primary/80 border-t-2 border-primary-light shadow-2xl relative overflow-hidden flex items-center justify-center">
                {/* Inner shadows for depth */}
                <div className="absolute inset-0 bg-black/10" />
                {boxState === 'closed' && (
                  <p className="font-serif text-white/50 text-xs tracking-widest uppercase text-center mt-8 px-4 leading-relaxed select-none">
                    Click Bow to Open
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* ================= PRODUCT DISPLAY GRID (BLOOMED) ================= */}
        {boxState === 'opened' && (
          <motion.div
            className="w-full max-w-[95rem] mx-auto px-2 sm:px-6 grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5 sm:gap-6 py-10"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
          >
            {products.map((prod) => (
              <motion.div
                key={prod.id}
                variants={{
                  hidden: { opacity: 0, scale: 0.3, y: 150, rotate: -15 },
                  visible: {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    rotate: 0,
                    transition: { type: 'spring', damping: 18, stiffness: 100 },
                  },
                }}
                className="group"
              >
                <TiltCard
                  glowColor="rgba(30, 78, 156, 0.15)"
                  className="h-full flex flex-col justify-between cursor-pointer"
                  onClick={() => setSelectedProduct(prod)}
                >
                  <div>
                    {/* Image Arched Container */}
                    <div className="w-full aspect-[4/5] rounded-[16px] sm:rounded-[24px] md:rounded-[32px] overflow-hidden border border-primary/40 bg-white/40 dark:border-white/10 dark:bg-navy-light/20 p-1 sm:p-2 mb-2 sm:mb-6">
                      <div className="w-full h-full rounded-[12px] sm:rounded-[18px] md:rounded-[24px] overflow-hidden relative shadow-inner">
                        <img
                          src={prod.img}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                        />
                        {/* Handmade Badge */}
                        <span className="absolute top-1 left-1 sm:top-4 sm:left-4 px-1 py-0.5 sm:px-3.5 sm:py-1 text-[8px] sm:text-xs font-semibold rounded-full bg-white/90 text-primary dark:bg-navy-light/95 dark:text-secondary-light shadow-md border border-primary/10">
                          {prod.badge}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 w-full mb-1.5 sm:mb-3">
                      <h3 className="font-serif text-xs sm:text-lg md:text-2xl font-bold text-primary dark:text-white group-hover:text-primary-dark dark:group-hover:text-secondary-light transition-colors line-clamp-1 sm:line-clamp-none">
                        {prod.name}
                      </h3>
                      <span className="px-1 py-0.5 sm:px-3.5 sm:py-1 text-[9px] sm:text-xs md:text-sm font-semibold rounded-full bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary-light w-fit">
                        {prod.price}
                      </span>
                    </div>

                    <p className="text-sm text-primary/70 dark:text-gray-300 leading-relaxed mb-6 text-left line-clamp-3 hidden sm:block">
                      {prod.description}
                    </p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* ================= INSTAGRAM GALLERY ================= */}
      <section className="relative w-full py-24 overflow-hidden border-t border-primary/10 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center z-20 relative">
          <h2 className="font-serif text-base font-bold text-primary dark:text-secondary-light tracking-[0.25em] uppercase mb-4">
            Social Showcase
          </h2>
          <h3 className="font-serif text-3xl md:text-4xl font-semibold text-primary dark:text-white mb-16">
            Instagram Gallery
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
            {instagramFeed.map((feed, idx) => (
              <motion.a
                href="https://instagram.com/petalorah"
                target="_blank"
                rel="noreferrer"
                key={idx}
                className="group relative aspect-square rounded-2xl overflow-hidden shadow-md border border-white/50 dark:border-white/5 block"
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={feed.img}
                  alt="Insta Feed"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-primary/80 dark:bg-navy-dark/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-4">
                  <Heart size={20} className="fill-current text-red-400 mb-1" />
                  <span className="text-xs font-semibold">{feed.likes} likes</span>
                </div>
              </motion.a>
            ))}
          </div>

          <InteractiveButton
            variant="glass"
            onClick={() => window.open('https://instagram.com/petalorah', '_blank')}
          >
            Follow @petalorah
          </InteractiveButton>
        </div>
      </section>

      {/* ================= FINAL CALL TO ACTION ================= */}
      <section className="relative w-full py-28 text-center bg-gradient-to-b from-transparent to-primary/5 dark:to-primary-dark/10 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 z-20 relative">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full border border-primary/20 overflow-hidden shadow-lg mb-8 scale-110">
              <img src="/assets/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>

            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary dark:text-white leading-tight mb-6">
              Thank You For Supporting Handmade Art
            </h2>
            <p className="text-base md:text-lg text-primary/70 dark:text-gray-300 max-w-xl mx-auto mb-10 leading-relaxed">
              Every handmade creation carries a little piece of love, twisted and formed with patience. Get in touch for custom colors or custom gift packing options!
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <InteractiveButton
                variant="primary"
                onClick={() => window.open('https://instagram.com/petalorah', '_blank')}
              >
                Order on Instagram 
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </InteractiveButton>
              <InteractiveButton
                variant="glass"
                onClick={() => window.open('https://wa.me/916382735751', '_blank')}
              >
                Chat on WhatsApp 
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </InteractiveButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= PRODUCT DETAIL MODAL ================= */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 flex items-center justify-center p-6 z-[9995]">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
            />

            {/* Modal Box */}
            <motion.div
              className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto glass-modal rounded-[32px] md:rounded-[40px] p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 z-10"
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              {/* Close Button */}
              <button
                className="absolute top-5 right-5 p-2 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-primary/70 dark:text-gray-300 transition-colors z-20"
                onClick={() => setSelectedProduct(null)}
              >
                <X size={18} />
              </button>

              {/* Modal Left: Product Image */}
              <div className="w-full md:w-1/2 aspect-[4/5] md:aspect-[4/5] rounded-[24px] md:rounded-[28px] overflow-hidden border border-white/60 bg-white/20 dark:border-white/5 p-2 flex-shrink-0 max-h-[250px] md:max-h-none">
                <div className="w-full h-full rounded-[20px] overflow-hidden shadow-inner">
                  <img
                    src={selectedProduct.img}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Modal Right: Details */}
              <div className="flex flex-col justify-between items-start text-left w-full">
                <div className="w-full">
                  <span className="px-3.5 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary-light border border-primary/5 inline-block mb-4">
                    {selectedProduct.badge}
                  </span>
                  
                  <div className="flex items-baseline justify-between w-full border-b border-primary/10 dark:border-white/5 pb-4 mb-4">
                    <h2 className="font-serif text-3xl font-bold text-primary dark:text-white">
                      {selectedProduct.name}
                    </h2>
                    <span className="text-xl font-bold text-primary dark:text-secondary-light">
                      {selectedProduct.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-bold mb-4 uppercase tracking-widest">
                    <Heart size={12} className="fill-current" /> Authentic Pipe Cleaner Art
                  </div>

                  <p className="text-sm text-primary/70 dark:text-gray-300 leading-relaxed mb-6">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <InteractiveButton
                    variant="primary"
                    className="w-full py-3.5 flex justify-center items-center gap-2"
                    onClick={() => window.open('https://instagram.com/petalorah', '_blank')}
                  >
                    Order on Instagram 
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </InteractiveButton>
                  <InteractiveButton
                    variant="glass"
                    className="w-full py-3.5 flex justify-center items-center gap-2"
                    onClick={() => window.open('https://wa.me/916382735751', '_blank')}
                  >
                    Chat on WhatsApp 
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                  </InteractiveButton>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
