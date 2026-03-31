import React, { useState } from 'react';
import { useBookings } from '../context/BookingContext';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Clock, Calendar as CalendarIcon, MapPin, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const services = [
  'General Physician',
  'Pediatrician',
  'Elderly Care',
  'Maternity Care',
  'Physiotherapy',
  'Nutritional Counseling'
];

const Booking: React.FC = () => {
  const { addBooking } = useBookings();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    service: '',
    date: '',
    time: '',
    address: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBooking(formData);
    setStep(3); // Success step
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', maxWidth: '600px' }}>
      <AnimatePresence mode='wait'>
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card"
            style={{ padding: '2rem' }}
          >
            <h2 className="gradient-text" style={{ marginBottom: '1.5rem' }}>Select a Service</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {services.map((service) => (
                <button
                  key={service}
                  onClick={() => {
                    setFormData({ ...formData, service });
                    setStep(2);
                  }}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'flex-start', padding: '1.5rem', background: formData.service === service ? '#eff6ff' : 'var(--glass-bg)' }}
                >
                  <Stethoscope size={24} />
                  {service}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card"
            style={{ padding: '2rem' }}
          >
            <h2 className="gradient-text" style={{ marginBottom: '1.5rem' }}>Booking Details</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  <CalendarIcon size={18} /> Date
                </label>
                <input
                  type="date"
                  required
                  className="input-field"
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  <Clock size={18} /> Time
                </label>
                <input
                  type="time"
                  required
                  className="input-field"
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  <MapPin size={18} /> Address
                </label>
                <textarea
                  required
                  className="input-field"
                  placeholder="Enter full address"
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>Back</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Confirm Booking</button>
              </div>
            </form>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
            style={{ padding: '3rem', textAlign: 'center' }}
          >
            <CheckCircle2 size={80} style={{ color: '#22c55e', marginBottom: '1.5rem' }} />
            <h2 className="gradient-text">Booking Successful!</h2>
            <p style={{ color: '#64748b', marginTop: '1rem' }}>Your consultation has been scheduled. Redirecting to dashboard...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Booking;
