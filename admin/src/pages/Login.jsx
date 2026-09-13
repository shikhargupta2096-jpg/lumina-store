import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Login successful');
      navigate('/');
    } catch (error) {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg-blob"></div>
      
      <div className="login-card">
        <h1 className="login-title">LUMINA<span>.</span></h1>
        <p style={{textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px', marginTop: '-30px', marginBottom: '35px', letterSpacing: '0.12em', fontWeight: '500'}}>CONTROL CENTER</p>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input 
              type="email" 
              className="form-control" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@lumina.com"
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{width: '100%', justifyContent: 'center', padding: '12px'}} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
