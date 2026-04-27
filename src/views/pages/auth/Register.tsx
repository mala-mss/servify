import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
      const apiUrl = import.meta.env.VITE_API_URL || 'http:/localhost:5000/api';
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-2xl space-y-8 rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900">Create Account</h2>
          <p className="mt-2 text-sm text-slate-600">Step {step} of {role === 'provider' ? '3' : '2'}</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <button
              onClick={() => handleRoleSelect('client')}
              className="flex flex-col items-center rounded-xl border-2 border-slate-200 p-8 transition-all hover:border-indigo-600 hover:bg-indigo-50"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <svg xmlns="http:/www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">I need a service</h3>
              <p className="mt-2 text-center text-sm text-slate-600">Book consultations for yourself or your family.</p>
            </button>

            <button
              onClick={() => handleRoleSelect('provider')}
              className="flex flex-col items-center rounded-xl border-2 border-slate-200 p-8 transition-all hover:border-indigo-600 hover:bg-indigo-50"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <svg xmlns="http:/www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">I offer a service</h3>
              <p className="mt-2 text-center text-sm text-slate-600">Join as a provider and grow your consultations.</p>
            </button>
          </div>
        )}

        {step === 2 && (
          <form className="space-y-6" onSubmit={(e) => {
            if (role === 'provider') {
              e.preventDefault();
              setStep(3);
            } else {
              handleSubmit(e);
            }
          }}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="col-span-full">
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-span-full">
                <label className="block text-sm font-medium text-slate-700">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={() => setStep(1)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50">Back</button>
              <button type="submit" className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
                {role === 'provider' ? 'Next: Provider Info' : 'Complete Registration'}
              </button>
            </div>
          </form>
        )}

        {step === 3 && role === 'provider' && (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Years of Experience</label>
                <input
                  name="yearsOfExp"
                  type="number"
                  required
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={formData.yearsOfExp}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex items-center pt-6">
                <input
                  name="workLate"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  checked={formData.workLate}
                  onChange={handleInputChange}
                />
                <label className="ml-2 block text-sm text-slate-700">Willing to work late?</label>
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium text-slate-700">Work Week</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {days.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleWorkweekChange(day)}
                      className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${
                        formData.workweek.includes(day)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-full flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700">Start Time</label>
                  <input
                    type="time"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={formData.workHours.start}
                    onChange={(e) => setFormData(prev => ({ ...prev, workHours: { ...prev.workHours, start: e.target.value } }))}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700">End Time</label>
                  <input
                    type="time"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={formData.workHours.end}
                    onChange={(e) => setFormData(prev => ({ ...prev, workHours: { ...prev.workHours, end: e.target.value } }))}
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium text-slate-700">Verification Documents</label>
                <input
                  type="file"
                  multiple
                  className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
                  onChange={handleFileChange}
                />
                <div className="mt-2 text-xs text-slate-500">
                  {formData.documents.map((doc, i) => (
                    <div key={i}>{doc.name} ({doc.type})</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={() => setStep(2)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50">Back</button>
              <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
                {loading ? 'Creating Account...' : 'Finish & Register'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-sm">
          <span className="text-slate-600">Already have an account?</span>{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;












