import React from 'react';
import { useTheme } from "@/context/ThemeContext";

const ReportDetail = () => {
  const { palette: p } = useTheme();

  const cardStyle = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: 16,
    padding: 24,
    transition: "all 0.3s ease",
  };

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, fontWeight: 400, color: p.text, marginBottom: 8 }}>
          Report Detail
        </h1>
        <p style={{ fontSize: 14, color: p.textMuted }}>
          Review details for a specific report or feedback.
        </p>
      </div>

      <div style={cardStyle}>
        <p style={{ color: p.text }}>Content for Report Detail will be implemented here.</p>
        <div style={{ marginTop: 24, padding: 40, border: `2px dashed ${p.border}`, borderRadius: 12, textAlign: 'center', color: p.textMuted }}>
           List/Management UI Placeholder
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
