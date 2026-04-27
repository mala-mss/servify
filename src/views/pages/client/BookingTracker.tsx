// src/pages/client/BookingTracker.jsx
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/controllers/context/ThemeContext";

const STEPS = [
  { id: 1, label: "Booking Requested", desc: "Waiting for provider confirmation", status: "completed" },
  { id: 2, label: "Confirmed", desc: "Maria has accepted your request", status: "current" },
  { id: 3, label: "On the way", desc: "Provider is heading to your location", status: "pending" },
  { id: 4, label: "Service in Progress", desc: "Estimated finish: 12:00 PM", status: "pending" },
  { id: 5, label: "Completed", desc: "Service finalized", status: "pending" }
];

export default function BookingTracker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mode: theme, palette: p } = useTheme();

  return (
    <div style={{ ...styles.root, background: p.bg, color: p.text }}>
      <div style={styles.container}>
        <button onClick={() => navigate(-1)} style={{ ...styles.backBtn, color: p.primary }}>← Back to Booking</button>
        
        <h1 style={{ ...styles.title, color: p.text }}>Live Tracker</h1>
        <p style={{ ...styles.subtitle, color: p.textMuted }}>Reference: {id || "BK-7821"}</p>

        <div style={styles.trackerBox}>
          {STEPS.map((step, i) => (
            <div key={step.id} style={styles.stepRow}>
              <div style={styles.indicatorCol}>
                <div style={{ 
                  ...styles.dot, 
                  background: step.status === "completed" ? p.primary : (step.status === "current" ? p.primary : p.grid),
                  color: "#fff",
                  boxShadow: step.status === "current" ? `0 0 20px ${p.primary}` : "none"
                }}>
                  {step.status === "completed" && "✓"}
                </div>
                {i !== STEPS.length - 1 && <div style={{ ...styles.line, background: step.status === "completed" ? p.primary : p.border }} />}
              </div>
              <div style={styles.contentCol}>
                <h3 style={{ ...styles.stepLabel, color: step.status === "pending" ? p.textMuted : p.text }}>{step.label}</h3>
                <p style={{ ...styles.stepDesc, color: p.textMuted }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ ...styles.mapMock, background: p.cardBg, borderColor: p.border, border: "1px solid" }}>
          <div style={styles.mapOverlay}>
            <div style={{ ...styles.providerInfo, background: theme === 'dark' ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.9)", borderColor: p.border, color: p.text }}>
              <div style={{ ...styles.pulse, background: p.primary, boxShadow: `0 0 10px ${p.primary}` }} />
              <span>Maria is 10 mins away</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", padding: "60px 24px" },
  container: { maxWidth: 600, margin: "0 auto" },
  backBtn: { background: "none", border: "none", cursor: "pointer", marginBottom: 32 },
  title: { fontSize: 32, fontWeight: 600, marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 48 },
  trackerBox: { marginBottom: 60 },
  stepRow: { display: "flex", gap: 24, minHeight: 80 },
  indicatorCol: { display: "flex", flexDirection: "column", alignItems: "center" },
  dot: { width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, zIndex: 1 },
  line: { width: 2, flex: 1, margin: "4px 0" },
  contentCol: { paddingTop: 2 },
  stepLabel: { fontSize: 16, fontWeight: 600, marginBottom: 4 },
  stepDesc: { fontSize: 13 },
  mapMock: { width: "100%", height: 300, borderRadius: 24, position: "relative", overflow: "hidden", backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)", backgroundSize: "20px 20px" },
  mapOverlay: { position: "absolute", bottom: 20, left: 20, right: 20 },
  providerInfo: { backdropFilter: "blur(10px)", padding: "12px 20px", borderRadius: 12, display: "flex", alignItems: "center", gap: 12, fontSize: 14, border: "1px solid" },
  pulse: { width: 8, height: 8, borderRadius: "50%" }
};












