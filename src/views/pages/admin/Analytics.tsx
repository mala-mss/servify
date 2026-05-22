import React, { useState, useMemo } from 'react';
import { useTheme } from "@/controllers/context/ThemeContext";
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Sparkles, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Users,
  DollarSign,
  Shield,
  PieChart as PieChartIcon,
  ChevronDown
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Radar, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// --- MOCK DATA ---

const bookingsByPeriod = [
  { name: 'Mon', value: 45 },
  { name: 'Tue', value: 52 },
  { name: 'Wed', value: 48 },
  { name: 'Thu', value: 61 },
  { name: 'Fri', value: 55 },
  { name: 'Sat', value: 67 },
  { name: 'Sun', value: 72 },
];

const clientsVsProviders = [
  { name: 'Mon', clients: 12, providers: 4 },
  { name: 'Tue', clients: 15, providers: 3 },
  { name: 'Wed', clients: 10, providers: 5 },
  { name: 'Thu', clients: 18, providers: 2 },
  { name: 'Fri', clients: 20, providers: 6 },
  { name: 'Sat', clients: 25, providers: 8 },
  { name: 'Sun', clients: 30, providers: 7 },
];

const revenueByPeriod = [
  { name: 'Mon', amount: 125000 },
  { name: 'Tue', amount: 142000 },
  { name: 'Wed', amount: 138000 },
  { name: 'Thu', amount: 161000 },
  { name: 'Fri', amount: 155000 },
  { name: 'Sat', amount: 187000 },
  { name: 'Sun', amount: 212000 },
];

const bookingsByService = [
  { name: 'Super Nanny', value: 120 },
  { name: 'Babysitting', value: 250 },
  { name: 'Childcare', value: 180 },
  { name: 'Elderly Care', value: 95 },
  { name: 'School Pick-Up', value: 145 },
];

const ratingsByService = [
  { subject: 'Super Nanny', A: 4.8, fullMark: 5 },
  { subject: 'Babysitting', A: 4.5, fullMark: 5 },
  { subject: 'Childcare', A: 4.2, fullMark: 5 },
  { subject: 'Elderly Care', A: 4.9, fullMark: 5 },
  { subject: 'School Pick-Up', A: 4.6, fullMark: 5 },
];

const statusByService = [
  { name: 'Super Nanny', confirmed: 100, pending: 15, cancelled: 5 },
  { name: 'Babysitting', confirmed: 210, pending: 30, cancelled: 10 },
  { name: 'Childcare', confirmed: 150, pending: 20, cancelled: 10 },
  { name: 'Elderly Care', confirmed: 80, pending: 10, cancelled: 5 },
  { name: 'School Pick-Up', confirmed: 130, pending: 10, cancelled: 5 },
];

const revenueByService = [
  { name: 'Super Nanny', value: 450000 },
  { name: 'Babysitting', value: 320000 },
  { name: 'Childcare', value: 280000 },
  { name: 'Elderly Care', value: 510000 },
  { name: 'School Pick-Up', value: 190000 },
];

const incidentsByPeriod = [
  { name: 'Mon', value: 2 },
  { name: 'Tue', value: 1 },
  { name: 'Wed', value: 5 }, // Spike
  { name: 'Thu', value: 2 },
  { name: 'Fri', value: 1 },
  { name: 'Sat', value: 3 },
  { name: 'Sun', value: 2 },
];

const incidentsByService = [
  { name: 'Super Nanny', value: 3 },
  { name: 'Babysitting', value: 8 },
  { name: 'Childcare', value: 5 },
  { name: 'Elderly Care', value: 2 },
  { name: 'School Pick-Up', value: 4 },
];

const incidentsByReason = [
  { name: 'Misconduct', value: 12 },
  { name: 'No-show', value: 8 },
  { name: 'Fraud', value: 3 },
  { name: 'Harassment', value: 2 },
  { name: 'Other', value: 5 },
];

const warningDistribution = [
  { name: '0 Warnings', value: 450, color: '#2FB0BC' },
  { name: '1 Warning', value: 45, color: '#D4A017' },
  { name: '2+ Warnings', value: 12, color: '#C0392B' },
];

