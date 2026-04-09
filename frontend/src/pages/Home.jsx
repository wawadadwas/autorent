import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';
import SplitText from '../components/SplitText';

const featuredCars = [
  { id: 1, make: 'Tesla', model: 'Model S', year: 2024, price_per_day: 150, image_url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop', slogan: 'Electric Luxury' },
  { id: 2, make: 'Porsche', model: '911 Carrera', year: 2023, price_per_day: 300, image_url: 'https://images.unsplash.com/photo-1503371471348-1058eb156d47?q=80&w=2070&auto=format&fit=crop', slogan: 'Unmatched Performance' },
  { id: 3, make: 'Mercedes', model: 'G-Class', year: 2024, price_per_day: 250, image_url: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=2069&auto=format&fit=crop', slogan: 'Commanding Presence' },
];

// Predefined high-fidelity visual mocks — keyed by mock_id
const featureMocks = {
  insured: (
    <div className="bg-white rounded-3xl shadow-2xl p-8 border border-zinc-100 max-w-sm w-full space-y-6">
      <div className="p-4 bg-green-50 rounded-2xl flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white">
          <Check className="w-6 h-6" />
        </div>
        <div>
          <div className="font-bold text-green-950">Security Active</div>
          <div className="text-green-700 text-xs italic">Premium Coverage</div>
        </div>
      </div>
    </div>
  ),
  concierge: (
    <div className="bg-zinc-900 rounded-3xl shadow-2xl p-6 w-full max-w-sm space-y-4">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="w-8 h-8 rounded-full bg-blue-500" />
        <div className="text-white font-medium">Concierge</div>
      </div>
      <div className="bg-blue-500 rounded-2xl p-3 text-white text-sm w-4/5 ml-auto italic">
        Book a table for 4.
      </div>
    </div>
  ),
  pricing: (
    <div className="bg-white rounded-[2rem] shadow-xl p-10 w-full max-w-sm border border-zinc-100 italic">
      <div className="text-zinc-400 uppercase tracking-tighter text-xs mb-1">TOTAL BALANCE</div>
      <div className="text-4xl font-black mb-8">$2,450.00</div>
      <div className="flex justify-between border-b pb-2">
        <span className="text-zinc-500">Rental Fee</span>
        <span className="font-bold font-mono">$2,100</span>
      </div>
    </div>
  ),
  delivery: (
    <div className="w-full max-w-sm aspect-video bg-zinc-200 rounded-3xl overflow-hidden shadow-2xl relative border-4 border-white">
      <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-lg flex items-center gap-4">
        <div className="w-12 h-12 bg-zinc-950 rounded-xl flex items-center justify-center text-white">
          <ArrowRight className="w-6 h-6" />
        </div>
        <div>
          <div className="font-black text-sm uppercase">ETA: 12 MINS</div>
          <div className="text-xs text-zinc-500 italic">911 GT3 • En Route</div>
        </div>
      </div>
    </div>
  ),
  perks: (
    <div className="bg-zinc-950 rounded-[2.5rem] shadow-2xl p-10 w-full max-w-sm border border-white/10 relative overflow-hidden italic">
      <div className="text-white/20 text-xs font-mono mb-8">AUTORENT NOIR</div>
      <div className="text-5xl text-white font-black leading-tight tracking-tight uppercase">VIP<br />ACCESS</div>
      <div className="h-1 w-1/4 bg-blue-500 rounded-full mt-4"></div>
    </div>
  ),
  fleet: (
    <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
      <div className="h-24 bg-white rounded-2xl shadow-lg border border-zinc-100 flex items-center justify-center font-bold italic text-zinc-950">GT3</div>
      <div className="h-24 bg-zinc-100 rounded-2xl shadow-lg border border-zinc-100 flex items-center justify-center font-bold italic text-zinc-950">SF90</div>
      <div className="h-24 bg-zinc-950 rounded-2xl shadow-lg flex items-center justify-center text-white text-xs font-bold uppercase tracking-widest">+ MORE</div>
    </div>
  )
};

const Home = () => {
  const containerRef = useRef(null);
  const heritageRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [carIndex, setCarIndex] = useState(0);

  // Dynamic Content State — defaults are shown even before DB loads
  const [content, setContent] = useState({
    hero_title: 'Experience the Extraordinary',
    hero_description: 'Premium car rentals designed for your ultimate driving pleasure. Book your dream ride in minutes.',
    typewriter_words: ['Extraordinary', 'Ultimate Luxury', 'Pure Power', 'True Elegance'],
    heritage_title: 'Redefining the standard of luxury transport.',
    heritage_description: "Founded on the belief that the journey is just as important as the destination, AutoRent brings unparalleled access to the world's most prestigious automotive brands.",
    heritage_image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=2070&auto=format&fit=crop',
    features_title: 'Why AutoRent?',
    features: [
      { id: 'insured', title: 'Fully Insured', desc: 'Every rental comes with comprehensive premium insurance. Focus on the thrill while we handle the rest.', points: ['Multi-million liability', 'Zero deductible', 'Roadside assistance'], color: 'from-green-400/20', mock_id: 'insured' },
      { id: 'concierge', title: '24/7 Concierge', desc: 'From restaurant reservations to vehicle swaps, our team is your silent partner on the road.', points: ['Live Chat Interface', 'Itinerary Planning', 'Emergency Response'], color: 'from-blue-400/20', reverse: true, mock_id: 'concierge' },
      { id: 'pricing', title: 'Transparent Pricing', desc: 'No hidden fees. Taxes, delivery, and full-tank options are revealed from the first click.', points: ['All-in pricing', 'Real-time tax calculation', 'Secure crypto-payments'], color: 'from-emerald-400/20', mock_id: 'pricing' },
      { id: 'delivery', title: 'Doorstep Delivery', desc: 'We bring the experience to you. Track your vehicle in real-time as it arrives. Detailed, fueled, and ready.', points: ['Real-time Tracking', 'Valet Delivery', 'Airport Collection'], color: 'from-orange-400/20', reverse: true, mock_id: 'delivery' },
      { id: 'perks', title: 'Exclusive Perks', desc: 'Joining AutoRent unlocks a world of racing events, private releases, and tiered rewards for loyal drivers.', points: ['VIP Track Days', 'Racing Events', 'Tiered Rewards'], color: 'from-purple-500/20', mock_id: 'perks' },
      { id: 'fleet', title: 'The Boutique Fleet', desc: "We don't do mass market. Every vehicle is a masterwork, specifically chosen for its character and feedback.", points: ['Hand-picked Selection', 'Concours Condition', 'Exotic Performance'], color: 'from-yellow-400/20', reverse: true, mock_id: 'fleet' }
    ]
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await supabase.from('site_settings').select('*').eq('id', 'landing_page').single();
        if (data) {
          setContent(prev => ({
            ...prev,
            ...data,
            // Keep defaults if DB columns don't exist yet
            features_title: data.features_title || prev.features_title,
            heritage_image: data.heritage_image || prev.heritage_image,
            features: (data.features && data.features.length > 0) ? data.features : prev.features,
            typewriter_words: (data.typewriter_words && data.typewriter_words.length > 0) ? data.typewriter_words : prev.typewriter_words,
          }));
        }
      } catch (e) {
        // Silently fall back to defaults
      }
    };
    fetchContent();
  }, []);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    setMousePos({
      x: (clientX - innerWidth / 2) / 25,
      y: (clientY - innerHeight / 2) / 25,
    });
  };

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const words = content.typewriter_words || [];
    if (words.length === 0) return;
    const i = currentWordIndex % words.length;
    const fullWord = words[i];
    const timer = setTimeout(() => {
      if (!isDeleting) {
        setCurrentText(fullWord.substring(0, currentText.length + 1));
        setTypingSpeed(150);
        if (currentText === fullWord) setTimeout(() => setIsDeleting(true), 2000);
      } else {
        setCurrentText(fullWord.substring(0, currentText.length - 1));
        setTypingSpeed(75);
        if (currentText === '') { setIsDeleting(false); setCurrentWordIndex(i + 1); }
      }
    }, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, content.typewriter_words, typingSpeed]);

  useEffect(() => {
    const interval = setInterval(() => setCarIndex(prev => (prev + 1) % featuredCars.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const nextCar = () => setCarIndex(prev => (prev + 1) % featuredCars.length);
  const prevCar = () => setCarIndex(prev => (prev - 1 + featuredCars.length) % featuredCars.length);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const scale = useTransform(scrollYProgress, [0, 0.1, 0.8, 1], [0.8, 1, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  const borderRadius = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], ['60px', '48px', '48px', '60px']);

  const { scrollYProgress: heritageScroll } = useScroll({ target: heritageRef, offset: ["start end", "end start"] });
  const heritageY = useTransform(heritageScroll, [0, 1], ["-15%", "15%"]);

  const particles = useMemo(() => [...Array(12)].map((_, i) => ({
    id: i,
    size: Math.random() * 400 + 150,
    x: Math.random() * 100,
    y: Math.random() * 100,
    color: ['bg-blue-400/20', 'bg-indigo-400/20', 'bg-purple-400/20', 'bg-blue-300/20'][Math.floor(Math.random() * 4)],
    factor: Math.random() * 20 + 20
  })), []);

  const activeCar = featuredCars[carIndex];

  return (
    <>
      <div className="pb-12 text-zinc-950">
        <div className="space-y-0">

        {/* Hero Section */}
        <section onMouseMove={handleMouseMove} className="relative pt-32 flex items-center justify-center min-h-screen overflow-hidden bg-white text-zinc-950">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {particles.map(p => (
              <div
                key={p.id}
                className={`absolute rounded-full blur-[100px] ${p.color}`}
                style={{
                  width: p.size, height: p.size,
                  left: `${p.x}%`, top: `${p.y}%`,
                  transform: `translate(${mousePos.x * p.factor / 30}px, ${mousePos.y * p.factor / 30}px)`,
                  transition: 'transform 0.1s ease-out'
                }}
              />
            ))}
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 text-center max-w-6xl mx-auto px-4"
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tight mb-8 leading-tight">
              {content.hero_title} <br className="hidden md:block" />
              <span className="inline-block relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500 whitespace-nowrap min-w-[2ch]">
                  {currentText}
                </span>
                <span className="animate-pulse absolute top-0 bottom-0 right-[-14px] w-[6px] md:w-[8px] bg-blue-500 rounded-full"></span>
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-zinc-600 mb-10 max-w-3xl mx-auto mt-12 font-medium leading-relaxed">
              {content.hero_description}
            </p>
          </motion.div>
        </section>

        {/* Featured Fleet Showcase — NOT Admin Editable */}
        <section ref={containerRef} className="relative h-[400vh] w-full bg-white mb-24 z-10">
          <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
            <motion.div
              className="w-full h-full bg-zinc-950 shadow-[0_0_80px_rgba(0,0,0,0.3)] overflow-hidden relative flex flex-col"
              style={{ scale, opacity, borderRadius }}
            >
              <div className="h-12 w-full bg-zinc-900/80 backdrop-blur-md border-b border-white/10 flex items-center px-6 z-20 relative">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="flex-1 text-center text-xs font-semibold text-zinc-500 tracking-widest uppercase">
                  Featured Fleet Showcase
                </div>
              </div>
              <div className="flex-1 w-full h-full relative group">
                <img
                  key={activeCar.id}
                  src={activeCar.image_url}
                  alt={activeCar.make}
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/20 to-transparent flex flex-col justify-center items-start px-12 sm:px-16 md:px-24 z-10 w-full h-full">
                  <div className="text-white font-bold tracking-widest text-sm mb-4 uppercase">{activeCar.slogan}</div>
                  <h3 className="text-5xl md:text-7xl font-extrabold text-white mb-2 leading-none">{activeCar.make}</h3>
                  <h4 className="text-2xl md:text-3xl font-light text-zinc-300 mb-8">{activeCar.model} • {activeCar.year}</h4>
                  <div className="text-2xl font-bold text-white mb-10">
                    ${activeCar.price_per_day} <span className="text-base text-zinc-400 font-normal">/ day</span>
                  </div>
                  <Link to="/cars" className="inline-flex max-w-fit whitespace-nowrap px-8 py-4 bg-white text-zinc-950 font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all hover:scale-105 shadow-2xl">Rent Now</Link>
                </div>
                <div className="absolute bottom-12 right-12 z-20 flex gap-4">
                  <button onClick={prevCar} className="p-4 rounded-full bg-zinc-800/50 text-white hover:bg-zinc-700 backdrop-blur-xl border border-white/10 transition-all"><ChevronLeft className="w-6 h-6" /></button>
                  <button onClick={nextCar} className="p-4 rounded-full bg-zinc-800/50 text-white hover:bg-zinc-700 backdrop-blur-xl border border-white/10 transition-all"><ChevronRight className="w-6 h-6" /></button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Heritage / About Section */}
        <section ref={heritageRef} className="max-w-7xl mx-auto px-4 mt-24 pb-32">
          <motion.div 
            initial={{ opacity: 0, y: 60 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-100px" }} 
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24"
          >
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-block px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 text-sm font-bold tracking-wide">
                OUR HERITAGE
              </div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-950 leading-tight">
                {content.heritage_title}
              </h2>
              <p className="text-2xl text-zinc-600 leading-relaxed">
                {content.heritage_description}
              </p>
            </div>
            <div className="lg:w-1/2 w-full h-[500px] lg:min-h-[600px] rounded-[3rem] overflow-hidden shadow-2xl relative group cursor-pointer">
              <motion.img 
                style={{ y: heritageY, scale: 1.2 }}
                src={content.heritage_image} 
                alt="Luxury" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.25] transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            </div>
          </motion.div>
        </section>

        {/* Why AutoRent? Features Section */}
        <section className="space-y-40 pb-40 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-100px" }} 
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-7xl mx-auto px-4 text-center mb-24 mt-20"
          >
            <SplitText text={content.features_title} className="text-4xl md:text-6xl font-black tracking-tight mb-4 uppercase block" delay={0.1} />
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto">High-fidelity experiences designed for the modern driver.</p>
          </motion.div>

          {(content.features || []).map((feature, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 60 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true, margin: "-100px" }} 
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              key={feature.id || idx} 
              className={`max-w-7xl mx-auto px-4 flex flex-col ${feature.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-20`}
            >
              <div className="lg:w-1/2 space-y-8">
                <SplitText text={feature.title} className="text-5xl font-black uppercase tracking-tight italic block" delay={0.3} />
                <p className="text-xl text-zinc-600 leading-relaxed font-medium">{feature.desc}</p>
                <div className="flex flex-wrap gap-3">
                  {(feature.points || []).map((p, i) => (
                    <span key={i} className="px-4 py-2 bg-zinc-100 rounded-full text-zinc-600 text-sm font-bold">{p}</span>
                  ))}
                </div>
              </div>
              <div className="lg:w-1/2 relative group w-full">
                <div className={`absolute -inset-10 bg-gradient-to-tr ${feature.color || 'from-blue-400/20'} via-transparent to-transparent blur-[120px] opacity-60 group-hover:opacity-100 transition-opacity`}></div>
                <div className="relative bg-zinc-50 rounded-[3rem] aspect-video flex items-center justify-center border border-zinc-100 overflow-hidden">
                  {feature.image_url ? (
                    <img
                      src={feature.image_url}
                      alt={feature.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="p-12 w-full h-full flex items-center justify-center">
                      {featureMocks[feature.mock_id] || null}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Developer Section */}
        <section className="max-w-7xl mx-auto px-4 py-32">
          <motion.div 
            initial={{ opacity: 0, y: 80 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-50px" }} 
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-zinc-950 rounded-[3rem] overflow-hidden p-12 md:p-20"
          >

            {/* Subtle background glow */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[160px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">

              {/* Photo */}
              <div className="flex-shrink-0">
                <div className="relative w-56 h-56 md:w-72 md:h-72">
                  {/* Glowing ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 blur-[2px] scale-[1.04]" />
                  <img
                    src="/developer.jpg"
                    alt="Romel Ligligon"
                    className="relative w-full h-full object-cover rounded-full border-4 border-zinc-900"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs font-bold uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Meet the Developer
                </div>

                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight flex flex-col items-start lg:items-start">
                  <SplitText text="Romel" delay={0.2} />
                  <SplitText text="Ligligon" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 pb-2" delay={0.4} />
                </h2>

                <p className="text-lg md:text-xl text-white/50 max-w-xl leading-relaxed font-medium">
                  The mind behind the machine. Romel is the <span className="text-white/80 font-bold">Frontend &amp; Backend Developer</span> who architected and built the entire AutoRent platform — from the database layer to every pixel on screen.
                </p>

                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  {['React', 'Node.js', 'Supabase', 'PostgreSQL', 'Tailwind CSS', 'Vite'].map(skill => (
                    <span key={skill} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm font-bold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        </section>

      </div>
    </div>
    <Footer />
    </>
  );
};

export default Home;
