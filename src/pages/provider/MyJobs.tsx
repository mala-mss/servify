// src/pages/provider/MyJobs.tsx
import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import axiosInstance from "../../api/axiosInstance";

type JobStatus = "confirmed" | "pending" | "in_progress" | "completed" | "cancelled" | "declined";

interface Job {
  id_booking: number;
  client_name: string;
  service_name: string;
  time: string;
  date: string;
  status: JobStatus;
  amount: number;
  address: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  confirmed: { color: "#2FB0BC", bg: "rgba(47,176,188,.1)", label: "Confirmed" },
  pending: { color: "#fb923c", bg: "rgba(251,146,60,.1)", label: "Pending" },
  in_progress: { color: "#a78bfa", bg: "rgba(167,139,250,.1)", label: "In Progress" },
  completed: { color: "#4ade80", bg: "rgba(74,222,128,.1)", label: "Completed" },
  cancelled: { color: "#f87171", bg: "rgba(248,113,113,.1)", label: "Cancelled" },
  declined: { color: "#f87171", bg: "rgba(248,113,113,.1)", label: "Declined" },
};

export default function MyJobs() {
  const { palette: p } = useTheme();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/bookings");
      if (response.data.bookings) {
        setJobs(response.data.bookings);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await axiosInstance.put(`/bookings/${id}/status`, { status });
      fetchJobs();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

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

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: p.textMuted }}>Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: p.textMuted }}>No jobs found</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4px" }}>
          {jobs.map((job) => {
            const status = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending;
            return (
              <div 
                key={job.id_booking} 
                style={compactCardStyle}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(47,176,188,.3)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = p.border)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "16px", fontWeight: 500, color: p.text }}>{job.client_name}</span>
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
                    <span style={{ fontSize: "13px", color: p.text }}>{job.service_name}</span>
                    <span style={{ fontSize: "12px", color: p.textMuted }}>{new Date(job.date).toLocaleDateString()} • {job.time}</span>
                    <span style={{ fontSize: "11px", color: p.textMuted }}>📍 {job.address}</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 8 }}>
                    {job.status === 'confirmed' && (
                        <button 
                            onClick={() => updateStatus(job.id_booking, 'in_progress')}
                            style={{ fontSize: "12px", color: "#fff", background: p.primary, border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}
                        >Start Job</button>
                    )}
                    {job.status === 'in_progress' && (
                        <button 
                            onClick={() => updateStatus(job.id_booking, 'completed')}
                            style={{ fontSize: "12px", color: "#fff", background: "#4ade80", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}
                        >Mark Completed</button>
                    )}
                    <button style={{ 
                        fontSize: "12px", 
                        color: p.textMuted, 
                        background: "transparent", 
                        border: `1px solid ${p.border}`, 
                        borderRadius: 6,
                        padding: "6px 12px",
                        cursor: "pointer"
                    }}>
                        Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
