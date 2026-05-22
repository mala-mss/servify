import React, { useState, useEffect } from 'react';
import { useTheme } from "@/controllers/context/ThemeContext";
import { useParams, useNavigate } from "react-router-dom";
import { bookingService } from '@/controllers/services/bookingService';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Sparkles,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function BookingDetail() {
  const { palette: p, mode } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchBookingDetail(id);
  }, [id]);

  const fetchBookingDetail = async (bookingId: string) => {
    setLoading(true);
    try {
      const resp = await bookingService.getById(bookingId);
      setBooking(resp.booking);
    } catch (err) {
      console.error("Error fetching booking detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!id) return;
    try {
      await bookingService.updateStatus(id, newStatus as any);
      setBooking({ ...booking, status: newStatus });
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  const cardStyle = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: 16,
    padding: 32,
    marginBottom: 24
  };

  if (loading) return <div style={{ color: p.textMuted, textAlign: 'center', padding: 100 }}>Loading booking details...</div>;
  if (!booking) return <div style={{ color: p.textMuted, textAlign: 'center', padding: 100 }}>Booking not found.</div>;

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <button 
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', color: p.textMuted, cursor: 'pointer', marginBottom: 24, fontSize: 14 }}
      >
        <ArrowLeft size={16} />
        Back to Bookings
      </button>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
              <div>
                <div style={{ fontSize: 12, color: p.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Booking ID: #{id}</div>
                <h1 style={{ fontSize: 24, fontWeight: 600, color: p.text }}>{booking.service_name}</h1>
              </div>
              <span style={{ 
                fontSize: 12, fontWeight: 600, padding: '6px 16px', borderRadius: 20,
                color: booking.status === 'confirmed' ? '#10b981' : '#f59e0b',
                background: booking.status === 'confirmed' ? '#10b98115' : '#f59e0b15'
              }}>
                {booking.status?.toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              <InfoItem icon={<User size={18} />} label="Client" value={booking.client_name} p={p} />
              <InfoItem icon={<User size={18} />} label="Service Provider" value={booking.provider_name} p={p} />
              <InfoItem icon={<Calendar size={18} />} label="Date" value={new Date(booking.date).toLocaleDateString()} p={p} />
              <InfoItem icon={<Clock size={18} />} label="Time" value={booking.time} p={p} />
              <InfoItem icon={<MapPin size={18} />} label="Address" value={booking.address || "Not specified"} p={p} />
              <InfoItem icon={<CreditCard size={18} />} label="Total Amount" value={`${booking.amount || '0'} DZD`} p={p} />
            </div>
          </div>

          <div style={cardStyle}>
             <h3 style={{ fontSize: 18, fontWeight: 600, color: p.text, marginBottom: 20 }}>Payment Status</h3>
             <div style={{ display: 'flex', gap: 24 }}>
                <PaymentStage label="Stage 1: Deposit" done={booking.first_payment_done} p={p} />
                <PaymentStage label="Stage 2: Final" done={booking.second_payment_done} p={p} />
             </div>
          </div>
        </div>

        <div style={{ width: 320 }}>
          <div style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: p.text, marginBottom: 16 }}>Admin Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {booking.status !== 'completed' && (
                <button 
                  onClick={() => updateStatus('completed')}
                  style={{ padding: '12px', borderRadius: 10, background: p.primary, border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Mark as Completed
                </button>
              )}
              {booking.status !== 'cancelled' && (
                <button 
                  onClick={() => updateStatus('cancelled')}
                  style={{ padding: '12px', borderRadius: 10, background: 'transparent', border: `1px solid #f43f5e`, color: '#f43f5e', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const InfoItem = ({ icon, label, value, p }: any) => (
  <div style={{ display: 'flex', gap: 12 }}>
    <div style={{ color: p.primary }}>{icon}</div>
    <div>
      <div style={{ fontSize: 11, color: p.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, color: p.text, fontWeight: 500 }}>{value}</div>
    </div>
  </div>
);

const PaymentStage = ({ label, done, p }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    {done ? <CheckCircle size={20} color="#10b981" /> : <AlertCircle size={20} color={p.textMuted} />}
    <span style={{ fontSize: 14, color: done ? p.text : p.textMuted }}>{label}</span>
  </div>
);












