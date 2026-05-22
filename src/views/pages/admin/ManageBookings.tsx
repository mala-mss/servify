import React, { useState, useEffect } from 'react';
import { useTheme } from "@/controllers/context/ThemeContext";
import { 
  Calendar, 
  Search, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '@/controllers/services/bookingService';

const ManageBookings = () => {
  const { palette: p, mode } = useTheme();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getAll();
      setBookings(data.bookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: 16,
    padding: 24,
    transition: "all 0.3s ease",
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return { color: '#10b981', bg: '#10b98115' };
      case 'pending': return { color: '#f59e0b', bg: '#f59e0b15' };
      case 'completed': return { color: p.primary, bg: `${p.primary}15` };
      case 'cancelled': return { color: '#f43f5e', bg: '#f43f5e15' };
      default: return { color: p.textMuted, bg: `${p.border}` };
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.client_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.provider_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, fontWeight: 400, color: p.text, marginBottom: 8 }}>
          Manage Bookings
        </h1>
        <p style={{ fontSize: 14, color: p.textMuted }}>
          Manage all customer bookings and their statuses.
        </p>
      </div>

      <div style={cardStyle}>
        {/* SEARCH */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
            <input 
              type="text" 
              placeholder="Search by client or provider..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', padding: '10px 12px 10px 40px', background: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', 
                border: `1px solid ${p.border}`, borderRadius: 10, color: p.text, outline: 'none' 
              }} 
            />
          </div>
          <button onClick={fetchBookings} style={{ 
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', 
            background: 'transparent', border: `1px solid ${p.border}`, borderRadius: 10, 
            color: p.textMuted, fontSize: 14, cursor: 'pointer' 
          }}>
            Refresh
          </button>
        </div>

        {/* TABLE */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${p.border}` }}>
                <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase' }}>Client / Provider</th>
                <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase' }}>Date & Time</th>
                <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase' }}>Payments</th>
                <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: p.textMuted }}>Loading bookings...</td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: p.textMuted }}>No bookings found.</td>
                </tr>
              ) : filteredBookings.map((booking) => {
                const s = getStatusColor(booking.status);
                return (
                  <tr key={booking.id_b} style={{ borderBottom: `1px solid ${p.border}`, transition: 'background 0.2s' }} className="table-row">
                    <td style={{ padding: '16px 8px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: p.text }}>{booking.client_name}</div>
                        <div style={{ fontSize: 12, color: p.textMuted }}>with {booking.provider_name}</div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 8px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontSize: 14, color: p.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={14} />
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: 12, color: p.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={14} />
                          {booking.time}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 8px' }}>
                      <span style={{ 
                        fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                        color: s.color, background: s.bg
                      }}>
                        {booking.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px 8px' }}>
                       <div style={{ display: 'flex', gap: 8 }}>
                          <div title="First Payment" style={{ color: booking.first_payment_done ? '#10b981' : p.textMuted }}>
                            <CheckCircle size={16} />
                          </div>
                          <div title="Second Payment" style={{ color: booking.second_payment_done ? '#10b981' : p.textMuted }}>
                            <CheckCircle size={16} />
                          </div>
                       </div>
                    </td>
                    <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                      <button 
                        onClick={() => navigate(`/admin/bookings/${booking.id_b}`)}
                        style={{ padding: 8, background: 'transparent', border: 'none', color: p.textMuted, cursor: 'pointer' }}
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        .table-row:hover {
          background: ${mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'} !important;
        }
      `}</style>
    </div>
  );
};

export default ManageBookings;












