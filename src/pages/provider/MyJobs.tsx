import React from 'react';
import { useTheme } from "../../context/ThemeContext";

type JobStatus = "confirmed" | "pending" | "in_progress" | "completed" | "declined";

interface Job {
  id: string;
  client: string;
  service: string;
  time: string;
  date: string;
  status: JobStatus;
}

const STATUS_CONFIG: Record<JobStatus, { color: string; bg: string; label: string }> = {
  confirmed: { color: "#2FB0BC", bg: "rgba(47,176,188,.1)", label: "Confirmed" },
  pending: { color: "#fb923c", bg: "rgba(251,146,60,.1)", label: "Pending" },
  in_progress: { color: "#a78bfa", bg: "rgba(167,139,250,.1)", label: "In Progress" },
  completed: { color: "#4ade80", bg: "rgba(74,222,128,.1)", label: "Completed" },
  declined: { color: "#f87171", bg: "rgba(248,113,113,.1)", label: "Declined" },
};

const MOCK_JOBS: Job[] = [
  { id: "1", client: "Amine Belkacem", service: "Elder Care", time: "14:00 - 17:00", date: "Today, 25 Oct", status: "in_progress" },
  { id: "2", client: "Sarah Mansouri", service: "Babysitting", time: "09:00 - 12:00", date: "Tomorrow, 26 Oct", status: "confirmed" },
  { id: "3", client: "Karim Djebbar", service: "Home Cleaning", time: "10:00 - 13:00", date: "27 Oct, 2023", status: "pending" },
  { id: "4", client: "Lila Haddad", service: "Elder Care", time: "15:00 - 18:00", date: "28 Oct, 2023", status: "completed" },
  { id: "5", client: "Yacine Brahimi", service: "Babysitting", time: "18:00 - 21:00", date: "29 Oct, 2023", status: "declined" },
];

export default function MyJobs() {
  const { palette: p } = useTheme();

  const cardStyle: React.CSSProperties = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: "12px",
    padding: "20px",
    transition: "border-color .2s",
    marginBottom: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  };

  const compactCardStyle: React.CSSProperties = {
    ...cardStyle,
    padding: "14px 16px",
    borderRadius: "10px",
  };

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "32px", color: p.text, marginBottom: "8px" }}>
          My Jobs
        </h1>
        <p style={{ color: p.textMuted, fontSize: "14px" }}>
          Manage your upcoming and past assignments.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4px" }}>
        {MOCK_JOBS.map((job) => {
          const status = STATUS_CONFIG[job.status];
          return (
            <div 
              key={job.id} 
              style={compactCardStyle}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(47,176,188,.3)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = p.border)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "16px", fontWeight: 500, color: p.text }}>{job.client}</span>
                <span style={{ 
                  fontSize: "11px", 
                  fontWeight: 600, 
                  padding: "4px 10px", 
                  borderRadius: "999px", 
                  color: status.color, 
                  backgroundColor: status.bg,
                  textTransform: "capitalize"
                }}>
                  {status.label}
                </span>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "13px", color: p.text }}>{job.service}</span>
                  <span style={{ fontSize: "12px", color: p.textMuted }}>{job.date} • {job.time}</span>
                </div>
                
                <button style={{ 
                  fontSize: "12px", 
                  color: p.primary, 
                  background: "transparent", 
                  border: "none", 
                  cursor: "pointer",
                  padding: "0",
                  fontWeight: 500
                }}>
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
