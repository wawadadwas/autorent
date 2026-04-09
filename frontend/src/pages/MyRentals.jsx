import React, { useState, useEffect } from 'react';
import { Clock, Check, XCircle, Car, CalendarDays, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import SplitText from '../components/SplitText';

const MyRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('active'); // 'active' | 'past'

  useEffect(() => {
    const fetchMyRentals = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('rentals')
        .select('*, cars(make, model, year, image_url, price_per_day)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!error && data) setRentals(data);
      setLoading(false);
    };

    fetchMyRentals();
  }, []);

  const activeRentals = rentals.filter(r => !['returned', 'cancelled'].includes(r.status));
  const pastRentals = rentals.filter(r => ['returned', 'cancelled'].includes(r.status));
  const displayedRentals = activeFilter === 'active' ? activeRentals : pastRentals;

  const statusConfig = {
    pending: { color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: <Clock className="w-3.5 h-3.5" />, label: 'Pending' },
    confirmed: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: <Car className="w-3.5 h-3.5" />, label: 'Active' },
    returned: { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: <Check className="w-3.5 h-3.5" />, label: 'Returned' },
    cancelled: { color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', icon: <XCircle className="w-3.5 h-3.5" />, label: 'Cancelled' },
  };

  if (loading) return <div className="py-24 text-center text-xl animate-pulse">Loading your rentals...</div>;

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div>
        <SplitText text="My Rentals" className="text-4xl font-black tracking-tight uppercase block" />
        <p className="text-zinc-500 mt-2 font-medium">Track your current and past vehicle reservations.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'active', label: `Active (${activeRentals.length})` },
          { id: 'past', label: `History (${pastRentals.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`relative px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeFilter === tab.id 
                ? 'bg-zinc-950 text-white shadow-lg' 
                : 'bg-zinc-100 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Rental Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-4"
        >
          {displayedRentals.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-zinc-100 rounded-[2rem]">
              <Car className="w-12 h-12 mx-auto text-zinc-200 mb-4" />
              <p className="text-zinc-400 font-bold uppercase text-sm tracking-wide">
                {activeFilter === 'active' ? 'No active reservations' : 'No past reservations yet'}
              </p>
              <p className="text-zinc-300 text-xs mt-1">
                {activeFilter === 'active' ? 'Browse our fleet to book your first ride!' : 'Your completed rentals will appear here.'}
              </p>
            </div>
          ) : (
            displayedRentals.map((rental, idx) => {
              const car = rental.cars;
              const status = statusConfig[rental.status] || statusConfig.pending;
              const days = Math.max(1, Math.ceil((new Date(rental.end_date) - new Date(rental.start_date)) / (1000 * 60 * 60 * 24)));

              return (
                <motion.div
                  key={rental.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white border border-zinc-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col sm:flex-row"
                >
                  {/* Car Image */}
                  <div className="sm:w-56 h-48 sm:h-auto flex-shrink-0 relative overflow-hidden bg-zinc-100">
                    {car?.image_url ? (
                      <img 
                        src={car.image_url} 
                        alt={`${car.make} ${car.model}`} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-10 h-10 text-zinc-300" />
                      </div>
                    )}
                    {/* Status badge on image */}
                    <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest backdrop-blur-md ${status.color}`}>
                      {status.icon} {status.label}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-zinc-900">
                          {car ? `${car.make} ${car.model}` : 'Unknown Vehicle'}
                        </h3>
                        <div className="text-right">
                          <div className="text-lg font-black text-zinc-900 italic">${rental.total_price || (car?.price_per_day * days)}</div>
                          <div className="text-[10px] text-zinc-400 uppercase font-bold">{days} day{days > 1 ? 's' : ''}</div>
                        </div>
                      </div>
                      {car && <p className="text-xs text-zinc-400 uppercase font-bold tracking-wide mb-4">{car.year} Model</p>}

                      {/* Dates & Times */}
                      <div className="flex flex-wrap gap-4 text-xs">
                        <div className="flex items-center gap-2 bg-zinc-50 px-4 py-2.5 rounded-xl">
                          <CalendarDays className="w-3.5 h-3.5 text-zinc-400" />
                          <div>
                            <span className="font-black text-zinc-600">{new Date(rental.start_date).toLocaleDateString()}</span>
                            {rental.pickup_time && <span className="text-zinc-400 ml-1">at {rental.pickup_time}</span>}
                          </div>
                        </div>
                        <div className="text-zinc-300 flex items-center">→</div>
                        <div className="flex items-center gap-2 bg-zinc-50 px-4 py-2.5 rounded-xl">
                          <CalendarDays className="w-3.5 h-3.5 text-zinc-400" />
                          <div>
                            <span className="font-black text-zinc-600">{new Date(rental.end_date).toLocaleDateString()}</span>
                            {rental.return_time && <span className="text-zinc-400 ml-1">at {rental.return_time}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Drop-off location */}
                      {rental.dropoff_address && (
                        <div className="flex items-start gap-2 mt-3 text-xs text-zinc-400">
                          <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">{rental.dropoff_address}</span>
                        </div>
                      )}
                    </div>

                    {/* Booking ID */}
                    <div className="mt-4 pt-4 border-t border-zinc-50 flex justify-between items-center">
                      <span className="text-[10px] text-zinc-300 font-mono uppercase">Booking #{rental.id.split('-')[0]}</span>
                      <span className="text-[10px] text-zinc-300 font-bold uppercase">
                        Booked {new Date(rental.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MyRentals;
