import React, { useState, useEffect } from 'react';
import { useTheme } from "@/controllers/context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  Activity, 
  Database, 
  HardDrive, 
  Mail,
  ArrowRight,
  Shield,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { bookingService } from '@/controllers/services/bookingService';
import { userService } from '@/controllers/services/userService';
import { serviceService } from '@/controllers/services/serviceService';

const AdminDashboard = () => {
  const { palette: p, mode } = useTheme();
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState<any>(null);
  const [userCount, setUserCount] = useState(0);
  const [serviceCount, setServiceCount] = useState(0);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [bookingStats, users, services, allBookings] = await Promise.all([
        bookingService.getStats(),
        userService.getAll(),
        serviceService.getAll(),
        bookingService.getAll()
      ]);
      setStatsData(bookingStats.stats);
      setUserCount(users.users.length);
      setServiceCount(services.services.length);
      setRecentBookings(allBookings.bookings.slice(0, 5));
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
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

  const stats = [
    { label: "Total Users", value: userCount, icon: Users, change: "+12%", color: "#4f46e5", positive: true },
    { label: "Active Bookings", value: statsData?.confirmed || 0, icon: Calendar, change: "+5%", color: "#0ea5e9", positive: true },
    { label: "Total Services", value: serviceCount, icon: Sparkles, change: "0%", color: "#10b981", positive: true },
    { label: "Pending Requests", value: statsData?.pending || 0, icon: AlertCircle, change: "-2", color: "#f43f5e", positive: false },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'completed': return p.primary;
      case 'cancelled': return '#f43f5e';
      default: return p.textMuted;
    }
  };

  if (loading) return <div style={{ color: p.textMuted, textAlign: 'center', padding: 100 }}>Loading dashboard...</div>;

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <style>{`
        .hover-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -10px rgba(0,0,0,0.1);
          border-color: ${p.primary}44 !important;
        }
        .table-row:hover {
          background: ${mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'};
        }
      `}</style>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, fontWeight: 400, color: p.text, marginBottom: 8 }}>
          Dashboard Overview
        </h1>
        <p style={{ fontSize: 14, color: p.textMuted }}>
          Welcome back, Admin. Here's what's happening on Family Care today.
        </p>
      </div>

      {/* STATS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 32 }}>
        {stats.map((stat, i) => {
          const Icon: any = stat.icon;
          return (
            <div key={i} className="hover-card" style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                  <Icon size={24} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: stat.positive ? '#10b981' : '#f43f5e', background: stat.positive ? '#10b98115' : '#f43f5e15', padding: '4px 8px', borderRadius: 6 }}>
                  {stat.change}
                </span>
              </div>
              <div style={{ fontSize: 14, color: p.textMuted, marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: p.text, fontFamily: "'Instrument Serif', serif" }}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        {/* RECENT BOOKINGS */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: p.text }}>Recent Platform Activity</h2>
            <Link to="/admin/bookings" style={{ fontSize: 13, color: p.primary, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${p.border}` }}>
                  <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase' }}>Client</th>
                  <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase' }}>Provider</th>
                  <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((bk) => (
                  <tr key={bk.id_b} className="table-row" style={{ borderBottom: `1px solid ${p.border}`, cursor: 'pointer' }} onClick={() => navigate(`/admin/bookings/${bk.id_b}`)}>
                    <td style={{ padding: '16px 8px', fontSize: 13, color: p.text, fontWeight: 500 }}>{bk.client_name}</td>
                    <td style={{ padding: '16px 8px', fontSize: 13, color: p.text }}>{bk.provider_name}</td>
                    <td style={{ padding: '16px 8px', fontSize: 13, color: p.textMuted }}>{new Date(bk.date).toLocaleDateString()}</td>
                    <td style={{ padding: '16px 8px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: getStatusColor(bk.status), background: `${getStatusColor(bk.status)}15`, padding: '4px 10px', borderRadius: 20 }}>
                        {bk.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SYSTEM STATUS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Activity size={20} color={p.primary} />
              <h2 style={{ fontSize: 18, fontWeight: 600, color: p.text }}>System Health</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: "API Server", status: "Operational", color: "#10b981", icon: Activity },
                { label: "Database", status: "Operational", color: "#10b981", icon: Database },
                { label: "Storage", status: "Operational", color: "#10b981", icon: HardDrive },
                { label: "Emails", status: "Operational", color: "#10b981", icon: Mail },
              ].map((sys, i) => {
                const SysIcon: any = sys.icon;
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <SysIcon size={14} color={p.textMuted} />
                      <span style={{ fontSize: 14, color: p.textMuted }}>{sys.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: sys.color }} />
                      <span style={{ fontSize: 12, fontWeight: 500, color: p.text }}>{sys.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ ...cardStyle, background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})`, border: 'none', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Shield size={20} />
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>Admin Shield</h2>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 20 }}>Security protocols are active. All administrative actions are currently logged.</p>
            <button style={{ width: '100%', padding: '12px', background: '#fff', color: p.primary, border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
              View Audit Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sparkles = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3 1.912 4.913L18.825 9.825 13.913 11.737 12 16.65l-1.913-4.913L5.175 9.825l4.912-1.912L12 3Z"/>
    <path d="M5 3v4"/>
    <path d="M19 17v4"/>
    <path d="M3 5h4"/>
    <path d="M17 19h4"/>
  </svg>
);

export default AdminDashboard;
