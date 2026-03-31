// src/pages/provider/IncomingRequests.tsx
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Link } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
// import api from "@/api/axiosInstance";

type Status = "pending" | "accepted" | "declined";

interface Request {
  id: number;
  client: string;
  avatar: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  address: string;
  note?: string;
  status: Status;
}

const MOCK_REQUESTS: Request[] = [
  { id: 1, client: "Leila Hadj",   avatar: "L", service: "Super Nanny",   date: "Tomorrow",  time: "10:00", duration: "3h", address: "Sétif, Ain Oulmene", note: "Two kids aged 4 and 7", status: "pending"  },
  { id: 2, client: "Omar Tizi",    avatar: "O", service: "Pickup Service", date: "Mon Apr 1", time: "08:30", duration: "1h", address: "Sétif Centre",        note: "Airport pickup",         status: "pending"  },
  { id: 3, client: "Fatima Zahra", avatar: "F", service: "Elderly Care",   date: "Tue Apr 2", time: "14:00", duration: "4h", address: "El Eulma",            note: "Daily medication check", status: "pending"  },
  { id: 4, client: "Amira Bel",    avatar: "A", service: "Babysitting",    date: "Wed Apr 3", time: "09:00", duration: "2h", address: "Sétif",               status: "accepted" },
  { id: 5, client: "Djamel K.",    avatar: "D", service: "Home Cleaning",  date: "Thu Apr 4", time: "11:00", duration: "3h", address: "El Eulma",            status: "declined" },
];

export default function IncomingRequests() {
  const { palette: p } = useTheme();
  const [requests, setRequests] = useState<Request[]>(MOCK_REQUESTS);
  const [tab, setTab] = useState<Status>("pending");
  const [declineId, setDeclineId]   = useState<number | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  const filtered = requests.filter((r) => r.status === tab);
  const counts   = { pending: requests.filter(r => r.status === "pending").length };

  const accept = (id: number) => {
    // PATCH /booking-requests/:id/accept
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "accepted" } : r));
  };

  const decline = (id: number) => {
    // PATCH /booking-requests/:id/decline with { reason: declineReason }
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "declined" } : r));
    setDeclineId(null);
    setDeclineReason("");
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
        {(["pending", "accepted", "declined"] as Status[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
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
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: p.textMuted, fontSize: 14 }}>
          No {tab} requests
        </div>
      )}

      {filtered.map((req) => (
        <div key={req.id} style={cardStyle}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(47,176,188,.15)", border: "1px solid rgba(47,176,188,.25)", color: p.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
                {req.avatar}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: p.text }}>{req.client}</div>
                <div style={{ fontSize: 12, color: p.primary, marginTop: 2 }}>{req.service}</div>
              </div>
            </div>
            {/* Status badge */}
            {req.status === "accepted" && <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 999, color: "#4ade80", background: "rgba(74,222,128,.1)" }}>Accepted</span>}
            {req.status === "declined" && <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 999, color: "#f87171", background: "rgba(248,113,113,.1)" }}>Declined</span>}
            {req.status === "pending"  && <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 999, color: "#fb923c", background: "rgba(251,146,60,.1)" }}>Pending</span>}
          </div>

          {/* Meta */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: req.note ? 12 : 14 }}>
            {[
              { icon: "◷", text: `${req.date} · ${req.time}` },
              { icon: "⊙", text: req.duration },
              { icon: "◎", text: req.address },
            ].map((m) => (
              <div key={m.text} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: p.textMuted }}>
                <span>{m.icon}</span> {m.text}
              </div>
            ))}
          </div>

          {/* Note */}
          {req.note && (
            <div style={{ fontSize: 12, color: p.textMuted, background: "rgba(47,176,188,.04)", border: "1px solid rgba(47,176,188,.1)", borderRadius: 6, padding: "8px 10px", marginBottom: 14 }}>
              📝 {req.note}
            </div>
          )}

          {/* Actions — pending only */}
          {req.status === "pending" && (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => accept(req.id)} style={{ padding: "8px 18px", background: "rgba(74,222,128,.1)", border: "1px solid rgba(74,222,128,.25)", borderRadius: 7, fontSize: 13, color: "#4ade80", cursor: "pointer", fontWeight: 500, fontFamily: "'DM Sans',sans-serif" }}>
                Accept
              </button>
              <button onClick={() => setDeclineId(req.id)} style={{ padding: "8px 18px", background: "rgba(248,113,113,.07)", border: "1px solid rgba(248,113,113,.2)", borderRadius: 7, fontSize: 13, color: "#f87171", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                Decline
              </button>
              <Link to={`/provider/jobs/${req.id}`} style={{ padding: "8px 14px", background: "transparent", border: `1px solid ${p.border}`, borderRadius: 7, fontSize: 13, color: p.textMuted, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center" }}>
                View details
              </Link>
            </div>
          )}
        </div>
      ))}

      {/* DECLINE MODAL */}
      {declineId !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(4px)" }}>
          <div style={{ background: p.cardBg === "#FFFFFF" ? "#fff" : "#1a1a1a", border: `1px solid ${p.border}`, borderRadius: 14, padding: 28, width: 440, maxWidth: "90vw" }}>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, marginBottom: 8, color: p.text }}>Decline request</div>
            <div style={{ fontSize: 13, color: p.textMuted, marginBottom: 20 }}>Optionally provide a reason. The client will be notified.</div>
            <textarea
              rows={3}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Reason for declining (optional)"
              style={{ width: "100%", background: "rgba(255,255,255,.04)", border: `1px solid ${p.border}`, borderRadius: 8, padding: "12px 14px", fontSize: 14, color: p.text, resize: "none", fontFamily: "'DM Sans',sans-serif", marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setDeclineId(null)} style={{ padding: "10px 18px", background: "transparent", border: `1px solid ${p.border}`, borderRadius: 8, fontSize: 13, color: p.textMuted, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
              <button onClick={() => decline(declineId)} style={{ padding: "10px 20px", background: "rgba(248,113,113,.12)", border: "1px solid rgba(248,113,113,.3)", borderRadius: 8, fontSize: 13, color: "#f87171", cursor: "pointer", fontWeight: 500, fontFamily: "'DM Sans',sans-serif" }}>Confirm decline</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
