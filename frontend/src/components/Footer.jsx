import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Footer = () => {
  const year = new Date().getFullYear();
  const [settings, setSettings] = useState({
    footer_email: 'romel.developer@gmail.com',
    footer_phone: '+63 912 345 6789',
    footer_location: 'Manila, Philippines',
    footer_socials: [
      { name: 'Instagram', url: '#' },
      { name: 'Facebook', url: '#' },
      { name: 'Twitter', url: '#' },
      { name: 'LinkedIn', url: '#' }
    ]
  });

  useEffect(() => {
    const fetchFooterSettings = async () => {
      const { data } = await supabase.from('site_settings').select('*').eq('id', 'landing_page').single();
      if (data) {
        setSettings({
          footer_email: data.footer_email || settings.footer_email,
          footer_phone: data.footer_phone || settings.footer_phone,
          footer_location: data.footer_location || settings.footer_location,
          footer_socials: (data.footer_socials && data.footer_socials.length > 0) ? data.footer_socials : settings.footer_socials,
        });
      }
    };
    fetchFooterSettings();
  }, []);

  return (
    <footer className="bg-zinc-950 text-white">

      {/* Top Divider Glow */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">

          {/* Brand Column */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-3xl font-black tracking-tight uppercase">
                Auto<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Rent</span>
              </h2>
              <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-bold">Premium Car Rentals</p>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm">
              Redefining the standard of luxury transport. Access the world's most prestigious automotive brands — fully insured, door-to-door, 24/7.
            </p>
            {/* Status indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/40">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              All systems operational
            </div>
          </div>

          {/* Contact Me */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Connect</h3>
            <ul className="space-y-4">
              <li className="group cursor-pointer">
                <div className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-1 group-hover:text-blue-400 transition-colors">Email</div>
                <a href={`mailto:${settings.footer_email}`} className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">{settings.footer_email}</a>
              </li>
              <li className="group cursor-pointer">
                <div className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-1 group-hover:text-blue-400 transition-colors">Channel</div>
                <div className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">{settings.footer_phone}</div>
              </li>
              <li className="group cursor-pointer">
                <div className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-1 group-hover:text-blue-400 transition-colors">Base</div>
                <div className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">{settings.footer_location}</div>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Network</h3>
            <div className="grid grid-cols-2 gap-3">
              {(settings.footer_socials || []).map((social, idx) => {
                const isValidUrl = social.url && social.url !== '#' && social.url.trim() !== '';
                const formatUrl = (url) => url.startsWith('http') ? url : `https://${url}`;
                
                return (
                  <a 
                    key={idx} 
                    href={isValidUrl ? formatUrl(social.url) : '#'} 
                    target={isValidUrl ? "_blank" : "_self"} 
                    rel="noopener noreferrer"
                    className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer group"
                    onClick={(e) => {
                      if (!isValidUrl) e.preventDefault();
                    }}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                      {social.name}
                    </span>
                  </a>
                );
              })}
            </div>
            <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.3em] pt-2 animate-pulse">Available for Projects</p>
          </div>

        </div>

        {/* Bottom Row */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/20 text-xs font-medium">
            © {year} AutoRent. All rights reserved.
          </p>
          <p className="text-white/20 text-xs font-medium">
            Designed &amp; Built by{' '}
            <span className="text-white/40 font-bold">Romel Ligligon</span>
            {' '}— Frontend &amp; Backend Developer
          </p>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
