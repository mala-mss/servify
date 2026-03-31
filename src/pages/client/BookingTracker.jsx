// src/pages/client/BookingTracker.jsx
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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

  return (
    <div style={styles.root}>
      <div style={styles.container}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back to Booking</button>
        
        <h1 style={styles.title}>Live Tracker</h1>
        <p style={styles.subtitle}>Reference: {id || "BK-7821"}</p>

        <div style={styles.trackerBox}>
          {STEPS.map((step, i) => (
            <div key={step.id} style={styles.stepRow}>
              <div style={styles.indicatorCol}>
                <div style={{ 
                  ...styles.dot, 
                  background: step.status === "completed" ? "#2FB0BC" : (step.status === "current" ? "#2FB0BC" : "rgba(255,255,255,0.1)"),
                  boxShadow: step.status === "current" ? "0 0 20px #2FB0BC" : "none"
                }}>
                  {step.status === "completed" && "✓"}
                </div>
                {i !== STEPS.length - 1 && <div style={{ ...styles.line, background: step.status === "completed" ? "#2FB0BC" : "rgba(255,255,255,0.06)" }} />}
              </div>
              <div style={styles.contentCol}>
                <h3 style={{ ...styles.stepLabel, color: step.status === "pending" ? "rgba(255,255,255,0.3)" : "#e8e6e0" }}>{step.label}</h3>
                <p style={{ ...styles.stepDesc, color: "rgba(232,230,224,0.4)" }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.mapMock}>
          <div style={styles.mapOverlay}>
            <div style={styles.providerInfo}>
              <div style={styles.pulse} />
              <span>Maria is 10 mins away</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "#0e0e0e", color: "#e8e6e0", fontFamily: "'DM Sans', sans-serif", padding: "60px 24px" },
  container: { maxWidth: 600, margin: "0 auto" },
  backBtn: { background: "none", border: "none", color: "#2FB0BC", cursor: "pointer", marginBottom: 32 },
  title: { fontSize: 32, fontWeight: 600, marginBottom: 8 },
  subtitle: { fontSize: 14, color: "rgba(232,230,224,0.4)", marginBottom: 48 },
  trackerBox: { marginBottom: 60 },
  stepRow: { display: "flex", gap: 24, minHeight: 80 },
  indicatorCol: { display: "flex", flexDirection: "column", alignItems: "center" },
  dot: { width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, zIndex: 1 },
  line: { width: 2, flex: 1, margin: "4px 0" },
  contentCol: { paddingTop: 2 },
  stepLabel: { fontSize: 16, fontWeight: 600, marginBottom: 4 },
  stepDesc: { fontSize: 13 },
  mapMock: { width: "100%", height: 300, background: "#1a1a1a", borderRadius: 24, position: "relative", overflow: "hidden", backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)", backgroundSize: "20px 20px" },
  mapOverlay: { position: "absolute", bottom: 20, left: 20, right: 20 },
  providerInfo: { background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)", padding: "12px 20px", borderRadius: 12, display: "flex", alignItems: "center", gap: 12, fontSize: 14, border: "1px solid rgba(255,255,255,0.1)" },
  pulse: { width: 8, height: 8, background: "#2FB0BC", borderRadius: "50%", boxShadow: "0 0 10px #2FB0BC" }
};
