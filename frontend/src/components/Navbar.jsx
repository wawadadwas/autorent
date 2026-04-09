import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, User, LogIn, Shield, ClipboardList } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        supabase.from('profiles').select('role').eq('id', session.user.id).single()
          .then(({ data }) => setRole(data?.role));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        supabase.from('profiles').select('role').eq('id', session.user.id).single()
          .then(({ data }) => setRole(data?.role));
      } else {
        setRole(null);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b bg-white/80 backdrop-blur-md text-foreground shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2 text-primary hover:opacity-80 transition-opacity">
              <Car className="h-6 w-6" />
              <span className="text-xl font-bold tracking-tight uppercase">AutoRent</span>
            </Link>
          </div>
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-sm font-bold hover:text-primary transition-colors">Home</Link>
            <Link to="/cars" className="text-sm font-bold hover:text-primary transition-colors">Fleet</Link>
            {session && (
              <Link to="/my-rentals" className="text-sm font-bold flex items-center gap-1 hover:text-primary transition-colors">
                <ClipboardList className="w-4 h-4" /> My Rentals
              </Link>
            )}
            {session && role === 'admin' && (
              <Link to="/admin" className="text-sm font-bold flex items-center gap-1 hover:text-primary transition-colors">
                <Shield className="w-4 h-4" /> Control Center
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <button onClick={handleLogout} className="flex items-center bg-zinc-950 text-white px-4 py-2 rounded-lg text-xs font-bold hover:scale-105 transition-all shadow-lg uppercase">
                Logout
              </button>
            ) : (
              <Link to="/login" className="flex items-center gap-2 text-sm font-bold hover:text-primary transition-colors">
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
