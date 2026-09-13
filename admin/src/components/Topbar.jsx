import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, List, Package, LogOut, User, Mail } from 'lucide-react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Topbar = () => {
  const [userName, setUserName] = useState('');

  const formatNameFromEmail = (email) => {
    if (!email) return '';
    const prefix = email.split('@')[0];
    const nameWithoutNumbers = prefix.replace(/\d+$/, '');
    const parts = nameWithoutNumbers.split(/[._-]/).filter(Boolean);
    return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ');
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name = user.user_metadata?.full_name || user.user_metadata?.name || formatNameFromEmail(user.email);
        setUserName(name || 'Admin');
      }
    });
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Categories', path: '/categories', icon: List },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Inquiries', path: '/inquiries', icon: Mail },
  ];

  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: '72px',
        position: 'relative',
        zIndex: 50,
        background: 'rgba(15, 15, 17, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(200, 169, 110, 0.1)',
        borderRadius: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        flexShrink: 0
      }}
    >
      {/* Logo */}
      <div style={{
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '28px',
        fontWeight: '700',
        color: 'var(--text-main)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        width: '200px'
      }}>
        LUMINA<span style={{ color: 'var(--primary)' }}>.</span>
      </div>
      
      {/* Navigation */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {navItems.map((item) => (
          <NavLink 
            key={item.path}
            to={item.path} 
            title={item.name}
            style={({isActive}) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '16px',
              color: isActive ? '#0A0A0B' : 'var(--text-muted)',
              backgroundColor: isActive ? 'var(--primary)' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive ? '600' : '500',
              transition: 'all 0.2s ease',
              letterSpacing: '0.02em',
            })}
          >
            <item.icon size={18} style={{ color: 'inherit' }} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '200px', justifyContent: 'flex-end' }}>
        {userName && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '6px 12px 6px 6px',
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '20px',
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'rgba(200, 169, 110, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              flexShrink: 0,
            }}>
              <User size={14} />
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>
              {userName}
            </p>
          </div>
        )}
        
        <button 
          onClick={handleLogout} 
          title="Logout"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.05)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            borderRadius: '50%',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--danger-dim)';
            e.currentTarget.style.color = 'var(--danger)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
          }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default Topbar;
