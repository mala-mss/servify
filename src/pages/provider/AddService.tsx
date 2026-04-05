// src/pages/provider/AddService.tsx
import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

interface PlatformService {
  id_service: number;
  name: string;
  category_name: string;
  description: string;
  base_price: string;
}

export default function AddService() {
  const { palette: p } = useTheme();
  const navigate = useNavigate();

  const [services, setServices] = useState<PlatformService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAllServices = async () => {
      try {
        const response = await axiosInstance.get("/services");
        setServices(response.data.services);
      } catch (error) {
        console.error("Failed to fetch platform services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId) return;

    try {
      setSubmitting(true);
      await axiosInstance.post("/providers/my-services", { 
        serviceId: parseInt(selectedServiceId) 
      });
      navigate("/provider/my-services");
    } catch (error) {
      console.error("Failed to add service:", error);
      alert("Failed to add service. It might already be in your list.");
    } finally {
      setSubmitting(false);
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

  const selectStyle: React.CSSProperties = {
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
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='rgba(232,230,224,0.45)' stroke-width='1.5' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
  };

  const selectedService = services.find(s => s.id_service.toString() === selectedServiceId);

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div style={{ marginBottom: 32 }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", color: p.primary, fontSize: 13, cursor: "pointer", marginBottom: 12, padding: 0, display: "flex", alignItems: "center", gap: 6 }}
        >
          ← Back to services
        </button>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: p.text, fontWeight: 400, marginBottom: 8 }}>Add to My Services</h1>
        <p style={{ color: p.textMuted, fontSize: 14 }}>Select a service from our platform to add to your profile.</p>
      </div>

      <div style={cardStyle}>
        {loading ? (
          <div style={{ color: p.textMuted }}>Loading available services...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Select Service</label>
            <select 
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              style={selectStyle}
              required
            >
              <option value="">-- Choose a service --</option>
              {services.map(s => (
                <option key={s.id_service} value={s.id_service}>
                  {s.name} ({s.category_name})
                </option>
              ))}
            </select>

            {selectedService && (
              <div style={{ marginBottom: 24, padding: 16, background: "rgba(47,176,188,0.05)", borderRadius: 8, border: `1px solid ${p.primary}22` }}>
                <div style={{ ...labelStyle, marginBottom: 4 }}>Description</div>
                <div style={{ fontSize: 14, color: p.text, marginBottom: 12 }}>{selectedService.description}</div>
                <div style={{ ...labelStyle, marginBottom: 4 }}>Base Price</div>
                <div style={{ fontSize: 18, color: p.primary, fontWeight: 600 }}>{selectedService.base_price} DZD</div>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 10 }}>
              <button 
                type="button"
                onClick={() => navigate(-1)}
                style={{ background: "none", border: `1px solid ${p.border}`, color: p.text, borderRadius: 8, padding: "11px 24px", fontSize: 14, cursor: "pointer" }}
              >Cancel</button>
              <button 
                type="submit"
                disabled={submitting || !selectedServiceId}
                style={{ 
                  background: p.primary, 
                  color: "#fff", 
                  border: "none", 
                  borderRadius: 8, 
                  padding: "11px 26px", 
                  fontSize: 14, 
                  fontWeight: 500, 
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting || !selectedServiceId ? 0.7 : 1
                }}
              >
                {submitting ? "Adding..." : "Add to My Services"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
