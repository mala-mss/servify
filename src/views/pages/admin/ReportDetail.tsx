import React, { useState, useEffect } from 'react';
import { useTheme } from "@/controllers/context/ThemeContext";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Flag, 
  User, 
  AlertTriangle,
  Clock,
  Trash2,
  Shield
} from 'lucide-react';
import { reportService } from '@/controllers/services/reportService';
import type { Report } from '@/controllers/services/reportService';

export default function ReportDetail() {
  const { palette: p, mode } = useTheme();
  const { id } = useParams(); // This is a bit tricky since report has composite key (reporter/reported emails)
  // For now, I'll just show a message or use the list view.
  // Actually, I'll redirect back to reports or implement a search.
  
  const navigate = useNavigate();

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <button 
        onClick={() => navigate('/admin/reports')}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', color: p.textMuted, cursor: 'pointer', marginBottom: 24, fontSize: 14 }}
      >
        <ArrowLeft size={16} />
        Back to Reports
      </button>

      <div style={{ background: p.cardBg, border: `1px solid ${p.border}`, borderRadius: 16, padding: 40, textAlign: 'center' }}>
        <Flag size={48} color="#f43f5e" style={{ marginBottom: 20, opacity: 0.5 }} />
        <h1 style={{ fontSize: 24, fontWeight: 600, color: p.text, marginBottom: 8 }}>Report Details</h1>
        <p style={{ color: p.textMuted, fontSize: 14, maxWidth: 400, margin: '0 auto' }}>
          Please use the main Reports list to view details and take actions on specific reports.
        </p>
        <button 
          onClick={() => navigate('/admin/reports')}
          style={{ marginTop: 32, padding: '10px 24px', background: p.primary, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}
        >
          Return to List
        </button>
      </div>
    </div>
  );
}
