import React, { useEffect, useState } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { List, Package, FolderPlus, FilePlus2, Sparkles, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [stats, setStats] = useState({ categories: 0, products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const catCol = collection(db, 'categories');
        const prodCol = collection(db, 'products');
        
        const catCount = await getCountFromServer(catCol);
        const prodCount = await getCountFromServer(prodCol);
        
        setStats({
          categories: catCount.data().count,
          products: prodCount.data().count
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div style={{ position: 'relative', height: '100%', width: '100%' }}>
        <header className="page-header">
          <div>
            <h1 className="page-title">Overview</h1>
            <p style={{color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px'}}>Syncing live metrics...</p>
          </div>
        </header>
        <div className="skeleton-dashboard">
          {[1, 2].map(i => (
            <div key={i} className="glass-panel skeleton-stat-box skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ position: 'relative' }}
    >
      <header className="page-header">
        <motion.div variants={itemVariants}>
          <h1 className="page-title">Overview</h1>
          <p style={{color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px'}}>
            Welcome back to Lumina Command Center.
          </p>
        </motion.div>
      </header>

      <motion.div className="dashboard-stats" variants={itemVariants}>
        <motion.div 
          className="glass-panel stat-card"
          whileHover={{ y: -4, borderColor: 'var(--primary-glow)' }}
        >
          <div className="stat-icon-wrapper"><List size={28} strokeWidth={2.5} /></div>
          <div>
            <h3 className="stat-value">{stats.categories}</h3>
            <p className="stat-label">Total Categories</p>
          </div>
          
          {/* Decorative glowing orb */}
          <div style={{
            position: 'absolute',
            right: '-20px',
            top: '-20px',
            width: '100px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2), transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(20px)',
            pointerEvents: 'none'
          }} />
        </motion.div>
        
        <motion.div 
          className="glass-panel stat-card"
          whileHover={{ y: -4, borderColor: 'var(--accent-glow)' }}
        >
          <div className="stat-icon-wrapper" style={{ 
            color: 'var(--accent)', 
            backgroundColor: 'rgba(217, 119, 6, 0.15)',
            borderColor: 'rgba(217, 119, 6, 0.2)'
          }}>
            <Package size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="stat-value">{stats.products}</h3>
            <p className="stat-label">Total Products</p>
          </div>
          
          <div style={{
            position: 'absolute',
            right: '-20px',
            top: '-20px',
            width: '100px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(217, 119, 6, 0.15), transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(20px)',
            pointerEvents: 'none'
          }} />
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginTop: '56px' }}>
        <h2 style={{
          marginBottom: '24px', 
          fontSize: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          fontFamily: 'Outfit, sans-serif'
        }}>
          <Activity size={20} style={{color: 'var(--primary)'}} /> 
          Quick Operations
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          <motion.div 
            className="glass-panel"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '20px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <FolderPlus size={18} style={{ color: 'var(--text-main)' }} />
                </div>
                <h3 style={{fontSize: '17px', fontWeight: '600', fontFamily: 'Outfit, sans-serif'}}>Collections</h3>
              </div>
              <p style={{fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.5'}}>
                Create new display collections and organize lighting families.
              </p>
            </div>
            <Link to="/categories/new" className="btn-secondary" style={{width: '100%', justifyContent: 'center'}}>
              Add Category
            </Link>
          </motion.div>

          <motion.div 
            className="glass-panel"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '20px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <FilePlus2 size={18} style={{ color: 'var(--text-main)' }} />
                </div>
                <h3 style={{fontSize: '17px', fontWeight: '600', fontFamily: 'Outfit, sans-serif'}}>Inventory</h3>
              </div>
              <p style={{fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.5'}}>
                Upload new luxury lighting items, details, and lighting specs.
              </p>
            </div>
            <Link to="/products/new" className="btn-primary" style={{width: '100%', justifyContent: 'center'}}>
              Add Product
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
