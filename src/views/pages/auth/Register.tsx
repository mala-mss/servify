import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '@/controllers/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  yearsOfExp: string;
  workLate: boolean;
  workweek: string[];
  workHours: { start: string; end: string; };
  workOutsideCity: boolean;
  documents: { name: string; type: string; }[];
};

const Register = () => {
  const navigate = useNavigate();
  const { palette: p, mode } = useTheme();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    yearsOfExp: '',
    workLate: false,
    workweek: [],
    workHours: { start: '09:00', end: '17:00' },
    workOutsideCity: false,
    documents: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleWorkweekChange = (day: string) => {
    setFormData(prev => ({
      ...prev,
      workweek: prev.workweek.includes(day)
        ? prev.workweek.filter(d => d !== day)
        : [...prev.workweek, day]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newDocs = files.map((file: File) => ({
      name: file.name,
      type: file.type
    }));
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocs]
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setError('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await axios.post(`${apiUrl}/auth/register`, { ...formData, role });
      
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12" style={{ background: p.bg }}>
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
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl space-y-8 rounded-3xl p-10 border relative z-10"
        style={{ 
          background: p.cardBg, 
          borderColor: p.border,
          boxShadow: mode === 'dark' ? "0 40px 80px rgba(0,0,0,0.4)" : "0 40px 80px rgba(0,0,0,0.05)",
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="text-center">
          <h2 className="text-4xl font-extrabold mb-2" style={{ color: p.text, fontFamily: "'Instrument Serif', serif" }}>Create Account</h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, role === 'provider' ? 3 : null].filter(Boolean).map((s) => (
              <div 
                key={s} 
                className="h-1.5 rounded-full transition-all duration-500"
                style={{ 
                  width: step === s ? '32px' : '12px',
                  background: step === s ? p.primary : p.border
                }}
              />
            ))}
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest" style={{ color: p.primary }}>
            Step {step} of {role === 'provider' ? '3' : '2'}
          </p>
        </div>

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

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 gap-6 md:grid-cols-2"
            >
              <button
                onClick={() => handleRoleSelect('client')}
                className="flex flex-col items-center rounded-2xl border-2 p-8 transition-all group"
                style={{ 
                  borderColor: p.border,
                  background: mode === 'dark' ? 'rgba(255,255,255,0.01)' : 'transparent'
                }}
              >
                
                <div 
                  className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl transition-all group-hover:scale-110"
                  style={{ background: `${p.primary}15`, color: p.primary }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: p.text }}>I need a service</h3>
                <p className="text-center text-sm" style={{ color: p.textMuted }}>Book consultations for yourself or your family.</p>
                <div className="mt-6 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all" style={{ color: p.primary }}>Select Role →</div>
              </button>

              <button
                onClick={() => handleRoleSelect('provider')}
                className="flex flex-col items-center rounded-2xl border-2 p-8 transition-all group"
                style={{ 
                  borderColor: p.border,
                  background: mode === 'dark' ? 'rgba(255,255,255,0.01)' : 'transparent'
                }}
              >
                <div 
                  className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl transition-all group-hover:scale-110"
                  style={{ background: `${p.secondary}15`, color: p.secondary }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: p.text }}>I offer a service</h3>
                <p className="text-center text-sm" style={{ color: p.textMuted }}>Join as a provider and grow your consultations.</p>
                <div className="mt-6 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all" style={{ color: p.secondary }}>Select Role →</div>
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6" 
              onSubmit={(e) => {
                if (role === 'provider') {
                  e.preventDefault();
                  setStep(3);
                } else {
                  handleSubmit(e);
                }
              }}
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="col-span-full">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: p.textMuted }}>Full Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="John Doe"
                    className="block w-full rounded-xl border px-4 py-3 outline-none transition-all focus:ring-1"
                    style={{ 
                      background: mode === 'dark' ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", 
                      borderColor: p.border, 
                      color: p.text
                    }}
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-span-full">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: p.textMuted }}>Email Address</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="block w-full rounded-xl border px-4 py-3 outline-none transition-all focus:ring-1"
                    style={{ 
                      background: mode === 'dark' ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", 
                      borderColor: p.border, 
                      color: p.text
                    }}
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: p.textMuted }}>Password</label>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="block w-full rounded-xl border px-4 py-3 outline-none transition-all focus:ring-1"
                    style={{ 
                      background: mode === 'dark' ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", 
                      borderColor: p.border, 
                      color: p.text
                    }}
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: p.textMuted }}>Confirm Password</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="block w-full rounded-xl border px-4 py-3 outline-none transition-all focus:ring-1"
                    style={{ 
                      background: mode === 'dark' ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", 
                      borderColor: p.border, 
                      color: p.text
                    }}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="flex-1 rounded-xl border px-4 py-3.5 text-sm font-bold transition-all hover:opacity-80"
                  style={{ borderColor: p.border, color: p.text }}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="flex-1 rounded-xl px-4 py-3.5 text-sm font-bold shadow-lg transition-all active:scale-95"
                  style={{ 
                    background: p.primary, 
                    color: "#fff",
                    boxShadow: `0 10px 20px ${p.primary}20`
                  }}
                >
                  {role === 'provider' ? 'Next: Provider Info' : 'Complete Registration'}
                </button>
              </div>
            </motion.form>
          )}

          {step === 3 && role === 'provider' && (
            <motion.form 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6" 
              onSubmit={handleSubmit}
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: p.textMuted }}>Years of Experience</label>
                  <input
                    name="yearsOfExp"
                    type="number"
                    required
                    placeholder="e.g. 5"
                    className="block w-full rounded-xl border px-4 py-3 outline-none transition-all focus:ring-1"
                    style={{ 
                      background: mode === 'dark' ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", 
                      borderColor: p.border, 
                      color: p.text
                    }}
                    value={formData.yearsOfExp}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex items-center pt-6">
                  <input
                    id="workLate"
                    name="workLate"
                    type="checkbox"
                    className="h-5 w-5 rounded transition-all"
                    style={{ accentColor: p.primary }}
                    checked={formData.workLate}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="workLate" className="ml-3 block text-sm font-medium" style={{ color: p.text }}>Willing to work late?</label>
                </div>

                <div className="col-span-full">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-3" style={{ color: p.textMuted }}>Work Week</label>
                  <div className="flex flex-wrap gap-2">
                    {days.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleWorkweekChange(day)}
                        className="rounded-xl px-4 py-2 text-xs font-bold transition-all border"
                        style={{ 
                          background: formData.workweek.includes(day) ? p.primary : 'transparent',
                          borderColor: formData.workweek.includes(day) ? p.primary : p.border,
                          color: formData.workweek.includes(day) ? '#fff' : p.text
                        }}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-span-full flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: p.textMuted }}>Start Time</label>
                    <input
                      type="time"
                      className="block w-full rounded-xl border px-4 py-3 outline-none"
                      style={{ 
                        background: mode === 'dark' ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", 
                        borderColor: p.border, 
                        color: p.text
                      }}
                      value={formData.workHours.start}
                      onChange={(e) => setFormData(prev => ({ ...prev, workHours: { ...prev.workHours, start: e.target.value } }))}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: p.textMuted }}>End Time</label>
                    <input
                      type="time"
                      className="block w-full rounded-xl border px-4 py-3 outline-none"
                      style={{ 
                        background: mode === 'dark' ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", 
                        borderColor: p.border, 
                        color: p.text
                      }}
                      value={formData.workHours.end}
                      onChange={(e) => setFormData(prev => ({ ...prev, workHours: { ...prev.workHours, end: e.target.value } }))}
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: p.textMuted }}>Verification Documents</label>
                  <div 
                    className="relative rounded-xl border-2 border-dashed p-6 transition-all text-center"
                    style={{ borderColor: p.border, background: mode === 'dark' ? 'rgba(255,255,255,0.01)' : 'transparent' }}
                  >
                    <input
                      type="file"
                      multiple
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                    />
                    <div className="text-sm" style={{ color: p.textMuted }}>
                      <span style={{ color: p.primary, fontWeight: 'bold' }}>Click to upload</span> or drag and drop
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.documents.map((doc, i) => (
                      <div 
                        key={i} 
                        className="text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-1"
                        style={{ background: `${p.primary}10`, borderColor: `${p.primary}30`, color: p.primary }}
                      >
                        📄 {doc.name.length > 15 ? doc.name.substring(0, 15) + '...' : doc.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setStep(2)} 
                  className="flex-1 rounded-xl border px-4 py-3.5 text-sm font-bold transition-all hover:opacity-80"
                  style={{ borderColor: p.border, color: p.text }}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 rounded-xl px-4 py-3.5 text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  style={{ 
                    background: p.primary, 
                    color: "#fff",
                    boxShadow: `0 10px 20px ${p.primary}20`
                  }}
                >
                  {loading ? 'Creating Account...' : 'Finish & Register'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="text-center text-sm pt-4">
          <span style={{ color: p.textMuted }}>Already have an account?</span>{' '}
          <Link to="/login" className="font-bold transition-colors" style={{ color: p.primary }}>
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;












