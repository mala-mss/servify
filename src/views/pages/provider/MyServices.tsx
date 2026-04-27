// src/pages/provider/MyServices.tsx
import React, { useState, useEffect } from 'react';
import { useTheme } from "@/controllers/context/ThemeContext";
import axiosInstance from "@/controllers/api/axiosInstance";

interface Service {
  id_service: number;
  name: string;
  description: string;
  base_price: string;
  category_name: string;
}

export default function MyServices() {
  const { palette: p } = useTheme();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyServices = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/providers/my-services");
      if (response.data.success) {
        setServices(response.data.services);
      }
    } catch (error) {
      console.error("Failed to fetch my services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyServices();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this service from your profile?")) return;
    try {
      await axiosInstance.delete(`/providers/my-controllers/services/${id}`);
      fetchMyServices();
    } catch (error) {
      console.error("Failed to delete service:", error);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: "12px",
    padding: "24px",
    transition: "all .2s ease",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    position: "relative",
    overflow: "hidden"
  };

  const primaryButtonStyle: React.CSSProperties = {
    background: p.primary,
    color: "#fff",
    borderRadius: "8px",
    padding: "11px 26px",
    border: "none",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    width: "100%"
  };

  const ghostButtonStyle: React.CSSProperties = {
    background: "transparent",
    border: `1px solid ${p.border}`,
    color: p.textMuted,
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "14px",
    cursor: "pointer",
    flex: 1,
    textAlign: "center"
  };

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "32px", color: p.text, marginBottom: "8px" }}>
            My Services
          </h1>
          <p style={{ color: p.textMuted, fontSize: "14px" }}>
            List and manage the services you offer to clients.
          </p>
        </div>
        <button style={{ ...primaryButtonStyle, width: "auto" }} onClick={() => window.location.href = '/provider/add-service'}>
          + Add New Service
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: p.textMuted }}>Loading your services...</div>
      ) : services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', background: p.cardBg, border: `1px dashed ${p.border}`, borderRadius: 12 }}>
            <p style={{ color: p.textMuted, marginBottom: 20 }}>You haven't listed any services yet.</p>
            <button style={{ ...primaryButtonStyle, width: "auto" }} onClick={() => window.location.href = '/provider/add-service'}>Add your first service</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {services.map((service) => (
            <div 
              key={service.id_service} 
              style={cardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(47,176,188,.3)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = p.border;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ 
                  fontSize: "10px", 
                  fontWeight: 600, 
                  letterSpacing: "1px", 
                  textTransform: "uppercase", 
                  color: p.primary,
                  background: "rgba(47,176,188,.1)",
                  padding: "4px 8px",
                  borderRadius: "4px"
                }}>
                  {service.category_name}
                </span>
                <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                  <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: "24px", color: p.text }}>{service.base_price}</span>
                  <span style={{ fontSize: "12px", color: p.textMuted }}> DZD</span>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 500, color: p.text, marginBottom: "8px" }}>{service.name}</h3>
                <p style={{ fontSize: "14px", color: p.textMuted, lineHeight: "1.5", minHeight: "63px" }}>{service.description}</p>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button 
                  style={{ ...ghostButtonStyle, color: "#f87171" }}
                  onClick={() => handleDelete(service.id_service)}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(248,113,113,.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  Remove Service
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}












