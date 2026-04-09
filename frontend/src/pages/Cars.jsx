import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Check, X, Info, Clock, MapPin, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SplitText from '../components/SplitText';
import { motion, AnimatePresence } from 'framer-motion';

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pickupTime, setPickupTime] = useState('09:00');
  const [returnTime, setReturnTime] = useState('09:00');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [dropoffCoords, setDropoffCoords] = useState({ lat: 14.5995, lng: 120.9842 }); // Default: Manila
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [selectedCar, setSelectedCar] = useState(null);
  const [renting, setRenting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Geocode address using Nominatim
  const searchLocation = async () => {
    if (!dropoffAddress.trim()) return;
    setSearchingLocation(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(dropoffAddress)}&limit=1`);
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setDropoffCoords({ lat: parseFloat(lat), lng: parseFloat(lon) });
        setDropoffAddress(data[0].display_name);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
    setSearchingLocation(false);
  };

  // Initialize and update the Leaflet map
  useEffect(() => {
    if (!selectedCar || !mapRef.current) return;

    // Load Leaflet CSS dynamically
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS dynamically
    const loadLeaflet = () => {
      return new Promise((resolve) => {
        if (window.L) { resolve(window.L); return; }
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve(window.L);
        document.head.appendChild(script);
      });
    };

    loadLeaflet().then((L) => {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (!mapRef.current) return;

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = L.map(mapRef.current, {
            scrollWheelZoom: true,
          }).setView([dropoffCoords.lat, dropoffCoords.lng], 14);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
          }).addTo(mapInstanceRef.current);

          markerRef.current = L.marker([dropoffCoords.lat, dropoffCoords.lng], { draggable: true }).addTo(mapInstanceRef.current);

          // Allow user to drag marker to set location  
          markerRef.current.on('dragend', () => {
            const pos = markerRef.current.getLatLng();
            setDropoffCoords({ lat: pos.lat, lng: pos.lng });
          });

          // Click on map to move marker
          mapInstanceRef.current.on('click', (e) => {
            markerRef.current.setLatLng(e.latlng);
            setDropoffCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
          });
        } else {
          mapInstanceRef.current.setView([dropoffCoords.lat, dropoffCoords.lng], 14);
          markerRef.current.setLatLng([dropoffCoords.lat, dropoffCoords.lng]);
        }
      }, 100);
    });

    return () => {
      // Cleanup map on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [selectedCar, dropoffCoords.lat, dropoffCoords.lng]);

  const handleRent = async () => {
    if (!startDate || !endDate) {
      alert('Please select start and end dates');
      return;
    }

    setRenting(true);
    
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Please login to reserve an asset');
      setRenting(false);
      return;
    }

    const { error: rentError } = await supabase.from('rentals').insert([
      {
        user_id: session.user.id,
        car_id: selectedCar.id,
        start_date: startDate,
        end_date: endDate,
        pickup_time: pickupTime,
        return_time: returnTime,
        dropoff_address: dropoffAddress,
        dropoff_lat: dropoffCoords.lat,
        dropoff_lng: dropoffCoords.lng,
        status: 'confirmed',
        total_price: selectedCar.price_per_day * (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
      }
    ]);

    if (!rentError) {
      setSuccess(true);
      // Refresh rentals
      const { data } = await supabase.from('rentals').select('*');
      if (data) setRentals(data);
    } else {
      alert(rentError.message);
    }
    setRenting(false);
  };

  const closeDetails = () => {
    setSelectedCar(null);
    setSuccess(false);
  };

  useEffect(() => {
    // Attempt to fetch cars from API
    const fetchData = async () => {
      try {
        const { data: carsData, error: carsError } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
        if (carsError) throw carsError;
        setCars(carsData);

        const { data: rentalsData, error: rentalsError } = await supabase.from('rentals').select('*');
        if (rentalsError) throw rentalsError;
        setRentals(rentalsData);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Note: Database not connected properly.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="py-24 text-center text-xl animate-pulse">Loading premium fleet...</div>;

  return (
    <div className="py-8 space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div>
        <SplitText text="Our Fleet" className="text-4xl font-bold tracking-tight block" />
        <p className="text-muted-foreground mt-2">Choose from our exclusive collection of premium vehicles.</p>
      </div>

      {error && (
        <div className="bg-amber-500/10 text-amber-600 border border-amber-500/20 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cars.map((car) => (
          <motion.div layoutId={`car-card-${car.id}`} key={car.id} className="group rounded-3xl overflow-hidden bg-card border shadow-sm hover:shadow-xl transition-all">
            <motion.div layoutId={`car-image-container-${car.id}`} className="aspect-[4/3] overflow-hidden relative bg-muted">
              <motion.img 
                layoutId={`car-image-${car.id}`}
                src={car.image_url || 'https://via.placeholder.com/600x400?text=No+Image'} 
                alt={`${car.make} ${car.model}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-sm font-semibold shadow-sm text-zinc-950">
                ${car.price_per_day} <span className="text-muted-foreground font-normal">/ day</span>
              </div>
            </motion.div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-xl font-bold">{car.make} {car.model}</h3>
                {(() => {
                  const activeRentals = rentals.filter(r => r.car_id === car.id && !['returned', 'cancelled'].includes(r.status));
                  const available = Math.max(0, (car.quantity || 5) - activeRentals.length);
                  return (
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${available > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {available > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  );
                })()}
              </div>
              <p className="text-muted-foreground text-sm mb-4">{car.year} Model</p>
              
              {(() => {
                const activeRentals = rentals.filter(r => r.car_id === car.id && !['returned', 'cancelled'].includes(r.status));
                const available = Math.max(0, (car.quantity || 5) - activeRentals.length);
                if (available === 0 && activeRentals.length > 0) {
                  const sortedRentals = [...activeRentals].sort((a, b) => new Date(a.end_date) - new Date(b.end_date));
                  const nextDate = sortedRentals[0].end_date;
                  return (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-tight mb-4 bg-amber-50 p-2 rounded-lg">
                      <Info className="w-3 h-3" /> Expected back: {new Date(nextDate).toLocaleDateString()}
                    </div>
                  );
                }
                return null;
              })()}

              <button 
                onClick={() => setSelectedCar(car)}
                className="block w-full text-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Antigravity-Style Floating Modal */}
      <AnimatePresence>
      {selectedCar && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-zinc-950/80 backdrop-blur-xl transition-all duration-300"
        >
          <motion.div 
            layoutId={`car-card-${selectedCar.id}`}
            className="w-full max-w-5xl max-h-[95vh] bg-zinc-900 rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 relative z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={closeDetails} 
              className="absolute top-6 right-6 z-10 p-3 bg-black/40 text-white hover:bg-black/80 backdrop-blur-md rounded-full transition-all"
            >
              <X className="h-6 w-6" />
            </button>
            
            <motion.div layoutId={`car-image-container-${selectedCar.id}`} className="w-full lg:w-1/2 h-[300px] lg:h-auto relative">
              <motion.img 
                layoutId={`car-image-${selectedCar.id}`}
                src={selectedCar.image_url || 'https://via.placeholder.com/800x600'} 
                alt={`${selectedCar.make} ${selectedCar.model}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            <div className="w-full lg:w-1/2 p-8 lg:p-12 overflow-y-auto bg-zinc-900 border-l border-white/5">
              <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-widest mb-6 border border-blue-500/20">
                Premium Selection
              </div>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-2 text-white uppercase italic">{selectedCar.make}</h2>
              <h3 className="text-2xl font-light text-zinc-400 mb-8 uppercase tracking-widest">{selectedCar.model} • {selectedCar.year}</h3>
              
              <div className="text-3xl font-black mb-8 items-baseline flex gap-2 text-white italic">
                ${selectedCar.price_per_day} <span className="text-lg text-zinc-500 font-normal not-italic">/ day</span>
              </div>
              
              <p className="text-base leading-relaxed text-zinc-300 mb-10 font-medium">
                Experience the pure joy of driving this top-tier {selectedCar.make}. Meticulously maintained and fully insured for your ultimate peace of mind.
              </p>
              
              <div className="bg-zinc-800/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
                <h4 className="font-bold text-white uppercase tracking-widest text-xs flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400"/> Select Operation Window
                </h4>

                {/* Date + Time Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Departure Date</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all font-bold text-sm text-white appearance-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Pickup Time</label>
                    <input 
                      type="time" 
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all font-bold text-sm text-white appearance-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Return Date</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all font-bold text-sm text-white appearance-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Return Time</label>
                    <input 
                      type="time" 
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all font-bold text-sm text-white appearance-none" 
                    />
                  </div>
                </div>

                {/* Drop-off Location */}
                <div className="space-y-3">
                  <h4 className="font-bold text-white uppercase tracking-widest text-xs flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" /> Drop-off Location
                  </h4>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={dropoffAddress}
                      onChange={(e) => setDropoffAddress(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
                      placeholder="Search address or place..."
                      className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all text-sm text-white placeholder:text-zinc-600" 
                    />
                    <button 
                      onClick={searchLocation}
                      disabled={searchingLocation}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                  <div 
                    className={`relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-800 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${mapExpanded ? 'h-[400px] shadow-[0_0_60px_rgba(59,130,246,0.15)]' : 'h-[200px]'}`}
                    onMouseEnter={() => {
                      setMapExpanded(true);
                      setTimeout(() => { if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize(); }, 550);
                    }}
                    onMouseLeave={() => {
                      setMapExpanded(false);
                      setTimeout(() => { if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize(); }, 550);
                    }}
                  >
                    <div 
                      ref={mapRef} 
                      className="w-full h-full"
                      style={{ zIndex: 0 }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-600 text-center">{mapExpanded ? 'Scroll to zoom • Click or drag pin to set location' : 'Hover to expand • Click or drag pin to set drop-off point'}</p>
                </div>
                
                {(() => {
                  const activeRentals = rentals.filter(r => r.car_id === selectedCar.id && !['returned', 'cancelled'].includes(r.status));
                  const available = Math.max(0, (selectedCar.quantity || 5) - activeRentals.length);
                  
                  if (success) {
                    return (
                      <div className="w-full py-4 text-center rounded-xl bg-green-500/10 text-green-600 font-bold tracking-wide flex items-center justify-center">
                        <Check className="mr-2 h-6 w-6" /> Booking Confirmed
                      </div>
                    );
                  }

                  if (available === 0) {
                    return (
                      <div className="w-full py-4 text-center rounded-xl bg-zinc-100 text-zinc-400 font-bold tracking-wide uppercase text-sm border border-dashed">
                        Currently Fully Booked
                      </div>
                    );
                  }

                  return (
                      <button 
                        onClick={handleRent}
                        disabled={renting}
                        className="w-full py-5 text-center rounded-2xl text-white bg-blue-600 font-black uppercase tracking-widest text-sm hover:bg-blue-500 transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)] disabled:opacity-50 active:scale-[0.98]"
                      >
                        {renting ? 'Processing Transaction...' : 'Establish Reservation'}
                      </button>
                  );
                })()}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default Cars;
