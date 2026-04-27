import React, { useState } from 'react';
import { useTheme } from "@/controllers/context/ThemeContext";
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Sparkles, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const Analytics = () => {
  const { palette: p, mode } = useTheme();
  const [activeTab, setActiveTab] = useState("period");

  const cardStyle = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: 16,
    padding: 24,
  };

  const stats = [
    { label: "Active Users", value: "1,284", trend: "+12%", up: true },
    { label: "Total Bookings", value: "3,542", trend: "+8%", up: true },
    { label: "Platform Revenue", value: "1.2M DZD", trend: "+15%", up: true },
    { label: "Cancellation Rate", value: "2.4%", trend: "-0.5%", up: false },
  ];

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, fontWeight: 400, color: p.text, marginBottom: 8 }}>
          Platform Analytics
        </h1>
        <p style={{ fontSize: 14, color: p.textMuted }}>
          Deep dive into platform performance, service usage, and incident trends.
        </p>
      </div>

      {/* QUICK STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ fontSize: 13, color: p.textMuted, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: p.text, marginBottom: 8 }}>{s.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: s.up ? '#10b981' : '#f43f5e' }}>
              {s.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {s.trend} vs last month
            </div>
          </div>
        ))}
      </div>

      {/* ANALYTICS TABS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: `1px solid ${p.border}`, paddingBottom: 12 }}>
        {[
          { id: 'period', label: 'By Period', icon: Calendar },
          { id: 'service', label: 'By Service', icon: Sparkles },
          { id: 'incidents', label: 'By Incidents', icon: AlertCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                background: isActive ? `${p.primary}15` : 'transparent',
                border: 'none', borderRadius: 8, color: isActive ? p.primary : p.textMuted,
                fontSize: 14, fontWeight: isActive ? 600 : 400, cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: p.text }}>
            {activeTab === 'period' && "Performance Trends"}
            {activeTab === 'service' && "Service Popularity"}
            {activeTab === 'incidents' && "Safety & Incident Volume"}
          </h2>
          <select style={{ 
            padding: '6px 12px', background: 'transparent', border: `1px solid ${p.border}`, 
            borderRadius: 8, color: p.textMuted, fontSize: 13, outline: 'none' 
          }}>
            <option>Last 30 Days</option>
            <option>Last 6 Months</option>
            <option>Last Year</option>
          </select>
        </div>

        {/* CHART PLACEHOLDER */}
        <div style={{ 
          height: 300, width: '100%', border: `1px dashed ${p.border}`, 
          borderRadius: 12, display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', gap: 16,
          background: mode === 'dark' ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'
        }}>
          <BarChart3 size={48} color={p.border} strokeWidth={1} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: p.textMuted }}>Data Visualization Engine</div>
            <div style={{ fontSize: 12, color: p.border }}>Interactive charts for {activeTab} will render here.</div>
          </div>
        </div>

        {/* BREAKDOWN LIST */}
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: p.text, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>Detailed Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map((_, i) => (
              <div key={i} style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                padding: '12px 16px', borderRadius: 10, background: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.primary }} />
                  <span style={{ fontSize: 14, color: p.text }}>Metric Group {i + 1}</span>
                </div>
                <div style={{ fontWeight: 600, color: p.text }}>{Math.floor(Math.random() * 1000)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;












