import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Edit2, Trash2, Layout, Shield, Mail, Lock, Check, Save, X, Image as ImageIcon, Eye, EyeOff, LayoutGrid, List } from 'lucide-react';
import { Icon } from '@iconify/react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('cars');
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile management states
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Site Settings states
  const [siteSettings, setSiteSettings] = useState({
    hero_title: 'Experience the Extraordinary',
    hero_description: 'Premium car rentals designed for your ultimate driving pleasure. Book your dream ride in minutes.',
    typewriter_words: ['Extraordinary', 'Ultimate Luxury', 'Pure Power', 'True Elegance'],
    heritage_title: 'Redefining the standard of luxury transport.',
    heritage_description: "Founded on the belief that the journey is just as important as the destination, AutoRent brings unparalleled access to the world's most prestigious automotive brands.",
    features_title: 'Why AutoRent?',
    features: [
      { id: 'insured', title: 'Fully Insured', desc: 'Every rental comes with comprehensive premium insurance. Focus on the thrill while we handle the rest.', points: ['Multi-million liability', 'Zero deductible', 'Roadside assistance'], color: 'from-green-400/20', mock_id: 'insured', image_url: '' },
      { id: 'concierge', title: '24/7 Concierge', desc: 'From restaurant reservations to vehicle swaps, our team is your silent partner on the road.', points: ['Live Chat Interface', 'Itinerary Planning', 'Emergency Response'], color: 'from-blue-400/20', mock_id: 'concierge', reverse: true, image_url: '' },
      { id: 'pricing', title: 'Transparent Pricing', desc: 'No hidden fees. Taxes, delivery, and full-tank options are revealed from the first click.', points: ['All-in pricing', 'Real-time tax calculation', 'Secure crypto-payments'], color: 'from-emerald-400/20', mock_id: 'pricing', image_url: '' },
      { id: 'delivery', title: 'Doorstep Delivery', desc: 'We bring the experience to you. Track your vehicle in real-time as it arrives. Detailed, fueled, and ready.', points: ['Real-time Tracking', 'Valet Delivery', 'Airport Collection'], color: 'from-orange-400/20', mock_id: 'delivery', reverse: true, image_url: '' },
      { id: 'perks', title: 'Exclusive Perks', desc: 'Joining AutoRent unlocks a world of racing events, private releases, and tiered rewards for loyal drivers.', points: ['VIP Track Days', 'Racing Events', 'Tiered Rewards'], color: 'from-purple-500/20', mock_id: 'perks', image_url: '' },
      { id: 'fleet', title: 'The Boutique Fleet', desc: "We don't do mass market. Every vehicle is a masterwork, specifically chosen for its character and feedback.", points: ['Hand-picked Selection', 'Concours Condition', 'Exotic Performance'], color: 'from-yellow-400/20', mock_id: 'fleet', reverse: true, image_url: '' },
    ],
    footer_email: 'romel.developer@gmail.com',
    footer_phone: '+63 912 345 6789',
    footer_location: 'Manila, Philippines',
    footer_socials: [
      { name: 'Instagram', url: '' },
      { name: 'Facebook', url: '' },
      { name: 'Twitter', url: '' },
      { name: 'LinkedIn', url: '' }
    ],
    heritage_image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=2070&auto=format&fit=crop'
  });
  const [cmsMsg, setCmsMsg] = useState({ type: '', text: '' });
  const [isDraggingAsset, setIsDraggingAsset] = useState(false);

  // Fleet Management states
  const [cars, setCars] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [carFormData, setCarFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price_per_day: '',
    description: '',
    image_url: '',
    quantity: 1
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setNewEmail(session.user.email);
        fetchProfileAndSettings(session.user.id);
        fetchCars();
        fetchRentals();
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchRentals = async () => {
    const { data } = await supabase.from('rentals').select('*, cars(make, model)').order('created_at', { ascending: false });
    if (data) setRentals(data);
  };

  const updateRentalStatus = async (id, newStatus) => {
    const { error } = await supabase.from('rentals').update({ status: newStatus }).eq('id', id);
    if (!error) {
      fetchRentals();
    } else {
      alert(error.message);
    }
  };

  const fetchCars = async () => {
    const { data } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
    if (data) setCars(data);
  };

  const defaultFeatures = [
    { id: 'insured', title: 'Fully Insured', desc: 'Every rental comes with comprehensive premium insurance. Focus on the thrill while we handle the rest.', points: ['Multi-million liability', 'Zero deductible', 'Roadside assistance'], color: 'from-green-400/20', mock_id: 'insured', image_url: '' },
    { id: 'concierge', title: '24/7 Concierge', desc: 'From restaurant reservations to vehicle swaps, our team is your silent partner on the road.', points: ['Live Chat Interface', 'Itinerary Planning', 'Emergency Response'], color: 'from-blue-400/20', mock_id: 'concierge', reverse: true, image_url: '' },
    { id: 'pricing', title: 'Transparent Pricing', desc: 'No hidden fees. Taxes, delivery, and full-tank options are revealed from the first click.', points: ['All-in pricing', 'Real-time tax calculation', 'Secure crypto-payments'], color: 'from-emerald-400/20', mock_id: 'pricing', image_url: '' },
    { id: 'delivery', title: 'Doorstep Delivery', desc: 'We bring the experience to you. Track your vehicle in real-time as it arrives. Detailed, fueled, and ready.', points: ['Real-time Tracking', 'Valet Delivery', 'Airport Collection'], color: 'from-orange-400/20', mock_id: 'delivery', reverse: true, image_url: '' },
    { id: 'perks', title: 'Exclusive Perks', desc: 'Joining AutoRent unlocks a world of racing events, private releases, and tiered rewards for loyal drivers.', points: ['VIP Track Days', 'Racing Events', 'Tiered Rewards'], color: 'from-purple-500/20', mock_id: 'perks', image_url: '' },
    { id: 'fleet', title: 'The Boutique Fleet', desc: "We don't do mass market. Every vehicle is a masterwork, specifically chosen for its character and feedback.", points: ['Hand-picked Selection', 'Concours Condition', 'Exotic Performance'], color: 'from-yellow-400/20', mock_id: 'fleet', reverse: true, image_url: '' },
  ];

  const fetchProfileAndSettings = async (userId) => {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
    setRole(profile?.role);
    
    const { data: settings } = await supabase.from('site_settings').select('*').eq('id', 'landing_page').single();
    if (settings) {
      setSiteSettings(prev => ({
        ...prev,
        ...settings,
        features_title: settings.features_title || 'Why AutoRent?',
        features: (settings.features && settings.features.length > 0) ? settings.features : defaultFeatures,
        typewriter_words: (settings.typewriter_words && settings.typewriter_words.length > 0) ? settings.typewriter_words : prev.typewriter_words,
        footer_email: settings.footer_email || prev.footer_email,
        footer_phone: settings.footer_phone || prev.footer_phone,
        footer_location: settings.footer_location || prev.footer_location,
        footer_socials: (settings.footer_socials && settings.footer_socials.length > 0) ? settings.footer_socials : prev.footer_socials,
        heritage_image: settings.heritage_image || prev.heritage_image,
      }));
    }
    
    setLoading(false);
  };

  const handleUpdateProfile = async (field) => {
    setProfileMsg({ type: 'loading', text: 'Sending confirmation link...' });
    const { error } = await supabase.auth.updateUser(
      field === 'email' ? { email: newEmail } : { password: newPassword }
    );
    
    if (error) {
      setProfileMsg({ type: 'error', text: error.message });
    } else {
      setProfileMsg({ type: 'success', text: `Confirmation sent to ${field === 'email' ? 'new email' : 'Gmail'}!` });
      if (field === 'password') setNewPassword('');
    }
  };

  const handleSaveSettings = async () => {
    setCmsMsg({ type: 'loading', text: 'Saving...' });

    // First, try saving everything including features
    const { error } = await supabase.from('site_settings').update(siteSettings).eq('id', 'landing_page');

    if (!error) {
      setCmsMsg({ type: 'success', text: 'Settings updated successfully!' });
      setTimeout(() => setCmsMsg({ type: '', text: '' }), 3000);
      return;
    }

    // If features/features_title columns don't exist yet, save without them
    if (error.message?.includes("features") || error.code === 'PGRST204') {
      const { hero_title, hero_description, typewriter_words, heritage_title, heritage_description, heritage_image } = siteSettings;
      const { error: fallbackError } = await supabase.from('site_settings')
        .update({ hero_title, hero_description, typewriter_words, heritage_title, heritage_description, heritage_image })
        .eq('id', 'landing_page');

      if (!fallbackError) {
        setCmsMsg({ type: 'error', text: '⚠️ Other settings saved! To save Features, run this SQL in Supabase: ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS features_title TEXT, ADD COLUMN IF NOT EXISTS features JSONB;' });
      } else {
        setCmsMsg({ type: 'error', text: fallbackError.message });
      }
    } else {
      setCmsMsg({ type: 'error', text: error.message });
    }

    setTimeout(() => setCmsMsg({ type: '', text: '' }), 10000);
  };

  const handleDeleteCar = async (id) => {
    if (!window.confirm('Are you sure you want to remove this asset?')) return;
    const { error } = await supabase.from('cars').delete().eq('id', id);
    if (!error) fetchCars();
  };

  const handleAssetDragOver = (e) => {
    e.preventDefault();
    setIsDraggingAsset(true);
  };

  const handleAssetDragLeave = () => {
    setIsDraggingAsset(false);
  };

  const handleAssetDrop = (e) => {
    e.preventDefault();
    setIsDraggingAsset(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCarFormData({ ...carFormData, image_url: ev.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenCarModal = (car = null) => {
    if (car) {
      setEditingCar(car);
      setCarFormData({
        make: car.make,
        model: car.model,
        year: car.year,
        price_per_day: car.price_per_day,
        description: car.description || '',
        image_url: car.image_url || '',
        quantity: car.quantity || 1
      });
    } else {
      setEditingCar(null);
      setCarFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        price_per_day: '',
        description: '',
        image_url: '',
        quantity: 1
      });
    }
    setIsCarModalOpen(true);
  };

  const handleSaveCar = async (e) => {
    e.preventDefault();
    const carData = { ...carFormData };
    
    let error;
    if (editingCar) {
      const { error: err } = await supabase.from('cars').update(carData).eq('id', editingCar.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('cars').insert([carData]);
      error = err;
    }

    if (!error) {
      setIsCarModalOpen(false);
      fetchCars();
    } else {
      alert(error.message);
    }
  };

  if (loading) return <div className="py-24 text-center animate-pulse italic">Authenticating Control Center...</div>;

  if (!session || role !== 'admin') {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-6 text-center px-4 h-[70vh]">
        <Shield className="w-20 h-20 text-red-500 mb-4" />
        <h1 className="text-5xl font-black uppercase tracking-tight text-zinc-900">Access Restricted</h1>
        <p className="text-zinc-500 font-medium max-w-md text-lg">Your account does not possess the clearance level required to access the central administration terminal.</p>
        <button 
          onClick={() => window.location.href = '/'} 
          className="mt-8 px-8 py-4 bg-zinc-950 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/10"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase">Control Center</h1>
          <p className="text-zinc-500 mt-2 font-medium">Logged in as {role?.toUpperCase()}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')} className="text-sm font-bold text-zinc-500 hover:text-red-500 transition-colors">Sign Out</button>
        </div>
      </div>

      <div className="flex border-b mb-12 space-x-12 overflow-x-auto pb-4 scrollbar-hide">
        {[
          { id: 'cars', label: 'Fleet', icon: () => <Icon icon="solar:car-bold" className="w-5 h-5" /> },
          { id: 'logs', label: 'Activity Logs', icon: () => <Icon icon="solar:history-bold" className="w-5 h-5" /> },
          { id: 'settings', label: 'Site Editor', icon: () => <Edit2 className="w-5 h-5" />, adminOnly: true },
          { id: 'security', label: 'Security', icon: () => <Shield className="w-5 h-5" /> },
        ].map((tab) => (
          (tab.adminOnly && role !== 'admin') ? null : (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap font-bold transition-all ${activeTab === tab.id ? 'text-primary' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              <tab.icon /> {tab.label}
            </button>
          )
        ))}
      </div>

      <AnimatePresence mode="wait">
      {activeTab === 'cars' && (
        <motion.div key="cars" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.25, ease: 'easeOut' }} className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <h2 className="text-2xl font-bold italic tracking-tight">MANAGE FLEET</h2>
              <div className="flex bg-zinc-100 p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  <List className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">List</span>
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Grid</span>
                </button>
              </div>
            </div>
            <button 
              onClick={() => handleOpenCarModal()}
              className="bg-zinc-950 text-white px-6 py-3 rounded-xl flex items-center shadow-lg hover:scale-105 transition-all text-sm font-bold uppercase"
            >
              <PlusCircle className="w-5 h-5 mr-2" /> Add New Asset
            </button>
          </div>

          {viewMode === 'list' ? (
            <div className="bg-white border rounded-[2rem] shadow-sm overflow-hidden text-sm">
              <table className="w-full text-left">
                <thead className="bg-zinc-50 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                  <tr>
                    <th className="p-6">Asset</th>
                    <th className="p-6">Inventory</th>
                    <th className="p-6">Cycle Rate</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {cars.map(car => {
                    const activeRentals = rentals.filter(r => r.car_id === car.id && !['returned', 'cancelled'].includes(r.status));
                    const available = Math.max(0, (car.quantity || 1) - activeRentals.length);
                    
                    return (
                      <tr key={car.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="p-6">
                          <div className="font-black text-zinc-900 uppercase italic">{car.make} {car.model}</div>
                          <div className="text-xs text-zinc-400 mt-1 line-clamp-1 max-w-xs">{car.description || 'No description provided.'}</div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-md font-bold text-[10px] uppercase ${available > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                              {available} / {car.quantity || 1} Available
                            </span>
                            {activeRentals.length > 0 && (
                              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter">
                                {activeRentals.length} Booked
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-6 font-bold text-primary">${car.price_per_day}</td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleOpenCarModal(car)} 
                              className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 rounded-xl text-zinc-500 hover:text-zinc-900 transition-all font-bold text-xs uppercase"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteCar(car.id)} 
                              className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-xl text-zinc-400 hover:text-red-500 transition-all font-bold text-xs uppercase"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map(car => (
                <div key={car.id} className="group bg-white border rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col">
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <img src={car.image_url} alt={car.make} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1 rounded-full text-xs font-black italic shadow-lg">
                      {car.year}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">{car.make} {car.model}</h3>
                        {(() => {
                           const activeRentals = rentals.filter(r => r.car_id === car.id && !['returned', 'cancelled'].includes(r.status));
                           const available = Math.max(0, (car.quantity || 1) - activeRentals.length);
                           return (
                             <div className="flex gap-2 mt-1">
                               <span className={`text-[10px] font-bold uppercase ${available > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                 {available} / {car.quantity || 1} Available
                               </span>
                             </div>
                           );
                        })()}
                      </div>
                      <div className="text-primary font-bold">${car.price_per_day}</div>
                    </div>
                    <p className="text-zinc-500 text-xs line-clamp-2 mb-6 flex-1 leading-relaxed">
                      {car.description || 'Secure this premium asset for your next strategic operation.'}
                    </p>
                    <div className="flex gap-2 pt-4 border-t border-zinc-100">
                      <button 
                        onClick={() => handleOpenCarModal(car)}
                        className="flex-1 py-3 rounded-xl bg-zinc-50 text-zinc-900 font-bold text-xs uppercase hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Details
                      </button>
                      <button 
                        onClick={() => handleDeleteCar(car.id)}
                        className="px-4 py-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'logs' && (
        <motion.div key="logs" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.25, ease: 'easeOut' }} className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold italic tracking-tight uppercase">ACTIVITY LOGS</h2>
          </div>
          <div className="bg-white border rounded-[2rem] shadow-sm overflow-hidden text-sm">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                <tr>
                  <th className="p-6">Asset</th>
                  <th className="p-6">Duration</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {rentals.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-zinc-400 font-medium">No rental activity logged yet.</td>
                  </tr>
                ) : (
                  rentals.map(rental => (
                    <tr key={rental.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-6">
                        <div className="font-black text-zinc-900 uppercase italic">
                          {rental.cars ? `${rental.cars.make} ${rental.cars.model}` : 'Unknown Asset'}
                        </div>
                        <div className="text-xs text-zinc-400 font-mono mt-1">ID: {rental.id.split('-')[0]}</div>
                      </td>
                      <td className="p-6">
                        <div className="font-bold text-zinc-700">{new Date(rental.start_date).toLocaleDateString()}</div>
                        <div className="text-xs text-zinc-400 mt-1 uppercase font-bold">To: {new Date(rental.end_date).toLocaleDateString()}</div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest
                          ${rental.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                            rental.status === 'confirmed' ? 'bg-blue-50 text-blue-600' :
                            rental.status === 'returned' ? 'bg-green-50 text-green-600' :
                            'bg-zinc-100 text-zinc-500'}`}
                        >
                          {rental.status}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        {rental.status !== 'returned' && rental.status !== 'cancelled' ? (
                          <div className="flex justify-end gap-2">
                            {rental.status === 'pending' && (
                              <button
                                onClick={() => updateRentalStatus(rental.id, 'confirmed')}
                                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold uppercase transition-all"
                              >
                                Confirm
                              </button>
                            )}
                            <button
                              onClick={() => updateRentalStatus(rental.id, 'returned')}
                              className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl text-xs font-bold uppercase transition-all"
                            >
                              Mark Returned
                            </button>
                            <button
                              onClick={() => updateRentalStatus(rental.id, 'cancelled')}
                              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold uppercase transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400 font-bold uppercase italic border-b border-transparent">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'settings' && (
        <motion.div key="settings" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.25, ease: 'easeOut' }} className="max-w-2xl space-y-12">
          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight">Hero Customization</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-zinc-400 mb-2 block">Primary Headline</label>
                <input 
                  type="text" 
                  value={siteSettings.hero_title}
                  onChange={(e) => setSiteSettings({...siteSettings, hero_title: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl border bg-zinc-50 focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-zinc-400 mb-2 block">Hero Description</label>
                <textarea 
                  rows={3}
                  value={siteSettings.hero_description}
                  onChange={(e) => setSiteSettings({...siteSettings, hero_description: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl border bg-zinc-50 outline-none resize-none"
                  placeholder="Describe your service..."
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-zinc-400 mb-2 block">Typewriter Words (Comma separated)</label>
                <input 
                  type="text" 
                  value={(siteSettings.typewriter_words || []).join(', ')}
                  onChange={(e) => setSiteSettings({...siteSettings, typewriter_words: e.target.value.split(',').map(w => w.trim())})}
                  className="w-full px-6 py-4 rounded-2xl border bg-zinc-50 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight">Heritage Section</h2>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Heritage Title"
                value={siteSettings.heritage_title}
                onChange={(e) => setSiteSettings({...siteSettings, heritage_title: e.target.value})}
                className="w-full px-6 py-4 rounded-2xl border bg-zinc-50 outline-none font-bold"
              />
              <textarea 
                rows={4}
                value={siteSettings.heritage_description}
                onChange={(e) => setSiteSettings({...siteSettings, heritage_description: e.target.value})}
                className="w-full px-6 py-4 rounded-2xl border bg-zinc-50 outline-none resize-none leading-relaxed"
              />
              <div className="pt-2">
                <label className="text-xs font-bold uppercase text-zinc-400 mb-2 block">Heritage Image URL (or upload)</label>
                <div className="flex gap-4 items-center">
                  {siteSettings.heritage_image && (
                    <img src={siteSettings.heritage_image} alt="Heritage Preview" className="w-16 h-12 object-cover rounded-lg border border-zinc-200" />
                  )}
                  <input 
                    type="url" 
                    placeholder="https://your-image-url.com/photo.jpg"
                    value={siteSettings.heritage_image?.startsWith('data:') ? '' : siteSettings.heritage_image}
                    onChange={(e) => setSiteSettings({...siteSettings, heritage_image: e.target.value})}
                    className="flex-1 px-4 py-3 rounded-xl border bg-zinc-50 outline-none text-xs"
                  />
                  <label className="flex items-center gap-2 px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl cursor-pointer transition-colors text-xs font-bold uppercase">
                    <ImageIcon className="w-4 h-4" /> Upload
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => setSiteSettings({...siteSettings, heritage_image: ev.target.result});
                      reader.readAsDataURL(file);
                    }} />
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Why AutoRent Section Editor */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase tracking-tight">Why AutoRent? Section</h2>
              <button
                onClick={() => {
                  const newFeature = { id: `feature_${Date.now()}`, title: 'New Feature', desc: 'Describe this feature here.', points: ['Point one', 'Point two'], color: 'from-blue-400/20', mock_id: 'insured', image_url: '', reverse: false };
                  setSiteSettings({ ...siteSettings, features: [...(siteSettings.features || []), newFeature] });
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-black uppercase hover:scale-105 transition-all"
              >
                <PlusCircle className="w-4 h-4" /> Add Card
              </button>
            </div>

            {/* Section Title */}
            <div>
              <label className="text-xs font-bold uppercase text-zinc-400 mb-2 block">Section Headline</label>
              <input
                type="text"
                value={siteSettings.features_title}
                onChange={(e) => setSiteSettings({ ...siteSettings, features_title: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl border bg-zinc-50 outline-none font-bold"
              />
            </div>

            {/* Feature Cards */}
            <div className="space-y-6">
              {(siteSettings.features || []).map((feature, fIdx) => (
                <div key={feature.id || fIdx} className="bg-zinc-50 border border-zinc-100 rounded-3xl overflow-hidden">
                  {/* Card Header */}
                  <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-100">
                    <span className="font-black uppercase italic text-sm text-zinc-700">{feature.title || `Card #${fIdx + 1}`}</span>
                    <button
                      onClick={() => {
                        const newFeatures = (siteSettings.features || []).filter((_, i) => i !== fIdx);
                        setSiteSettings({ ...siteSettings, features: newFeatures });
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-xl transition-all text-xs font-bold uppercase"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Image */}
                    <div>
                      <label className="text-[10px] font-bold uppercase text-zinc-400 mb-2 block">Image (paste URL or upload)</label>
                      <div className="flex gap-3 items-center">
                        {feature.image_url ? (
                          <div className="relative w-24 h-16 rounded-xl overflow-hidden border border-zinc-200 flex-shrink-0">
                            <img src={feature.image_url} alt="" className="w-full h-full object-cover" />
                            <button
                              onClick={() => {
                                const nf = [...(siteSettings.features || [])];
                                nf[fIdx] = { ...nf[fIdx], image_url: '' };
                                setSiteSettings({ ...siteSettings, features: nf });
                              }}
                              className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-24 h-16 rounded-xl border-2 border-dashed border-zinc-200 bg-white flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="w-5 h-5 text-zinc-300" />
                          </div>
                        )}
                        <div className="flex-1 space-y-2">
                          <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-zinc-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group">
                            <ImageIcon className="w-4 h-4 text-zinc-400 group-hover:text-blue-400 transition-colors" />
                            <span className="text-xs font-bold text-zinc-400 uppercase group-hover:text-blue-500 transition-colors">
                              {feature.image_url ? 'Replace Image' : 'Upload Image'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  const nf = [...(siteSettings.features || [])];
                                  nf[fIdx] = { ...nf[fIdx], image_url: ev.target.result };
                                  setSiteSettings({ ...siteSettings, features: nf });
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                          <p className="text-[10px] text-zinc-400 text-center">or paste an image URL:</p>
                          <input
                            type="url"
                            placeholder="https://your-image-url.com/photo.jpg"
                            value={feature.image_url?.startsWith('data:') ? '' : (feature.image_url || '')}
                            onChange={(e) => {
                              const nf = [...(siteSettings.features || [])];
                              nf[fIdx] = { ...nf[fIdx], image_url: e.target.value };
                              setSiteSettings({ ...siteSettings, features: nf });
                            }}
                            className="w-full px-4 py-2 rounded-xl border bg-white outline-none text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Title + Description */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-400 mb-1 block">Title</label>
                        <input
                          type="text"
                          value={feature.title}
                          onChange={(e) => {
                            const nf = [...(siteSettings.features || [])];
                            nf[fIdx] = { ...nf[fIdx], title: e.target.value };
                            setSiteSettings({ ...siteSettings, features: nf });
                          }}
                          className="w-full px-4 py-2.5 rounded-xl border bg-white outline-none font-bold text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-400 mb-1 block">Bullet Points (comma separated)</label>
                        <input
                          type="text"
                          value={(feature.points || []).join(', ')}
                          onChange={(e) => {
                            const nf = [...(siteSettings.features || [])];
                            nf[fIdx] = { ...nf[fIdx], points: e.target.value.split(',').map(p => p.trim()) };
                            setSiteSettings({ ...siteSettings, features: nf });
                          }}
                          className="w-full px-4 py-2.5 rounded-xl border bg-white outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-zinc-400 mb-1 block">Description</label>
                      <textarea
                        rows={2}
                        value={feature.desc}
                        onChange={(e) => {
                          const nf = [...(siteSettings.features || [])];
                          nf[fIdx] = { ...nf[fIdx], desc: e.target.value };
                          setSiteSettings({ ...siteSettings, features: nf });
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border bg-white outline-none text-sm resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {(siteSettings.features || []).length === 0 && (
                <div className="text-center py-16 text-zinc-300 border-2 border-dashed border-zinc-100 rounded-3xl">
                  <PlusCircle className="w-10 h-10 mx-auto mb-3" />
                  <p className="font-bold uppercase text-sm tracking-wide">No feature cards yet. Click "Add Card" to create one.</p>
                </div>
              )}
            </div>
          </section>

          {/* Footer Management */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight">Footer Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Contact Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 mb-1 block tracking-widest">Public Email</label>
                    <input 
                      type="email"
                      value={siteSettings.footer_email}
                      onChange={(e) => setSiteSettings({...siteSettings, footer_email: e.target.value})}
                      className="w-full px-5 py-3 rounded-xl border bg-zinc-50 outline-none text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 mb-1 block tracking-widest">Contact Number</label>
                    <input 
                      type="text"
                      value={siteSettings.footer_phone}
                      onChange={(e) => setSiteSettings({...siteSettings, footer_phone: e.target.value})}
                      className="w-full px-5 py-3 rounded-xl border bg-zinc-50 outline-none text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 mb-1 block tracking-widest">Base Location</label>
                    <input 
                      type="text"
                      value={siteSettings.footer_location}
                      onChange={(e) => setSiteSettings({...siteSettings, footer_location: e.target.value})}
                      className="w-full px-5 py-3 rounded-xl border bg-zinc-50 outline-none text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Social Network Links</h3>
                <div className="space-y-4">
                  {(siteSettings.footer_socials || []).map((social, sIdx) => (
                    <div key={social.name}>
                      <label className="text-[10px] font-bold uppercase text-zinc-400 mb-1 block tracking-widest">{social.name} URL</label>
                      <input 
                        type="url"
                        placeholder={`https://${social.name.toLowerCase()}.com/yourprofile`}
                        value={social.url}
                        onChange={(e) => {
                          const ns = [...(siteSettings.footer_socials || [])];
                          ns[sIdx] = { ...ns[sIdx], url: e.target.value };
                          setSiteSettings({...siteSettings, footer_socials: ns});
                        }}
                        className="w-full px-5 py-3 rounded-xl border bg-zinc-50 outline-none text-sm font-medium"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {cmsMsg.text && (
            <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${cmsMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              <Check className="w-4 h-4" /> {cmsMsg.text}
            </div>
          )}

          <button 
            onClick={handleSaveSettings}
            disabled={cmsMsg.type === 'loading'}
            className="w-full bg-zinc-950 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 cursor-pointer"
          >
            {cmsMsg.type === 'loading' ? 'Pushing Updates...' : 'Publish to Live Site'}
          </button>
        </motion.div>
      )}

      {activeTab === 'security' && (
        <motion.div key="security" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.25, ease: 'easeOut' }} className="max-w-xl space-y-12">
          <div className="space-y-8 bg-zinc-50 p-10 rounded-[3rem] border border-zinc-100">
            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
              <Shield className="text-primary" /> Guard Identity
            </h2>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase text-zinc-400 mb-2 block">Email Recovery</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      type="email" 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 rounded-2xl border bg-white outline-none"
                    />
                  </div>
                  <button onClick={() => handleUpdateProfile('email')} className="px-6 py-4 bg-zinc-950 text-white rounded-2xl font-bold text-xs uppercase">Update</button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-zinc-400 mb-2 block">Cipher Update</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new cipher"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-14 py-4 rounded-2xl border bg-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <button onClick={() => handleUpdateProfile('password')} className="px-6 py-4 bg-zinc-950 text-white rounded-2xl font-bold text-xs uppercase">Update</button>
                </div>
              </div>
            </div>
          </div>

          {profileMsg.text && (
            <div className={`p-4 rounded-xl font-bold text-sm flex items-center gap-2 ${profileMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
              <Mail className="w-4 h-4" /> {profileMsg.text}
            </div>
          )}
          )}
        </motion.div>
      )}
      </AnimatePresence>

      {/* Car management Modal */}
      {isCarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center p-8 border-b">
              <h3 className="text-2xl font-black uppercase tracking-tight">{editingCar ? 'Update Asset' : 'New Strategic Asset'}</h3>
              <button onClick={() => setIsCarModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSaveCar} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase text-zinc-400 mb-2 block">Make</label>
                  <input 
                    required
                    type="text" 
                    value={carFormData.make}
                    onChange={(e) => setCarFormData({...carFormData, make: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border bg-zinc-50 outline-none"
                    placeholder="e.g. Porsche"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-zinc-400 mb-2 block">Model</label>
                  <input 
                    required
                    type="text" 
                    value={carFormData.model}
                    onChange={(e) => setCarFormData({...carFormData, model: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border bg-zinc-50 outline-none"
                    placeholder="e.g. 911 GT3"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase text-zinc-400 mb-2 block">Year</label>
                  <input 
                    required
                    type="number" 
                    value={carFormData.year}
                    onChange={(e) => setCarFormData({...carFormData, year: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border bg-zinc-50 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-zinc-400 mb-2 block">Daily Rate ($)</label>
                  <input 
                    required
                    type="number" 
                    value={carFormData.price_per_day}
                    onChange={(e) => setCarFormData({...carFormData, price_per_day: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border bg-zinc-50 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-zinc-400 mb-2 block">Total Quantity</label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    value={carFormData.quantity}
                    onChange={(e) => setCarFormData({...carFormData, quantity: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border bg-zinc-50 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-zinc-400 mb-2 block">Image Asset (Drop or URL)</label>
                <div 
                  className={`relative group rounded-[2rem] border-2 border-dashed transition-all duration-300 ${isDraggingAsset ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-zinc-200 bg-zinc-50'}`}
                  onDragOver={handleAssetDragOver}
                  onDragLeave={handleAssetDragLeave}
                  onDrop={handleAssetDrop}
                >
                  <div className="p-8 flex flex-col items-center justify-center gap-4">
                    {carFormData.image_url ? (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl border border-white/20">
                        <img src={carFormData.image_url} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <p className="text-white text-xs font-black uppercase tracking-widest">Drop new image to replace</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <ImageIcon className="w-8 h-8 text-zinc-300" />
                        </div>
                        <p className="text-sm font-bold text-zinc-400 uppercase tracking-tighter">Drag Asset Here</p>
                        <p className="text-xs text-zinc-300">or use the input below</p>
                      </div>
                    )}
                  </div>

                  <div className="px-8 pb-8">
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input 
                        required
                        type="url" 
                        value={carFormData.image_url}
                        onChange={(e) => setCarFormData({...carFormData, image_url: e.target.value})}
                        className="w-full pl-12 pr-10 py-3 rounded-xl border bg-white outline-none text-sm font-medium focus:ring-2 focus:ring-primary/20"
                        placeholder="Paste image URL..."
                      />
                      <label className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1.5 hover:bg-zinc-100 rounded-lg transition-colors">
                        <PlusCircle className="w-4 h-4 text-zinc-400" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setCarFormData({ ...carFormData, image_url: ev.target.result });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-zinc-400 mb-2 block">Asset Description</label>
                <textarea 
                  required
                  rows={4}
                  value={carFormData.description}
                  onChange={(e) => setCarFormData({...carFormData, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border bg-zinc-50 outline-none resize-none leading-relaxed"
                  placeholder="Tell the story of this vehicle..."
                />
              </div>
              <button type="submit" className="w-full bg-zinc-950 text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-xl">
                {editingCar ? 'Update Asset' : 'Deploy Asset'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
