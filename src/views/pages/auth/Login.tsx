import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/controllers/context/AuthContext';
import { useTheme } from '@/controllers/context/ThemeContext';
import { motion } from 'framer-motion';

const Login = () => {
  const { login } = useAuth();
  const { palette: p, mode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(`${apiUrl}/auth/login`, { email, password });
      const { token, user } = response.data;
      
      login(user, token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: p.bg }}>
      <div 
        className="relative pointer-events-none absolute inset-0 overflow-hidden" 
        style={{ 
          backgroundImage: mode === 'dark' 
            ? `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)` 
            : `radial-gradient(circle at 2px 2px, ${p.border} 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} 
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 rounded-3xl p-10 border relative z-10"
        style={{ 
          background: p.cardBg, 
          borderColor: p.border,
          boxShadow: mode === 'dark' ? "0 40px 80px rgba(0,0,0,0.4)" : "0 40px 80px rgba(0,0,0,0.05)",
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="text-center">
          <h2 className="text-4xl font-extrabold mb-2" style={{ color: p.text, fontFamily: "'Instrument Serif', serif" }}>Welcome Back</h2>
          <p className="text-sm" style={{ color: p.textMuted }}>Please sign in to your account</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl p-4 text-sm border"
              style={{ background: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.2)', color: '#f87171' }}
            >
              {error}
            </motion.div>
          )}
          
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: p.textMuted }}>Email Address</label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                className="block w-full rounded-xl border px-4 py-3 outline-none transition-all focus:ring-1"
                style={{ 
                  background: mode === 'dark' ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", 
                  borderColor: p.border, 
                  color: p.text,
                  focusBorderColor: p.primary,
                  focusRingColor: p.primary
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: p.textMuted }}>Password</label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                className="block w-full rounded-xl border px-4 py-3 outline-none transition-all focus:ring-1"
                style={{ 
                  background: mode === 'dark' ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", 
                  borderColor: p.border, 
                  color: p.text
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 transition-all"
                style={{ accentColor: p.primary }}
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm" style={{ color: p.textMuted }}>Remember me</label>
            </div>
            <Link to="/forgot-password" size="sm" className="text-sm font-medium transition-colors" style={{ color: p.primary }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-xl px-4 py-3.5 text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
            style={{ 
              background: p.primary, 
              color: "#fff",
              boxShadow: `0 10px 20px ${p.primary}20`
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-sm">
          <span style={{ color: p.textMuted }}>Don't have an account?</span>{' '}
          <Link to="/register" className="font-bold transition-colors" style={{ color: p.primary }}>
            Create Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;












