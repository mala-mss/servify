// src/pages/provider/JobDetail.tsx
import { useTheme } from "@/controllers/context/ThemeContext";
import { useNavigate, useParams } from "react-router-dom";

export default function JobDetail() {
  const { palette: p } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data for a single job
  const job = {
    id: id || "101",
    client: {
      name: "Sara Mansouri",
      phone: "+213 661 223 344",
      address: "12 Rue des Lilas, Hydra, Algiers",
      rating: 4.9,
      avatar: "S"
    },
    service: "Babysitting & Early Education",
    status: "confirmed",
    date: "Oct 24, 2024",
    time: "09:00 - 13:00 (4h)",
    totalPrice: "4,800 DZD",
    notes: "The kids love drawing. Please make sure they finish their homework before 11am. Emergency contact is my husband (Amine)."
  };

  const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
    confirmed:  { label: "Confirmed",    color: "#2FB0BC", bg: "rgba(47,176,188,.1)"  },
    in_progress:{ label: "In progress",  color: "#a78bfa", bg: "rgba(167,139,250,.1)" },
    completed:  { label: "Completed",    color: "#4ade80", bg: "rgba(74,222,128,.1)"  },
    pending:    { label: "Pending",      color: "#fb923c", bg: "rgba(251,146,60,.1)"  },
    declined:   { label: "Declined",     color: "#f87171", bg: "rgba(248,113,113,.1)" },
  };

  const s = STATUS_BADGE[job.status] || STATUS_BADGE.pending;

  const cardStyle: React.CSSProperties = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: 12,
    padding: 24,
    animation: "fadeUp .4s ease both",
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: 10,
    color: p.textMuted,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    marginBottom: 12,
    fontWeight: 500,
  };

  return (
    <div style={{ animation: "fadeUp .4s ease both", maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button 
            onClick={() => navigate(-1)}
            style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${p.border}`, background: p.cardBg, color: p.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >←</button>
          <div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: p.text, fontWeight: 400 }}>Job Details #{job.id}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 999, color: s.color, background: s.bg }}>{s.label}</span>
              <span style={{ fontSize: 12, color: p.textMuted }}>Booked on Oct 12, 2024</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ background: "rgba(248,113,113,.07)", border: "1px solid rgba(248,113,113,.2)", color: "#f87171", borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer" }}>Cancel Job</button>
          <button style={{ background: p.primary, color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Message Client</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Main Info */}
          <div style={cardStyle}>
            <div style={{ marginBottom: 24 }}>
              <div style={sectionLabelStyle}>Service Requested</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: p.text }}>{job.service}</div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              <div>
                <div style={sectionLabelStyle}>Date & Time</div>
                <div style={{ fontSize: 14, color: p.text }}>{job.date}</div>
                <div style={{ fontSize: 14, color: p.textMuted, marginTop: 4 }}>{job.time}</div>
              </div>
              <div>
                <div style={sectionLabelStyle}>Total Earnings</div>
                <div style={{ fontSize: 20, fontFamily: "'Instrument Serif', serif", color: p.primary }}>{job.totalPrice}</div>
                <div style={{ fontSize: 12, color: p.textMuted, marginTop: 4 }}>Paid via Credit Card</div>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${p.border}`, paddingTop: 24 }}>
              <div style={sectionLabelStyle}>Special Notes</div>
              <div style={{ fontSize: 14, color: p.text, lineHeight: 1.6, background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 8, border: `1px solid ${p.border}` }}>
                {job.notes}
              </div>
            </div>
          </div>

          {/* Timeline or Actions */}
          <div style={{ ...cardStyle, background: "transparent", borderStyle: "dashed" }}>
            <div style={sectionLabelStyle}>Job Status Update</div>
            <div style={{ display: "flex", gap: 12 }}>
              <button style={{ flex: 1, padding: "12px", borderRadius: 8, background: "rgba(167,139,250,.1)", border: "1px solid rgba(167,139,250,.2)", color: "#a78bfa", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Start Job</button>
              <button style={{ flex: 1, padding: "12px", borderRadius: 8, background: "rgba(74,222,128,.1)", border: "1px solid rgba(74,222,128,.2)", color: "#4ade80", fontSize: 13, fontWeight: 500, cursor: "not-allowed", opacity: 0.5 }}>Mark as Completed</button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Client Card */}
          <div style={cardStyle}>
            <div style={sectionLabelStyle}>Client Information</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(47,176,188,.1)", color: p.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 600 }}>
                {job.client.avatar}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 500, color: p.text }}>{job.client.name}</div>
                <div style={{ fontSize: 12, color: "#fb923c" }}>★ {job.client.rating} Client Rating</div>
              </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: p.textMuted, marginBottom: 4 }}>Phone Number</div>
                <div style={{ fontSize: 13, color: p.text }}>{job.client.phone}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: p.textMuted, marginBottom: 4 }}>Service Address</div>
                <div style={{ fontSize: 13, color: p.text, lineHeight: 1.4 }}>{job.client.address}</div>
              </div>
              <button style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${p.border}`, background: p.cardBg, color: p.text, fontSize: 12, cursor: "pointer", marginTop: 8 }}>
                Get Directions
              </button>
            </div>
          </div>

          {/* Help/Support */}
          <div style={{ padding: 20, borderRadius: 12, background: "rgba(47,176,188,.05)", border: `1px solid rgba(47,176,188,.1)` }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: p.primary, marginBottom: 8 }}>Need help with this job?</div>
            <div style={{ fontSize: 12, color: p.textMuted, lineHeight: 1.5, marginBottom: 12 }}>If you encounter any issues or need to report a problem, contact our support team.</div>
            <button style={{ background: "none", border: "none", color: p.primary, fontSize: 12, fontWeight: 600, padding: 0, cursor: "pointer" }}>Contact Support →</button>
          </div>
        </div>
      </div>
    </div>
  );
}












