// src/pages/provider/MyDocuments.tsx
import { useTheme } from "@/controllers/context/ThemeContext";

export default function MyDocuments() {
  const { palette: p } = useTheme();

  const documents = [
    { id: 1, name: "National ID Card", type: "Identity", status: "Verified", date: "Jan 12, 2024" },
    { id: 2, name: "Professional Certificate", type: "Qualification", status: "Verified", date: "Jan 12, 2024" },
    { id: 3, name: "Criminal Record Clearance", type: "Safety", status: "Pending", date: "May 10, 2024" },
    { id: 4, name: "Utility Bill", type: "Address", status: "Verified", date: "Jan 14, 2024" },
  ];

  const cardStyle: React.CSSProperties = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: 12,
    padding: 24,
    animation: "fadeUp .4s ease both",
  };

  const statusBadge = (status: string) => {
    const isVerified = status === "Verified";
    return (
      <span style={{
        fontSize: 11,
        fontWeight: 500,
        padding: "3px 10px",
        borderRadius: 999,
        color: isVerified ? "#4ade80" : "#fb923c",
        background: isVerified ? "rgba(74,222,128,.1)" : "rgba(251,146,60,.1)",
        border: `1px solid ${isVerified ? "rgba(74,222,128,.2)" : "rgba(251,146,60,.2)"}`
      }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: p.text, fontWeight: 400, marginBottom: 8 }}>Verification Documents</h1>
          <p style={{ color: p.textMuted, fontSize: 14 }}>Manage your identity and professional verification documents.</p>
        </div>
        <button style={{
          background: p.primary,
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 20px",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer"
        }}>
          Upload New Document
        </button>
      </div>

      <div style={cardStyle}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: `1px solid ${p.border}` }}>
              <th style={{ padding: "0 12px 16px", fontSize: 10, color: p.textMuted, letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 500 }}>Document Name</th>
              <th style={{ padding: "0 12px 16px", fontSize: 10, color: p.textMuted, letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 500 }}>Type</th>
              <th style={{ padding: "0 12px 16px", fontSize: 10, color: p.textMuted, letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 500 }}>Status</th>
              <th style={{ padding: "0 12px 16px", fontSize: 10, color: p.textMuted, letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 500 }}>Upload Date</th>
              <th style={{ padding: "0 12px 16px", fontSize: 10, color: p.textMuted, letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 500, textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} style={{ borderBottom: `1px solid ${p.border}` }}>
                <td style={{ padding: "18px 12px", fontSize: 14, color: p.text }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 18, color: p.primary }}>◻</span>
                    {doc.name}
                  </div>
                </td>
                <td style={{ padding: "18px 12px", fontSize: 13, color: p.textMuted }}>{doc.type}</td>
                <td style={{ padding: "18px 12px" }}>{statusBadge(doc.status)}</td>
                <td style={{ padding: "18px 12px", fontSize: 13, color: p.textMuted }}>{doc.date}</td>
                <td style={{ padding: "18px 12px", textAlign: "right" }}>
                  <button style={{
                    background: "none",
                    border: "none",
                    color: p.textMuted,
                    fontSize: 12,
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: 4,
                    transition: "color .2s"
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = p.text)}
                  onMouseOut={(e) => (e.currentTarget.style.color = p.textMuted)}
                  >
                    View File
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 24, padding: 20, borderRadius: 12, border: `1px dashed ${p.border}`, background: "rgba(255,255,255,0.01)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(47,176,188,.1)", color: p.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
            ◈
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: p.text }}>Why verify?</div>
            <div style={{ fontSize: 12, color: p.textMuted }}>Verified providers get 3x more job requests and appear higher in search results.</div>
          </div>
        </div>
      </div>
    </div>
  );
}












