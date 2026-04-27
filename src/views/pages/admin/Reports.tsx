import React, { useState } from 'react';
import { useTheme } from "@/controllers/context/ThemeContext";
import { 
  Flag, 
  Search, 
  AlertTriangle, 
  Gavel, 
  CheckCircle, 
  Eye, 
  MoreHorizontal,
  Calendar,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Reports = () => {
  const { palette: p, mode } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const cardStyle = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: 16,
    padding: 24,
  };

  const [reports, setReports] = useState([
    { id: 101, user: "Amine Rahmani", type: "Late Arrival", service: "Babysitting", severity: "Low", status: "Pending", date: "2024-03-25" },
    { id: 102, user: "Michael Chen", type: "Unprofessional Behavior", service: "Elder Care", severity: "Medium", status: "Investigating", date: "2024-03-24" },
    { id: 103, user: "Sarah Johnson", type: "False Advertising", service: "Home Cleaning", severity: "High", status: "Resolved", date: "2024-03-22" },
    { id: 104, user: "Omar Touati", type: "Payment Issue", service: "Tutoring", severity: "Medium", status: "Pending", date: "2024-03-26" },
  ]);

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'High': return { color: '#f43f5e', bg: '#f43f5e15' };
      case 'Medium': return { color: '#f59e0b', bg: '#f59e0b15' };
      case 'Low': return { color: '#3b82f6', bg: '#3b82f615' };
      default: return { color: p.textMuted, bg: `${p.border}` };
    }
  };

  const strikeUser = (userName) => {
    if (window.confirm(`Issue a formal strike against ${userName}? 3 strikes will lead to automatic blocking.`)) {
      alert(`Strike issued to ${userName}.`);
    }
  };

  const resolveReport = (id) => {
    setReports(reports.map(r => r.id === id ? { ...r, status: 'Resolved' } : r));
  };

  const filteredReports = reports.filter(r => 
    r.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, fontWeight: 400, color: p.text, marginBottom: 8 }}>
          Reports & Incidents
        </h1>
        <p style={{ fontSize: 14, color: p.textMuted }}>
          Monitor platform safety and handle user reports or service tracking issues.
        </p>
      </div>

      <div style={cardStyle}>
        {/* SEARCH */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ position: 'relative', maxWidth: 400 }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
            <input 
              type="text" 
              placeholder="Search by user or report type..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', padding: '10px 12px 10px 40px', background: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', 
                border: `1px solid ${p.border}`, borderRadius: 10, color: p.text, outline: 'none' 
              }} 
            />
          </div>
        </div>

        {/* REPORTS LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredReports.map((report) => {
            const sev = getSeverityStyle(report.severity);
            return (
              <div key={report.id} style={{ 
                padding: 20, borderRadius: 12, border: `1px solid ${p.border}`,
                background: mode === 'dark' ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: sev.bg, color: sev.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: p.text }}>{report.type}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: sev.bg, color: sev.color, textTransform: 'uppercase' }}>
                        {report.severity} Severity
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: p.textMuted }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><User size={14} /> {report.user}</span>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: p.border }} />
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> {report.date}</span>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: p.border }} />
                      <span style={{ fontWeight: 500, color: report.status === 'Resolved' ? '#10b981' : '#f59e0b' }}>{report.status}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button 
                    onClick={() => navigate(`/admin/reports/${report.id}`)}
                    style={{ padding: '8px 12px', borderRadius: 8, background: 'transparent', border: `1px solid ${p.border}`, color: p.text, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Eye size={16} /> Details
                  </button>
                  <button 
                    onClick={() => strikeUser(report.user)}
                    style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', color: '#f43f5e', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Gavel size={16} /> Strike
                  </button>
                  {report.status !== 'Resolved' && (
                    <button 
                      onClick={() => resolveReport(report.id)}
                      style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  <button style={{ padding: 8, background: 'transparent', border: 'none', color: p.textMuted, cursor: 'pointer' }}>
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Reports;












