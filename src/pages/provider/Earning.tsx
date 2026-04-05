// src/pages/provider/Earning.tsx
import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import axiosInstance from "../../api/axiosInstance";

interface Transaction {
  id: number;
  client_name: string;
  service_name: string;
  amount: number;
  date: string;
  status: 'paid' | 'unpaid' | 'pending';
}

export default function Earning() {
  const { palette: p } = useTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/providers/earnings");
        if (response.data.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch earnings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  const cardStyle: React.CSSProperties = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: "12px",
    padding: "20px",
    transition: "border-color .2s",
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: p.textMuted }}>Loading earnings data...</div>;
  }

  const stats = data?.stats || { totalRevenue: 0, monthRevenue: 0, pendingPayout: 0, monthJobs: 0 };
  const transactions = data?.transactions || [];

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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        {[
          { label: "Total Revenue", val: stats.totalRevenue, sub: "All time earnings", icon: "💰" },
          { label: "This Month", val: stats.monthRevenue, sub: `${stats.monthJobs} jobs completed`, icon: "📈" },
          { label: "Pending Payout", val: stats.pendingPayout, sub: "Awaiting processing", icon: "⏳" },
        ].map((s) => (
          <div key={s.label} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <span style={{ fontSize: "11px", color: p.textMuted, letterSpacing: "1px", textTransform: "uppercase" }}>{s.label}</span>
              <span style={{ fontSize: "18px" }}>{s.icon}</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "8px" }}>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: "32px", color: p.text, lineHeight: 1 }}>{s.val}</span>
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
        <div style={{ ...cardStyle, padding: "0", overflowX: "auto" }}>
          {transactions.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: p.textMuted }}>No transactions found</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${p.border}`, background: "rgba(255,255,255,0.01)" }}>
                  <th style={{ textAlign: "left", padding: "16px 20px", color: p.textMuted, fontWeight: 500 }}>ID</th>
                  <th style={{ textAlign: "left", padding: "16px 20px", color: p.textMuted, fontWeight: 500 }}>Client</th>
                  <th style={{ textAlign: "left", padding: "16px 20px", color: p.textMuted, fontWeight: 500 }}>Service</th>
                  <th style={{ textAlign: "left", padding: "16px 20px", color: p.textMuted, fontWeight: 500 }}>Date</th>
                  <th style={{ textAlign: "right", padding: "16px 20px", color: p.textMuted, fontWeight: 500 }}>Amount</th>
                  <th style={{ textAlign: "right", padding: "16px 20px", color: p.textMuted, fontWeight: 500 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx: any) => (
                  <tr key={tx.id} style={{ borderBottom: `1px solid ${p.border}` }}>
                    <td style={{ padding: "16px 20px", color: p.textMuted }}>#TX{tx.id}</td>
                    <td style={{ padding: "16px 20px", color: p.text, fontWeight: 500 }}>{tx.client_name}</td>
                    <td style={{ padding: "16px 20px", color: p.text }}>{tx.service_name}</td>
                    <td style={{ padding: "16px 20px", color: p.textMuted }}>{new Date(tx.date).toLocaleDateString()}</td>
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
          )}
        </div>
      </div>
    </div>
  );
}
