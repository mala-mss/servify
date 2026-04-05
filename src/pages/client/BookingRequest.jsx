// src/pages/client/BookingRequest.jsx
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

const PALETTES = {
  dark: {
    primary: "#2FB0BC",
    bg: "#0e0e0e",
    cardBg: "rgba(255,255,255,0.02)",
    text: "#e8e6e0",
    textMuted: "rgba(232,230,224,0.5)",
    border: "rgba(255,255,255,0.06)",
    inputBg: "rgba(255,255,255,0.03)"
  }
};

export default function BookingRequest() {
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get("serviceId");
  const serviceName = searchParams.get("serviceName");
  
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    notes: "",
    address: ""
  });

  const p = PALETTES.dark;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Step 3: Launch search for service provider with criteria
    navigate(`/client/browse-providers?serviceId=${serviceId}&date=${formData.date}&time=${formData.time}&address=${encodeURIComponent(formData.address)}&notes=${encodeURIComponent(formData.notes)}&serviceName=${encodeURIComponent(serviceName || '')}`);
  };

  return (
    <div style={{ ...styles.root, background: p.bg, color: p.text }}>
      <div style={styles.container}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ ...styles.card, background: p.cardBg, borderColor: p.border }}
        >
          <div style={styles.stepIndicator}>Step 2 of 4</div>
          <h1 style={styles.title}>Booking Details</h1>
          <p style={{ ...styles.subtitle, color: p.textMuted }}>
            Service: <strong style={{ color: p.primary }}>{serviceName || "Selected Service"}</strong>
          </p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>When do you need the service?</label>
              <div style={styles.inputRow}>
                <input 
                  type="date" 
                  required
                  style={{ ...styles.input, flex: 2, background: p.inputBg, borderColor: p.border, color: p.text }}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
                <select 
                  required
                  style={{ ...styles.input, flex: 1, background: p.inputBg, borderColor: p.border, color: p.text }}
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                >
                  <option value="">Time</option>
                  <option value="08:00">08:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Service Address</label>
              <input 
                type="text" 
                placeholder="Where should the provider come?"
                required
                style={{ ...styles.input, background: p.inputBg, borderColor: p.border, color: p.text }}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Special Instructions (Optional)</label>
              <textarea 
                placeholder="Anything the provider should know?"
                style={{ ...styles.input, ...styles.textarea, background: p.inputBg, borderColor: p.border, color: p.text }}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div style={styles.actions}>
              <button type="button" onClick={() => navigate(-1)} style={styles.cancelBtn}>Back</button>
              <button type="submit" style={{ ...styles.submitBtn, background: p.primary }}>Find Available Providers</button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#0e0e0e" },
  container: { width: "100%", maxWidth: 600 },
  card: { padding: 48, borderRadius: 32, border: "1px solid", boxShadow: "0 40px 80px rgba(0,0,0,0.3)" },
  stepIndicator: { fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#2FB0BC", marginBottom: 16 },
  title: { fontSize: 32, fontWeight: 600, marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 40 },
  form: { display: "flex", flexDirection: "column", gap: 24 },
  formGroup: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 14, fontWeight: 500 },
  inputRow: { display: "flex", gap: 12 },
  input: { padding: "16px", borderRadius: 12, border: "1px solid", fontSize: 15, outline: "none", transition: "border-color 0.2s" },
  textarea: { minHeight: 100, resize: "vertical" },
  actions: { display: "flex", gap: 16, marginTop: 16 },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 12, border: "none", background: "transparent", color: "#fff", cursor: "pointer", fontSize: 16 },
  submitBtn: { flex: 2, padding: 16, borderRadius: 12, border: "none", color: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 600 }
};
