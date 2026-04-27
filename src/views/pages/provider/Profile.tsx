// src/pages/provider/Profile.tsx
import { useState, useEffect } from "react";
import { useTheme } from "@/controllers/context/ThemeContext";
import { useAuth } from "@/controllers/context/AuthContext";
import axiosInstance from "@/controllers/api/axiosInstance";

export default function Profile() {
  const { palette: p } = useTheme();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    address: "",
    bio: "",
    years_of_exp: 0,
    price_per_hour: 0,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/providers/profile");
        if (response.data.success) {
          const profile = response.data.profile;
          setFormData({
            name: profile.name || "",
            email: profile.email || "",
            phone_number: profile.phone_number || "",
            address: profile.address || "",
            bio: profile.bio || "",
            years_of_exp: profile.years_of_exp || 0,
            price_per_hour: profile.price_per_hour || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axiosInstance.put("/providers/profile", formData);
      
      // Update global Auth state so name changes reflect in Sidebar etc.
      updateUser({
        name: formData.name,
        email: formData.email
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

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
    opacity: saving ? 0.7 : 1
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: p.textMuted }}>Loading profile...</div>;

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: p.text, fontWeight: 400, marginBottom: 8 }}>Profile Settings</h1>
        <p style={{ color: p.textMuted, fontSize: 14 }}>Update your personal information and public profile details.</p>
      </div>

      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 30, paddingBottom: 25, borderBottom: `1px solid ${p.border}` }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(47,176,188,.15)", border: `1px solid ${p.primary}`, color: p.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 500 }}>
            {formData.name[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: p.text, marginBottom: 4 }}>{formData.name}</div>
            <div style={{ fontSize: 13, color: p.textMuted }}>Service Provider · Verified</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input
                type="text"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Hourly Rate (DZD)</label>
              <input
                type="number"
                value={formData.price_per_hour}
                onChange={(e) => setFormData({ ...formData, price_per_hour: parseInt(e.target.value) })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <div>
              <label style={labelStyle}>Years of Experience</label>
              <input
                type="number"
                value={formData.years_of_exp}
                onChange={(e) => setFormData({ ...formData, years_of_exp: parseInt(e.target.value) })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Location / Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
            <button type="submit" disabled={saving} style={primaryBtnStyle}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}












