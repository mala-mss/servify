import { useTheme } from "@/context/ThemeContext";
import { useParams } from "react-router-dom";

export default function UserDetail() {
  const { palette: p } = useTheme();
  const { id } = useParams();

  const cardStyle = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: 16,
    padding: 24,
    transition: "all 0.3s ease"
  };

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, fontWeight: 400, color: p.text, marginBottom: 8 }}>
          User Detail
        </h1>
        <p style={{ color: p.textMuted, fontSize: 14 }}>
          Viewing user ID: {id}
        </p>
      </div>

      <div style={cardStyle}>
        <div style={{ color: p.textMuted, textAlign: "center", padding: "40px 0" }}>
          User details will be displayed here
        </div>
      </div>
    </div>
  );
}
