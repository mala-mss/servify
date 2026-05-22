import React, { useState, useEffect } from 'react';
import { useTheme } from "@/controllers/context/ThemeContext";
import { 
  Flag, 
  Search, 
  Trash2, 
  User, 
  AlertTriangle,
  ChevronRight,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '@/controllers/services/reportService';
import type { Report } from '@/controllers/services/reportService';

const Reports = () => {
  const { palette: p, mode } = useTheme();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await reportService.getAll();
      setReports(data.reports);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id_reporter: string, id_reported: string) => {
    if (window.confirm("Dismiss this report?")) {
      try {
        await reportService.delete(id_reporter, id_reported);
        setReports(reports.filter(r => !(r.id_reporter === id_reporter && r.id_reported === id_reported)));
      } catch (err) {
        console.error("Error deleting report:", err);
        alert("Failed to dismiss report.");
      }
    }
  };

  const cardStyle = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: 16,
    padding: 24,
  };

  const filteredReports = reports.filter(r => 
    r.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${r.reported_fname} ${r.reported_lname}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, fontWeight: 400, color: p.text, marginBottom: 8 }}>
            User Reports
          </h1>
          <p style={{ fontSize: 14, color: p.textMuted }}>
            Monitor and resolve issues reported by the community.
          </p>
        </div>
        <button onClick={fetchReports} style={{ 
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', 
          background: 'transparent', border: `1px solid ${p.border}`, borderRadius: 10, 
          fontSize: 14, fontWeight: 600, color: p.text, cursor: 'pointer' 
        }}>
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      <div style={cardStyle}>
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
          <input 
            type="text" 
            placeholder="Search by reason or reported user..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '10px 12px 10px 40px', background: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', 
              border: `1px solid ${p.border}`, borderRadius: 10, color: p.text, outline: 'none' 
            }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: p.textMuted }}>Loading reports...</div>
          ) : filteredReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: p.textMuted }}>No reports found.</div>
          ) : filteredReports.map((report, idx) => (
            <div key={idx} style={{ 
              background: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
              border: `1px solid ${p.border}`, borderRadius: 12, padding: 16,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              transition: 'all 0.2s'
            }} className="report-item">
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f43f5e15', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Flag size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: p.text }}>{report.reason}</span>
                    <span style={{ fontSize: 11, color: p.textMuted }}>•</span>
                    <span style={{ fontSize: 12, color: p.textMuted }}>{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
                    <span style={{ color: p.textMuted }}>Reported: <span style={{ color: p.text, fontWeight: 500 }}>{report.reported_fname} {report.reported_lname}</span></span>
                    <span style={{ color: p.textMuted }}>by <span style={{ color: p.text }}>{report.reporter_fname}</span></span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  onClick={() => navigate(`/admin/users/${report.id_reported}`)}
                  style={{ padding: 8, background: 'transparent', border: 'none', color: p.textMuted, cursor: 'pointer' }}
                  title="View Reported User"
                >
                  <Eye size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(report.id_reporter, report.id_reported)}
                  style={{ padding: 8, background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer' }}
                  title="Dismiss Report"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .report-item:hover {
          border-color: #f43f5e44 !important;
          background: ${mode === 'dark' ? 'rgba(244,63,94,0.03)' : 'rgba(244,63,94,0.01)'} !important;
        }
      `}</style>
    </div>
  );
};

export default Reports;
