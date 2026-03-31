import React from 'react';
import { useTheme } from "@/context/ThemeContext";
import { Link } from "react-router-dom";
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
  Shield
} from 'lucide-react';

const AdminDashboard = () => {
  const { palette: p, mode } = useTheme();

  const cardStyle = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: 16,
    padding: 24,
    transition: "all 0.3s ease",
  };

  const stats = [
    { label: "Total Users", value: "1,284", icon: Users, change: "+12%", color: "#4f46e5" },
    { label: "Active Bookings", value: "156", icon: Calendar, change: "+5%", color: "#0ea5e9" },
    { label: "Revenue", value: "DZD 450k", icon: DollarSign, change: "+18%", color: "#10b981" },
    { label: "Pending Reports", value: "5", icon: AlertCircle, change: "-2", color: "#f43f5e" },
  ];

  const recentBookings = [
    { id: "BK-7281", user: "Sarah Johnson", service: "Elderly Care", status: "Completed", amount: "DZD 4,500" },
    { id: "BK-7282", user: "Michael Chen", service: "Baby Sitting", status: "In Progress", amount: "DZD 3,200" },
    { id: "BK-7283", user: "Amine Rahmani", service: "Home Cleaning", status: "Pending", amount: "DZD 2,800" },
    { id: "BK-7284", user: "Lydia Mansouri", service: "Specialized Care", status: "Cancelled", amount: "DZD 0" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'In Progress': return '#3b82f6';
      case 'Pending': return '#f59e0b';
      case 'Cancelled': return '#ef4444';
      default: return p.textMuted;
    }
  };

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
          Welcome to the Family Care administration panel. Platform-wide operations are running smoothly.
        </p>
      </div>

      {/* STATS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 32 }}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="hover-card" style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                  <Icon size={24} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: stat.change.startsWith('+') ? '#10b981' : '#f43f5e', background: stat.change.startsWith('+') ? '#10b98115' : '#f43f5e15', padding: '4px 8px', borderRadius: 6 }}>
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
                  <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase' }}>ID</th>
                  <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase' }}>Customer</th>
                  <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase' }}>Service</th>
                  <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 8px', fontSize: 12, color: p.textMuted, fontWeight: 500, textTransform: 'uppercase' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((bk) => (
                  <tr key={bk.id} className="table-row" style={{ borderBottom: `1px solid ${p.border}` }}>
                    <td style={{ padding: '16px 8px', fontSize: 13, color: p.text, fontWeight: 500 }}>{bk.id}</td>
                    <td style={{ padding: '16px 8px', fontSize: 13, color: p.text }}>{bk.user}</td>
                    <td style={{ padding: '16px 8px', fontSize: 13, color: p.textMuted }}>{bk.service}</td>
                    <td style={{ padding: '16px 8px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: getStatusColor(bk.status), background: `${getStatusColor(bk.status)}15`, padding: '4px 10px', borderRadius: 20 }}>
                        {bk.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 8px', fontSize: 13, color: p.text, fontWeight: 600 }}>{bk.amount}</td>
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
                { label: "Emails", status: "Degraded", color: "#f59e0b", icon: Mail },
              ].map((sys, i) => {
                const SysIcon = sys.icon;
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

export default AdminDashboard;
