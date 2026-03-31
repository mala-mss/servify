import React from 'react';
import { useTheme } from "../../context/ThemeContext";

interface Transaction {
  id: string;
  client: string;
  service: string;
  amount: string;
  date: string;
  status: 'paid' | 'pending';
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "TX1001", client: "Amine B.", service: "Elderly Care", amount: "12,500", date: "24 Oct, 2023", status: 'paid' },
  { id: "TX1002", client: "Sarah M.", service: "Babysitting", amount: "5,400", date: "22 Oct, 2023", status: 'paid' },
  { id: "TX1003", client: "Karim D.", service: "Home Cleaning", amount: "3,600", date: "20 Oct, 2023", status: 'pending' },
  { id: "TX1004", client: "Lila H.", service: "Elderly Care", amount: "8,200", date: "18 Oct, 2023", status: 'paid' },
];

export default function Earning() {
  const { palette: p } = useTheme();

  const cardStyle: React.CSSProperties = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: "12px",
    padding: "20px",
    transition: "border-color .2s",
  };

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "32px", color: p.text, marginBottom: "8px" }}>
          Earnings
        </h1>
        <p style={{ color: p.textMuted, fontSize: "14px" }}>
          Track your revenue and pending payouts.
        </p>
      </div>

      {/* STATS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "40px" }}>
        {[
          { label: "Total Revenue", val: "154,200", sub: "+12% from last month", icon: "💰" },
          { label: "This Month", val: "42,800", sub: "14 jobs completed", icon: "📈" },
          { label: "Pending Payout", val: "18,400", sub: "Available on Nov 1st", icon: "⏳" },
        ].map((s) => (
          <div key={s.label} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <span style={{ fontSize: "11px", color: p.textMuted, letterSpacing: "1px", textTransform: "uppercase" }}>{s.label}</span>
              <span style={{ fontSize: "18px" }}>{s.icon}</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "8px" }}>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: "36px", color: p.text, lineHeight: 1 }}>{s.val}</span>
              <span style={{ fontSize: "14px", color: p.textMuted }}>DZD</span>
            </div>
            <div style={{ fontSize: "12px", color: p.primary }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* RECENT EARNINGS */}
      <div>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "22px", color: p.text, marginBottom: "20px" }}>
          Recent Transactions
        </h2>
        <div style={{ ...cardStyle, padding: "0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${p.border}`, background: "rgba(255,255,255,0.01)" }}>
                <th style={{ textAlign: "left", padding: "16px 20px", color: p.textMuted, fontWeight: 500 }}>Transaction ID</th>
                <th style={{ textAlign: "left", padding: "16px 20px", color: p.textMuted, fontWeight: 500 }}>Client</th>
                <th style={{ textAlign: "left", padding: "16px 20px", color: p.textMuted, fontWeight: 500 }}>Service</th>
                <th style={{ textAlign: "left", padding: "16px 20px", color: p.textMuted, fontWeight: 500 }}>Date</th>
                <th style={{ textAlign: "right", padding: "16px 20px", color: p.textMuted, fontWeight: 500 }}>Amount</th>
                <th style={{ textAlign: "right", padding: "16px 20px", color: p.textMuted, fontWeight: 500 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TRANSACTIONS.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: `1px solid ${p.border}` }}>
                  <td style={{ padding: "16px 20px", color: p.textMuted }}>{tx.id}</td>
                  <td style={{ padding: "16px 20px", color: p.text, fontWeight: 500 }}>{tx.client}</td>
                  <td style={{ padding: "16px 20px", color: p.text }}>{tx.service}</td>
                  <td style={{ padding: "16px 20px", color: p.textMuted }}>{tx.date}</td>
                  <td style={{ padding: "16px 20px", textAlign: "right", color: p.text, fontWeight: 600 }}>{tx.amount} DZD</td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <span style={{ 
                      fontSize: "11px", 
                      padding: "4px 10px", 
                      borderRadius: "999px",
                      background: tx.status === 'paid' ? "rgba(74,222,128,0.1)" : "rgba(251,146,60,0.1)",
                      color: tx.status === 'paid' ? "#4ade80" : "#fb923c"
                    }}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
