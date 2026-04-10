import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Cars from './pages/Cars';
import AdminDashboard from './pages/AdminDashboard';
import MyRentals from './pages/MyRentals';
import Login from './pages/Login';
import { supabase } from './lib/supabase';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import InspectorGuard from './components/InspectorGuard';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        supabase.from('profiles').select('role').eq('id', session.user.id).single()
          .then(({ data }) => {
            setRole(data?.role);
            setLoading(false);
          });
      } else {
        setLoading(false);
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

  if (loading) return <div className="h-screen flex items-center justify-center animate-pulse">Authenticating...</div>;
  if (!session) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;

  return children;
};

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);
  return (
    <Router>
      <InspectorGuard>
        <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
          <Navbar />
          <main className="pt-24 pb-8 flex-grow text-zinc-950">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cars" element={<Cars />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/my-rentals" 
                element={
                  <ProtectedRoute>
                    <MyRentals />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </InspectorGuard>
    </Router>
  );
}

export default App;
