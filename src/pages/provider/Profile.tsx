// src/pages/provider/Profile.tsx
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function Profile() {
  const { palette: p } = useTheme();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.name || "John Doe",
    email: user?.email || "john@example.com",
    phone: "+213 555 123 456",
    bio: "Professional caregiver with 5+ years of experience in elderly care and child assistance. Dedicated to providing high-quality service.",
    hourlyRate: "1200",
  });

  const cardStyle: React.CSSProperties = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: 12,
    padding: 30,
    maxWidth: 600,
    animation: "fadeUp .4s ease both",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 10,
    color: p.textMuted,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    marginBottom: 8,
    fontWeight: 500,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: 8,
    padding: "12px 14px",
    color: p.text,
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: 20,
    outline: "none",
    transition: "border-color .2s",
  };

  const textAreaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: 100,
    resize: "vertical",
  };

  const primaryBtnStyle: React.CSSProperties = {
    background: p.primary,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "11px 26px",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    marginTop: 10,
  };

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: p.text, fontWeight: 400, marginBottom: 8 }}>Profile Settings</h1>
        <p style={{ color: p.textMuted, fontSize: 14 }}>Update your personal information and public profile details.</p>
      </div>

      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 30, paddingBottom: 25, borderBottom: `1px solid ${p.border}` }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(47,176,188,.15)", border: `1px solid ${p.primary}`, color: p.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 500 }}>
            {formData.fullName[0]}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: p.text, marginBottom: 4 }}>{formData.fullName}</div>
            <div style={{ fontSize: 13, color: p.textMuted }}>Service Provider · Verified</div>
            <button style={{ background: "none", border: "none", color: p.primary, fontSize: 12, padding: 0, marginTop: 8, cursor: "pointer", fontWeight: 500 }}>Change Avatar</button>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Hourly Rate (DZD)</label>
              <input
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <label style={labelStyle}>Professional Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            style={textAreaStyle}
          />

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" style={primaryBtnStyle}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