const flaggedProviders = [
  { id: 1, name: 'Amine K.', category: 'Babysitting', reports: 4, warnings: 2, status: 'At Risk' },
  { id: 2, name: 'Sarra B.', category: 'Childcare', reports: 2, warnings: 1, status: 'Caution' },
  { id: 3, name: 'Mohamed R.', category: 'Super Nanny', reports: 1, warnings: 1, status: 'Caution' },
  { id: 4, name: 'Leila M.', category: 'Elderly Care', reports: 1, warnings: 0, status: 'Safe' },
  { id: 5, name: 'Karim D.', category: 'School Pick-Up', reports: 2, warnings: 0, status: 'Safe' },
];

// --- STYLES & THEME ---

const COLORS = ['#2FB0BC', '#6BC8B2', '#7ED4CA', '#4DA1A9', '#3B8B94'];

const CustomTooltip = ({ active, payload, label, p }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#141414',
        border: `1px solid ${p.primary}`,
        padding: '12px',
        borderRadius: '8px',
        color: '#fff',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
      }}>
        <p style={{ fontWeight: 600, marginBottom: '4px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color || entry.fill || p.primary, margin: '2px 0' }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const { palette: p, mode } = useTheme();
  const [activeTab, setActiveTab] = useState('period');
  const [period, setPeriod] = useState('This Week');

  const cardStyle = {
    background: '#121212',
    border: `1px solid #1e1e1e`,
    borderRadius: 20,
    padding: 24,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  };

  const kpiStyle = {
    ...cardStyle,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8
  };

  const tabButtonStyle = (isActive: boolean) => ({
    padding: '12px 24px',
    background: isActive ? `${p.primary}20` : 'transparent',
    border: 'none',
    borderBottom: isActive ? `2px solid ${p.primary}` : 'none',
    color: isActive ? p.primary : '#555',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: 8
  });

  const filterButtonStyle = (isActive: boolean) => ({
    padding: '8px 16px',
    background: isActive ? `linear-gradient(135deg, ${p.primary}, ${p.secondary})` : '#1a1a1a',
    border: 'none',
    borderRadius: 999,
    color: isActive ? '#fff' : '#888',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  });

  return (
    <div style={{ 
      animation: "fadeUp .4s ease both", 
      background: '#0e0e0e', 
      minHeight: '100vh',
      color: '#fff',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@400;500;600;700;800&family=Instrument+Serif&display=swap');
        
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0e0e0e;
        }
        ::-webkit-scrollbar-thumb {
          background: #1e1e1e;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #2FB0BC;
        }
      `}</style>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ 
              width: 40, height: 40, borderRadius: 12, 
              background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff'
            }}>
              <Shield size={24} />
            </div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 700, margin: 0 }}>Analytics</h1>
          </div>
          <p style={{ fontSize: 14, color: '#555', margin: 0 }}>NestCare Admin · Data Insights</p>
        </div>

        {/* GLOBAL PERIOD SELECTOR */}
        <div style={{ display: 'flex', background: '#121212', padding: 4, borderRadius: 999, gap: 4 }}>
          {['Today', 'This Week', 'This Month', 'Last 3 Months', 'Custom Range'].map(opt => (
            <button 
              key={opt}
              onClick={() => setPeriod(opt)}
              style={filterButtonStyle(period === opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1e1e1e', marginBottom: 32 }}>
        <button onClick={() => setActiveTab('period')} style={tabButtonStyle(activeTab === 'period')}>
          <Calendar size={18} /> By Period
        </button>
        <button onClick={() => setActiveTab('service')} style={tabButtonStyle(activeTab === 'service')}>
          <Sparkles size={18} /> By Service
        </button>
        <button onClick={() => setActiveTab('incidents')} style={tabButtonStyle(activeTab === 'incidents')}>
          <AlertCircle size={18} /> By Incidents
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'period' && (
        <div style={{ animation: "fadeUp .4s ease both" }}>
          {/* KPI CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
            <div style={kpiStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Total Bookings</span>
                <Briefcase size={14} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>1,284</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#10b981' }}>
                <ArrowUpRight size={14} /> 12% vs last {period === 'This Week' ? 'week' : 'month'}
              </div>
            </div>
            <div style={kpiStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>New Clients</span>
                <Users size={14} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>142</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#10b981' }}>
                <ArrowUpRight size={14} /> 8% vs last {period === 'This Week' ? 'week' : 'month'}
              </div>
            </div>
            <div style={kpiStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Revenue (DZD)</span>
                <DollarSign size={14} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>4.2M</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#10b981' }}>
                <ArrowUpRight size={14} /> 15% vs last {period === 'This Week' ? 'week' : 'month'}
              </div>
            </div>
            <div style={kpiStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Active Providers</span>
                <Sparkles size={14} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>86</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#f43f5e' }}>
                <ArrowDownRight size={14} /> 3% vs last {period === 'This Week' ? 'week' : 'month'}
              </div>
            </div>
          </div>

          {/* CHARTS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, color: '#eee' }}>Booking Volume Over Time</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bookingsByPeriod}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
                    <XAxis dataKey="name" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip p={p} />} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Bookings"
                      stroke={p.primary} 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: p.primary, strokeWidth: 2, stroke: '#121212' }} 
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, color: '#eee' }}>New Clients vs New Providers</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clientsVsProviders}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
                    <XAxis dataKey="name" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip p={p} />} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                    <Bar dataKey="clients" name="New Clients" fill={p.primary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="providers" name="New Providers" fill={p.secondary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ ...cardStyle, gridColumn: 'span 2' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, color: '#eee' }}>Revenue Trend (DZD)</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueByPeriod}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={p.primary} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={p.primary} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
                    <XAxis dataKey="name" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                    <Tooltip content={<CustomTooltip p={p} />} />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      name="Revenue"
                      stroke={p.primary} 
                      fillOpacity={1} 
                      fill="url(#colorRev)" 
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'service' && (
        <div style={{ animation: "fadeUp .4s ease both" }}>
          {/* SERVICE FILTERS */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
            {['All Services', 'Super Nanny', 'Babysitting', 'Childcare', 'Elderly Care', 'School Pick-Up'].map(s => (
              <button key={s} style={{ 
                padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: s === 'All Services' ? `${p.primary}15` : 'transparent',
                border: `1px solid ${s === 'All Services' ? p.primary : '#1e1e1e'}`,
                color: s === 'All Services' ? p.primary : '#888',
                cursor: 'pointer'
              }}>
                {s}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, color: '#eee' }}>Bookings per Service Category</h3>
              <div style={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingsByService} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" horizontal={false} />
                    <XAxis type="number" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" stroke="#eee" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip p={p} />} />
                    <Bar dataKey="value" name="Bookings" fill={p.primary} radius={[0, 4, 4, 0]} barSize={30}>
                      {bookingsByService.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, color: '#eee' }}>Revenue Distribution</h3>
              <div style={{ height: 300, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueByService}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {revenueByService.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip p={p} />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ 
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 12, color: '#555', textTransform: 'uppercase' }}>Total</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>1.75M</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
                {revenueByService.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                    <span style={{ color: '#888' }}>{s.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, color: '#eee' }}>Booking Status Breakdown</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusByService}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
                    <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip p={p} />} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />
                    <Bar dataKey="confirmed" name="Confirmed" stackId="a" fill={p.primary} />
                    <Bar dataKey="pending" name="Pending" stackId="a" fill="#D4A017" />
                    <Bar dataKey="cancelled" name="Cancelled" stackId="a" fill="#C0392B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, color: '#eee' }}>Average Rating per Service</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={ratingsByService}>
                    <PolarGrid stroke="#1e1e1e" />
                    <PolarAngleAxis dataKey="subject" stroke="#888" fontSize={10} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#555" fontSize={10} />
                    <Radar
                      name="Rating"
                      dataKey="A"
                      stroke={p.primary}
                      fill={p.primary}
                      fillOpacity={0.4}
                    />
                    <Tooltip content={<CustomTooltip p={p} />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'incidents' && (
        <div style={{ animation: "fadeUp .4s ease both" }}>
          {/* KPI CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
            <div style={kpiStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Total Reports</span>
                <AlertCircle size={14} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>32</div>
              <div style={{ fontSize: 12, color: '#f43f5e' }}>Last 30 days</div>
            </div>
            <div style={kpiStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Resolved</span>
                <Sparkles size={14} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>24</div>
              <div style={{ fontSize: 12, color: '#10b981' }}>75% completion</div>
            </div>
            <div style={kpiStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Pending Review</span>
                <Calendar size={14} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>8</div>
              <div style={{ fontSize: 12, color: '#D4A017' }}>Awaiting action</div>
            </div>
            <div style={kpiStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>High-Warning Accounts</span>
                <Users size={14} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>12</div>
              <div style={{ fontSize: 12, color: '#C0392B' }}>Critical risk</div>
            </div>
          </div>

          {/* INCIDENT CHARTS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>
            <div style={{ ...cardStyle, gridColumn: 'span 2' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, color: '#eee' }}>Incident Volume Over Time</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={incidentsByPeriod}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
                    <XAxis dataKey="name" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip p={p} />} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Reports"
                      stroke={p.primary} 
                      strokeWidth={3} 
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        if (payload.value > 4) {
                          return <circle cx={cx} cy={cy} r={6} fill="#C0392B" stroke="#121212" strokeWidth={2} />;
                        }
                        return <circle cx={cx} cy={cy} r={4} fill={p.primary} stroke="#121212" strokeWidth={2} />;
                      }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, color: '#eee' }}>Report Reasons</h3>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incidentsByReason}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {incidentsByReason.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip p={p} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
                {incidentsByReason.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                    <span style={{ color: '#888' }}>{s.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, color: '#eee' }}>Incidents by Service</h3>
              <div style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incidentsByService}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
                    <XAxis dataKey="name" stroke="#555" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip p={p} />} />
                    <Bar dataKey="value" name="Incidents" fill={p.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ ...cardStyle, gridColumn: 'span 2' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, color: '#eee' }}>Warning Level Distribution</h3>
              <div style={{ display: 'flex', gap: 24, height: 180, alignItems: 'center' }}>
                <div style={{ flex: 1, height: 100 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={warningDistribution} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} width={100} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {warningDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, flex: 1 }}>
                   {warningDistribution.map((d, i) => (
                     <div key={i} style={{ 
                       padding: '16px', borderRadius: 12, border: `1px solid ${d.color}30`,
                       background: `${d.color}05`
                     }}>
                       <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', marginBottom: 4 }}>{d.name}</div>
                       <div style={{ fontSize: 20, fontWeight: 700, color: d.color }}>{d.value}</div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>

          {/* FLAGTABLE */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#eee' }}>Provider Risk Assessment</h3>
              <button style={{ 
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#888',
                background: 'transparent', border: '1px solid #1e1e1e', padding: '6px 12px', borderRadius: 8
              }}>
                Filter & Sort <ChevronDown size={14} />
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #1e1e1e' }}>
                    <th style={{ padding: '12px 16px', fontSize: 11, color: '#555', textTransform: 'uppercase' }}>Provider Name</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, color: '#555', textTransform: 'uppercase' }}>Category</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, color: '#555', textTransform: 'uppercase' }}>Reports Filed</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, color: '#555', textTransform: 'uppercase' }}>Warnings</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, color: '#555', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedProviders.map(provider => (
                    <tr key={provider.id} style={{ 
                      borderBottom: '1px solid #1e1e1e',
                      transition: 'background 0.2s',
                      cursor: 'default'
                    }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#161616')} 
                       onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                      <td style={{ padding: '16px', fontSize: 14, fontWeight: 500 }}>{provider.name}</td>
                      <td style={{ padding: '16px', fontSize: 14, color: '#888' }}>{provider.category}</td>
                      <td style={{ padding: '16px', fontSize: 14 }}>{provider.reports}</td>
                      <td style={{ padding: '16px', fontSize: 14 }}>{provider.warnings}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                          background: provider.status === 'Safe' ? '#10b98120' : provider.status === 'Caution' ? '#D4A01720' : '#C0392B20',
                          color: provider.status === 'Safe' ? '#10b981' : provider.status === 'Caution' ? '#D4A017' : '#C0392B',
                          display: 'inline-flex', alignItems: 'center', gap: 6
                        }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                          {provider.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
