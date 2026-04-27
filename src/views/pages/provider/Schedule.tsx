// src/pages/provider/Schedule.tsx
import React, { useState, useEffect } from 'react';
import { useTheme } from "@/controllers/context/ThemeContext";
import axiosInstance from "@/controllers/api/axiosInstance";

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

interface Event {
  day: number; // 0-6
  startTime: string;
  duration: number; // hours
  title: string;
  color: string;
}

export default function Schedule() {
  const { palette: p } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/bookings");
        if (response.data.bookings) {
          const filtered = response.data.bookings.filter((b: any) => 
            b.status === 'confirmed' || b.status === 'in_progress'
          );
          
          const mappedEvents = filtered.map((b: any) => {
            const date = new Date(b.date);
            // Adjust getDay to match Mon-Sun (0-6)
            let day = date.getDay() - 1;
            if (day === -1) day = 6; // Sunday

            return {
              day,
              startTime: b.time.substring(0, 5),
              duration: 2, // Default duration if not in DB
              title: `${b.service_name} - ${b.client_name}`,
              color: b.status === 'in_progress' ? 'rgba(167,139,250,0.15)' : 'rgba(47,176,188,0.15)'
            };
          });
          setEvents(mappedEvents);
        }
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  const containerStyle: React.CSSProperties = {
    background: p.cardBg,
    border: `1px solid ${p.border}`,
    borderRadius: "12px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column"
  };

  const headerCellStyle: React.CSSProperties = {
    padding: "16px",
    textAlign: "center",
    fontSize: "13px",
    fontWeight: 500,
    color: p.textMuted,
    borderBottom: `1px solid ${p.border}`,
    borderRight: `1px solid ${p.border}`,
    textTransform: "uppercase",
    letterSpacing: "1px"
  };

  const timeCellStyle: React.CSSProperties = {
    padding: "12px",
    fontSize: "12px",
    color: p.textMuted,
    textAlign: "right",
    borderBottom: `1px solid ${p.border}`,
    borderRight: `1px solid ${p.border}`,
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };

  const gridCellStyle: React.CSSProperties = {
    borderBottom: `1px solid ${p.border}`,
    borderRight: `1px solid ${p.border}`,
    position: "relative",
    height: "60px"
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: p.textMuted }}>Loading schedule...</div>;

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "32px", color: p.text, marginBottom: "8px" }}>
          Weekly Schedule
        </h1>
        <p style={{ color: p.textMuted, fontSize: "14px" }}>
          Manage your availability and view upcoming appointments.
        </p>
      </div>

      <div style={containerStyle}>
        {/* Header Row */}
        <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)" }}>
          <div style={{ ...headerCellStyle, borderRight: `1px solid ${p.border}` }}></div>
          {DAYS.map(day => (
            <div key={day} style={headerCellStyle}>{day}</div>
          ))}
        </div>

        {/* Time Rows */}
        <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)" }}>
          {TIMES.map((time) => (
            <React.Fragment key={time}>
              <div style={timeCellStyle}>{time}</div>
              {DAYS.map((_, dayIdx) => (
                <div key={dayIdx} style={gridCellStyle}>
                  {events.filter(e => e.day === dayIdx && e.startTime === time).map(event => (
                    <div 
                      key={event.title}
                      style={{
                        position: "absolute",
                        top: 4,
                        left: 4,
                        right: 4,
                        height: `calc(${event.duration * 60}px - 8px)`,
                        background: event.color,
                        border: `1px solid ${p.primary}44`,
                        borderRadius: "6px",
                        padding: "8px",
                        fontSize: "11px",
                        color: p.text,
                        zIndex: 10,
                        overflow: "hidden"
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: "2px" }}>{event.title}</div>
                      <div style={{ fontSize: "10px", opacity: 0.7 }}>{event.startTime}</div>
                    </div>
                  ))}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
