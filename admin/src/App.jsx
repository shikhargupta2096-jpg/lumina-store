import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { AnimatePresence, motion } from 'framer-motion';

import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import CategoryForm from './pages/CategoryForm';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';

const AnimatedRoutes = () => {
  const location = useLocation();

  const pageVariants = {
    initial: { opacity: 0, y: 15, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, type: 'spring', bounce: 0.2 } },
    exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.2 } }
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <ProtectedRoute>
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{height: '100%'}}>
              <Dashboard />
            </motion.div>
          </ProtectedRoute>
        } />
        <Route path="/categories" element={
          <ProtectedRoute>
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{height: '100%'}}>
              <Categories />
            </motion.div>
          </ProtectedRoute>
        } />
        <Route path="/categories/new" element={
          <ProtectedRoute>
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{height: '100%'}}>
              <CategoryForm />
            </motion.div>
          </ProtectedRoute>
        } />
        <Route path="/categories/edit/:id" element={
          <ProtectedRoute>
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{height: '100%'}}>
              <CategoryForm />
            </motion.div>
          </ProtectedRoute>
        } />
        
        <Route path="/products" element={
          <ProtectedRoute>
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{height: '100%'}}>
              <Products />
            </motion.div>
          </ProtectedRoute>
        } />
        <Route path="/products/new" element={
          <ProtectedRoute>
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{height: '100%'}}>
              <ProductForm />
            </motion.div>
          </ProtectedRoute>
        } />
        <Route path="/products/edit/:id" element={
          <ProtectedRoute>
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{height: '100%'}}>
              <ProductForm />
            </motion.div>
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', filter: 'blur(10px)' }}
        />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(12px)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }} />
      
      {user ? (
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <AnimatedRoutes />
          </main>
        </div>
      ) : (
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
