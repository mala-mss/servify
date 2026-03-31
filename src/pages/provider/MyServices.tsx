import React from 'react';
import { useTheme } from "../../context/ThemeContext";

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  unit: string;
  category: string;
}

const MOCK_SERVICES: Service[] = [
  { id: "1", name: "Elderly Care", description: "Professional medical and personal support for seniors.", price: "2,500", unit: "hour", category: "Medical" },
  { id: "2", name: "Babysitting", description: "Experienced child care and educational activities.", price: "1,800", unit: "hour", category: "Childcare" },
  { id: "3", name: "Home Cleaning", description: "Deep cleaning and organization for residential spaces.", price: "1,200", unit: "hour", category: "Housework" },
];

export default function MyServices() {
  const { palette: p } = useTheme();

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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {MOCK_SERVICES.map((service) => (
          <div 
            key={service.id} 
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
                {service.category}
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: "24px", color: p.text }}>{service.price}</span>
                <span style={{ fontSize: "12px", color: p.textMuted }}> DZD/{service.unit}</span>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 500, color: p.text, marginBottom: "8px" }}>{service.name}</h3>
              <p style={{ fontSize: "14px", color: p.textMuted, lineHeight: "1.5", minHeight: "63px" }}>{service.description}</p>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button 
                style={ghostButtonStyle}
                onClick={() => window.location.href = `/provider/edit-service/${service.id}`}
              >
                Edit Service
              </button>
              <button 
                style={{ ...ghostButtonStyle, color: "#f87171" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(248,113,113,.05)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
