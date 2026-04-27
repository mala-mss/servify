import React from 'react';
import { useTheme } from "@/controllers/context/ThemeContext";

interface Review {
  id: string;
  client: string;
  rating: number;
  comment: string;
  date: string;
  service: string;
}

const MOCK_REVIEWS: Review[] = [
  { id: "1", client: "Nadia K.", rating: 5, comment: "Excellent service! Very professional and caring. Would highly recommend for elderly care.", date: "20 Oct, 2023", service: "Elderly Care" },
  { id: "2", client: "Amine B.", rating: 4, comment: "Great experience overall. Punctual and very helpful with my father.", date: "15 Oct, 2023", service: "Elderly Care" },
  { id: "3", client: "Sara M.", rating: 5, comment: "My kids loved her! Very patient and creative with activities.", date: "10 Oct, 2023", service: "Babysitting" },
  { id: "4", client: "Karim D.", rating: 4, comment: "House was sparkling clean. A bit expensive but worth it.", date: "05 Oct, 2023", service: "Home Cleaning" },
];

export default function Reviews() {
  const { palette: p } = useTheme();

  const cardStyle: React.CSSProperties = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: "12px",
    padding: "24px",
    transition: "border-color .2s",
    marginBottom: "16px"
  };

  const renderStars = (rating: number) => {
    return (
      <div style={{ display: "flex", gap: "2px" }}>
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ color: i < rating ? "#fb923c" : p.textMuted, fontSize: "14px" }}>
            {i < rating ? "★" : "☆"}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "32px", color: p.text, marginBottom: "8px" }}>
          Client Reviews
        </h1>
        <p style={{ color: p.textMuted, fontSize: "14px" }}>
          See what clients are saying about your services.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "32px" }}>
        {/* RATING SUMMARY */}
        <div style={{ ...cardStyle, height: "fit-content", position: "sticky", top: "20px" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: "64px", color: p.text, lineHeight: 1 }}>4.8</div>
            <div style={{ margin: "8px 0" }}>{renderStars(5)}</div>
            <div style={{ fontSize: "14px", color: p.textMuted }}>Average Rating (31 Reviews)</div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "12px", color: p.textMuted, width: "10px" }}>{star}</span>
                <div style={{ flex: 1, height: "4px", background: p.border, borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ 
                    width: `${star === 5 ? 80 : star === 4 ? 15 : 5}%`, 
                    height: "100%", 
                    background: "#fb923c" 
                  }} />
                </div>
                <span style={{ fontSize: "12px", color: p.textMuted, width: "30px", textAlign: "right" }}>
                  {star === 5 ? "80%" : star === 4 ? "15%" : "5%"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* REVIEWS LIST */}
        <div>
          {MOCK_REVIEWS.map((review) => (
            <div 
              key={review.id} 
              style={cardStyle}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(47,176,188,.3)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = p.border)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: p.text, marginBottom: "4px" }}>{review.client}</h3>
                  <div style={{ fontSize: "12px", color: p.primary, fontWeight: 500 }}>{review.service}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {renderStars(review.rating)}
                  <div style={{ fontSize: "12px", color: p.textMuted, marginTop: "4px" }}>{review.date}</div>
                </div>
              </div>
              <p style={{ fontSize: "15px", color: p.textMuted, lineHeight: "1.6", fontStyle: "italic" }}>
                "{review.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}












