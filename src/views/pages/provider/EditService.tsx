// src/pages/provider/EditService.tsx
import { useTheme } from "@/controllers/context/ThemeContext";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditService() {
  const { palette: p } = useTheme();
  const navigate = useNavigate();
  useParams();

  const [formData, setFormData] = useState({
    title: "Professional Babysitting",
    category: "Child Care",
    description: "Experienced care for children of all ages. Includes activities, meal prep, and bedtime routine. Available on weekends and evenings.",
    priceType: "hourly",
    price: "1200",
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
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: "none",
    background: `${p.cardBg} url("data:image/svg+xml,%3Csvg xmlns='http:/www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='rgba(232,230,224,0.45)' stroke-width='1.5' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 14px center`,
  };

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div style={{ marginBottom: 32 }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", color: p.primary, fontSize: 13, cursor: "pointer", marginBottom: 12, padding: 0, display: "flex", alignItems: "center", gap: 6 }}
        >
          ← Back to services
        </button>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: p.text, fontWeight: 400, marginBottom: 8 }}>Edit Service</h1>
        <p style={{ color: p.textMuted, fontSize: 14 }}>Update your service details and pricing.</p>
      </div>

      <div style={cardStyle}>
        <form onSubmit={(e) => { e.preventDefault(); navigate("/provider/my-services"); }}>
          <label style={labelStyle}>Service Title</label>
          <input 
            type="text" 
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            style={inputStyle}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                style={selectStyle}
              >
                <option value="Child Care">Child Care</option>
                <option value="Elderly Care">Elderly Care</option>
                <option value="Home Cleaning">Home Cleaning</option>
                <option value="Tutoring">Tutoring</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Price Type</label>
              <select 
                value={formData.priceType}
                onChange={(e) => setFormData({...formData, priceType: e.target.value})}
                style={selectStyle}
              >
                <option value="hourly">Per Hour</option>
                <option value="fixed">Fixed Price</option>
              </select>
            </div>
          </div>

          <label style={labelStyle}>Price (DZD)</label>
          <input 
            type="number" 
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            style={inputStyle}
          />

          <label style={labelStyle}>Service Description</label>
          <textarea 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
          />

          <div style={{ display: "flex", gap: 12, justifyContent: "space-between", marginTop: 10 }}>
            <button 
              type="button"
              style={{ background: "rgba(248,113,113,.07)", border: "1px solid rgba(248,113,113,.2)", color: "#f87171", borderRadius: 8, padding: "11px 24px", fontSize: 14, cursor: "pointer" }}
            >Delete Service</button>
            <div style={{ display: "flex", gap: 12 }}>
              <button 
                type="button"
                onClick={() => navigate(-1)}
                style={{ background: "none", border: `1px solid ${p.border}`, color: p.text, borderRadius: 8, padding: "11px 24px", fontSize: 14, cursor: "pointer" }}
              >Cancel</button>
              <button 
                type="submit"
                style={{ background: p.primary, color: "#fff", border: "none", borderRadius: 8, padding: "11px 26px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
              >Save Changes</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}












