// src/pages/provider/Dashboard.tsx
import { useState, useEffect } from "react";
import { useTheme } from "@/controllers/context/ThemeContext";
import { useAuth } from "@/controllers/context/AuthContext";
import { Link } from "react-router-dom";
import axiosInstance from "@/controllers/api/axiosInstance";

// ── Types ──
type JobStatus = "confirmed" | "in_progress" | "completed" | "pending" | "cancelled";

const STATUS_BADGE: Record<JobStatus, { label: string; color: string; bg: string }> = {
  confirmed:  { label: "Confirmed",    color: "#2FB0BC", bg: "rgba(47,176,188,.1)"  },
  in_progress:{ label: "In progress",  color: "#a78bfa", bg: "rgba(167,139,250,.1)" },
  completed:  { label: "Completed",    color: "#4ade80", bg: "rgba(74,222,128,.1)"  },
  pending:    { label: "Pending",      color: "#fb923c", bg: "rgba(251,146,60,.1)"  },
  cancelled:  { label: "Cancelled",    color: "#f87171", bg: "rgba(248,113,113,.1)" },
};

export default function Dashboard() {
  const { palette: p, mode } = useTheme();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/providers/dashboard");
      if (response.data.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAction = async (id: number, status: string) => {
    try {
      await axiosInstance.put(`/bookings/${id}/status`, { status });
      fetchDashboardData();
    } catch (error) {
      console.error(`Failed to ${status} booking:`, error);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: 16,
    padding: 24,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: p.textMuted }}>Loading dashboard...</div>;
  }

  const stats = data?.stats || {
    todayJobsCount: 0,
    pendingRequestsCount: 0,
    totalEarnings: 0,
    rating: 0,
    reviewCount: 0
  };

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <style>{`
        .stat-card:hover {
          border-color: ${p.primary}44 !important;
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -10px ${mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(47,176,188,0.1)'};
        }
        .job-card:hover {
          border-color: ${p.primary}66 !important;
          background: ${p.primary}05 !important;
        }
        .action-btn {
          transition: all 0.2s ease;
        }
        .accept-btn:hover {
          background: rgba(74,222,128,.2) !important;
          transform: scale(1.02);
        }
        .decline-btn:hover {
          background: rgba(248,113,113,.12) !important;
          transform: scale(1.02);
        }
        .view-all:hover {
          opacity: 0.8;
          transform: translateX(4px);
        }
      `}</style>

      {/* WELCOME HEADER */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, fontWeight: 400, color: p.text, marginBottom: 8 }}>
          Welcome back, {user?.name?.split(' ')[0] || 'Provider'}
        </h1>
        <p style={{ fontSize: 14, color: p.textMuted }}>
          You have <span style={{ color: p.primary, fontWeight: 500 }}>{stats.todayJobsCount} jobs</span> scheduled for today and <span style={{ color: "#fb923c", fontWeight: 500 }}>{stats.pendingRequestsCount} new requests</span>.
        </p>
      </div>

      {/* STATS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        {[
          { icon: "▣", label: "Today's Jobs",      val: stats.todayJobsCount,   sub: "Upcoming activities",  color: p.primary },
          { icon: "◎", label: "Pending Requests",  val: stats.pendingRequestsCount,   sub: "Requires action",        color: "#fb923c" },
          { icon: "◈", label: "Total Earnings",    val: `${stats.totalEarnings} DZD`, sub: "From completed jobs", color: p.secondary },
          { icon: "◉", label: "Avg Rating",        val: stats.rating || "0.0", sub: `From ${stats.reviewCount || 0} reviews`,        color: "#facc15" },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={cardStyle}>
            <div style={{ 
              width: 40, height: 40, borderRadius: 10, background: `${s.color}15`, 
              color: s.color, display: "flex", alignItems: "center", justifyContent: "center", 
              fontSize: 20, marginBottom: 16 
            }}>
              {s.icon}
            </div>
            <div style={{ fontSize: 11, color: p.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, lineHeight: 1, marginBottom: 8, color: p.text }}>{s.val}</div>
            <div style={{ fontSize: 12, color: p.textMuted }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 24 }}>

        {/* TODAY'S JOBS */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: p.text, fontWeight: 400 }}>Today's schedule</h2>
            <Link to="/provider/schedule" style={{ fontSize: 12, color: p.primary, fontWeight: 500 }}>View full schedule</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data?.todaysJobs.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', color: p.textMuted, fontSize: 14 }}>No jobs scheduled for today</div>
            ) : data?.todaysJobs.map((job: any) => {
              const s = STATUS_BADGE[job.status as JobStatus] || STATUS_BADGE.pending;
              return (
                <div key={job.id_booking} className="job-card" style={{ ...cardStyle, padding: "16px 20px", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: p.text }}>{job.client_name}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 20, color: s.color, background: s.bg, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: p.textMuted }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>🕒 {job.time}</span>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: p.border }} />
                    <span>{job.service_name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* NEW REQUESTS */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: p.text, fontWeight: 400 }}>New requests</h2>
            <Link to="/provider/incoming-requests" className="view-all" style={{ fontSize: 12, color: p.primary, fontWeight: 500, display: "flex", alignItems: "center", gap: 4, transition: "all 0.2s" }}>
              View all <span>→</span>
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data?.pendingRequests.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', color: p.textMuted, fontSize: 14 }}>No new requests</div>
            ) : data?.pendingRequests.map((r: any) => (
              <div key={r.id_booking} style={{ ...cardStyle, padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: p.text }}>{r.client_name}</span>
                  <span style={{ fontSize: 12, color: p.primary, fontWeight: 500 }}>{r.amount} DZD</span>
                </div>
                <div style={{ fontSize: 13, color: p.textMuted, marginBottom: 16 }}>
                  {r.service_name} · {new Date(r.date).toLocaleDateString()} at {r.time}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button 
                    onClick={() => handleAction(r.id_booking, 'confirmed')}
                    className="action-btn accept-btn" 
                    style={{ flex: 1, padding: "8px", background: "rgba(74,222,128,.1)", border: "1px solid rgba(74,222,128,.2)", borderRadius: 10, fontSize: 13, color: "#4ade80", cursor: "pointer", fontWeight: 600 }}
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleAction(r.id_booking, 'cancelled')}
                    className="action-btn decline-btn" 
                    style={{ padding: "8px 16px", background: "rgba(248,113,113,.05)", border: "1px solid rgba(248,113,113,.15)", borderRadius: 10, fontSize: 13, color: "#f87171", cursor: "pointer", fontWeight: 500 }}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}












