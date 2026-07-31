import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, List, Package, LogOut, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Categories', path: '/categories', icon: List },
    { name: 'Products', path: '/products', icon: Package },
  ];

  return (
    <motion.div 
      className="glass-panel"
      initial={{ width: 280 }}
      animate={{ width: collapsed ? 88 : 280 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 16px',
        position: 'relative',
        zIndex: 50,
      }}
    >
      <button 
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          position: 'absolute',
          top: '32px',
          right: '-14px',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: '50%',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          zIndex: 60,
          backdropFilter: 'blur(10px)',
        }}
      >
        <motion.div
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronLeft size={16} />
        </motion.div>
      </button>

      <div style={{
        fontFamily: 'Outfit, sans-serif',
        fontSize: '24px',
        fontWeight: '800',
        letterSpacing: '0.12em',
        marginBottom: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        color: 'var(--text-main)',
        padding: collapsed ? '0' : '0 12px',
      }}>
        {collapsed ? 'L' : (
          <>
            Lumina<span style={{ color: 'var(--primary)' }}>.</span>
          </>
        )}
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {navItems.map((item) => (
          <NavLink 
            key={item.path}
            to={item.path} 
            title={item.name}
            style={({isActive}) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
              backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive ? '600' : '500',
              border: isActive ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
              transition: 'all 0.2s',
              justifyContent: collapsed ? 'center' : 'flex-start',
            })}
          >
            <item.icon size={20} style={{ minWidth: '20px', color: 'inherit' }} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
                >
                  {item.name}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: collapsed ? '12px' : '16px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              flexShrink: 0,
            }}>
              <User size={18} />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
                >
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                    {user.email}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        
        <button 
          onClick={handleLogout} 
          title="Logout"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px 16px',
            background: 'transparent',
            border: '1px solid transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            borderRadius: 'var(--radius-md)',
            justifyContent: collapsed ? 'center' : 'flex-start',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--danger-dim)';
            e.currentTarget.style.color = 'var(--danger)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <LogOut size={20} style={{ minWidth: '20px' }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                style={{ whiteSpace: 'nowrap', overflow: 'hidden', fontWeight: '500' }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
