// src/pages/provider/IncomingRequests.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/controllers/context/ThemeContext";
import axiosInstance from "@/controllers/api/axiosInstance";

type Status = "pending" | "accepted" | "rejected";

interface BookingRequest {
  id_r: number;
  client_name: string;
  service_name: string;
  date: string;
  time: string;
  duration: string;
  status: Status;
  idu_cl: number;
  idu_sp: number;
  service_id: number;
}

export default function IncomingRequests() {
  const { palette: p } = useTheme();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [tab, setTab] = useState<Status>("pending");
  const [loading, setLoading] = useState(true);
  const [declineId, setDeclineId] = useState<number | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/bookings/requests");
      if (response.data.bookingRequests) {
        setRequests(response.data.bookingRequests);
      }
    } catch (error) {
      console.error("Failed to fetch booking requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const acceptRequest = async (id_r: number) => {
    try {
      const response = await axiosInstance.post(`/bookings/requests/${id_r}/accept`);
      if (response.data.conversationId) {
        navigate(`/chat/${response.data.conversationId}`);
      } else {
        fetchRequests();
      }
    } catch (error) {
      console.error("Failed to accept request:", error);
      alert("Failed to accept booking request. Please try again.");
    }
  };

  const rejectRequest = async (id_r: number) => {
    try {
      await axiosInstance.post(`/bookings/requests/${id_r}/reject`);
      fetchRequests();
      setDeclineId(null);
    } catch (error) {
      console.error("Failed to reject request:", error);
      alert("Failed to reject booking request. Please try again.");
    }
  };

  const filtered = requests.filter((r) => {
    if (tab === "pending") return r.status === "pending";
    if (tab === "accepted") return r.status === "accepted";
    if (tab === "rejected") return r.status === "rejected";
    return false;
  });

  const counts = {
    pending: requests.filter(r => r.status === "pending").length
  };

  const cardStyle: React.CSSProperties = {
    background: p.cardBg, border: `1px solid ${p.border}`,
    borderRadius: 10, padding: "18px 20px", marginBottom: 10,
    transition: "border-color .2s",
  };

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>

      {/* TABS */}
      <div style={{ display: "flex", borderBottom: `1px solid ${p.border}`, marginBottom: 24 }}>
        {(["pending", "accepted", "rejected"] as string[]).map((t) => (
          <button key={t} onClick={() => setTab(t as Status)} style={{
            padding: "10px 20px", background: "transparent", border: "none",
            borderBottom: `2px solid ${tab === t ? p.primary : "transparent"}`,
            fontSize: 13, color: tab === t ? p.text : p.textMuted,
            cursor: "pointer", marginBottom: -1, fontFamily: "'DM Sans', sans-serif",
            fontWeight: 400, transition: "color .2s, border-color .2s", textTransform: "capitalize",
          }}>
            {t}
            {t === "pending" && counts.pending > 0 && (
              <span style={{ marginLeft: 6, background: p.primary, color: "#fff", fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 999 }}>
                {counts.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* LIST */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: p.textMuted }}>Loading requests...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: p.textMuted, fontSize: 14 }}>
          No {tab} requests
        </div>
      ) : (
        filtered.map((req) => (
          <div key={req.id_r} style={cardStyle}>
            {/* Top row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(47,176,188,.15)", border: "1px solid rgba(47,176,188,.25)", color: p.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
                  {req.client_name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: p.text }}>{req.client_name}</div>
                  <div style={{ fontSize: 12, color: p.primary, marginTop: 2 }}>{req.service_name}</div>
                </div>
              </div>
              {/* Status badge */}
              <span style={{
                fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 999,
                color: req.status === 'accepted' ? "#4ade80" : req.status === 'pending' ? "#fb923c" : "#f87171",
                background: req.status === 'accepted' ? "rgba(74,222,128,.1)" : req.status === 'pending' ? "rgba(251,146,60,.1)" : "rgba(248,113,113,.1)"
              }}>
                {req.status}
              </span>
            </div>

            {/* Meta */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: p.textMuted }}>
                <span>◷</span> {new Date(req.date).toLocaleDateString()} · {req.time}
              </div>
              {req.duration && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: p.textMuted }}>
                  <span>⏱</span> {req.duration}
                </div>
              )}
            </div>

            {/* Actions — pending only */}
            {req.status === "pending" && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => acceptRequest(req.id_r)}
                  style={{ padding: "8px 18px", background: "rgba(74,222,128,.1)", border: "1px solid rgba(74,222,128,.25)", borderRadius: 7, fontSize: 13, color: "#4ade80", cursor: "pointer", fontWeight: 500, fontFamily: "'DM Sans',sans-serif" }}
                >
                  Accept
                </button>
                <button
                  onClick={() => setDeclineId(req.id_r)}
                  style={{ padding: "8px 18px", background: "rgba(248,113,113,.07)", border: "1px solid rgba(248,113,113,.2)", borderRadius: 7, fontSize: 13, color: "#f87171", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {/* DECLINE CONFIRMATION MODAL */}
      {declineId !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(4px)" }}>
          <div style={{ background: p.cardBg === "#FFFFFF" ? "#fff" : "#1a1a1a", border: `1px solid ${p.border}`, borderRadius: 14, padding: 28, width: 440, maxWidth: "90vw" }}>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, marginBottom: 8, color: p.text }}>Decline request</div>
            <div style={{ fontSize: 13, color: p.textMuted, marginBottom: 20 }}>Are you sure you want to decline this request? The client will be notified.</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setDeclineId(null)} style={{ padding: "10px 18px", background: "transparent", border: `1px solid ${p.border}`, borderRadius: 8, fontSize: 13, color: p.textMuted, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
              <button onClick={() => rejectRequest(declineId)} style={{ padding: "10px 20px", background: "rgba(248,113,113,.12)", border: "1px solid rgba(248,113,113,.3)", borderRadius: 8, fontSize: 13, color: "#f87171", cursor: "pointer", fontWeight: 500, fontFamily: "'DM Sans',sans-serif" }}>Confirm decline</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}