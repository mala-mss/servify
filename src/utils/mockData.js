// src/utils/mockData.js

export const INITIAL_NOTIFICATIONS = [
  { id: 101, title: "Booking Confirmed", desc: "Your cleaning with Maria is set.", time: "2h ago", unread: true, type: "info" },
  { id: 102, title: "New Message", desc: "Alex: I'll be there at 10.", time: "5h ago", unread: true, type: "info" },
];

export const BOOKINGS = [
  { id: "BK-7821", service: "Home Cleaning", provider: "Maria Garcia", date: "March 28, 2026", time: "10:00 AM", status: "upcoming", price: 30, paidFirst: true, paidSecond: false },
  { id: "BK-7540", service: "Plumbing Repair", provider: "Alex Johnson", date: "March 22, 2026", time: "02:30 PM", status: "completed", price: 45, paidFirst: true, paidSecond: false },
  { id: "BK-7129", service: "Math Tutoring", provider: "Emily White", date: "March 15, 2026", time: "04:00 PM", status: "completed", price: 35, paidFirst: true, paidSecond: true },
  { id: "BK-8001", service: "AC Repair", provider: "John Doe", date: "April 02, 2026", time: "09:00 AM", status: "pending", price: 50, paidFirst: false, paidSecond: false },
];
