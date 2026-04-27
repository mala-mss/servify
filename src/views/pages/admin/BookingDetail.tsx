import React from 'react';
import { useTheme } from "@/controllers/context/ThemeContext";

const BookingDetail = () => {
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
          Booking Detail
        </h1>
        <p style={{ fontSize: 14, color: p.textMuted }}>
          Detailed information about a specific booking.
        </p>
      </div>

      <div style={cardStyle}>
        <p style={{ color: p.text }}>Content for Booking Detail will be implemented here.</p>
        <div style={{ marginTop: 24, padding: 40, border: `2px dashed ${p.border}`, borderRadius: 12, textAlign: 'center', color: p.textMuted }}>
           List/Management UI Placeholder
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;












