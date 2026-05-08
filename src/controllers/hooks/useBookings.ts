import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/controllers/api/axiosInstance';
import type { Booking, BookingRequest } from '@/controllers/context/BookingContext';

interface BookingStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
}

interface UseBookingsResult {
  bookings: Booking[];
  requests: BookingRequest[];
  stats: BookingStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateBookingStatus: (id_b: number, status: string) => Promise<void>;
  updateRequestStatus: (id_r: number, status: string) => Promise<void>;
}

export const useBookings = (): UseBookingsResult => {
  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [requests, setRequests]   = useState<BookingRequest[]>([]);
  const [stats, setStats]         = useState<BookingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [bookingsRes, requestsRes] = await Promise.all([
        axiosInstance.get('/bookings'),
        axiosInstance.get('/bookings/requests'),
      ]);

      const fetchedBookings: Booking[]        = bookingsRes.data.bookings  ?? [];
      const fetchedRequests: BookingRequest[] = requestsRes.data.requests  ?? [];

      setBookings(fetchedBookings);
      setRequests(fetchedRequests);

      // Derive stats from fetched data — no separate endpoint needed
      setStats({
        total:     fetchedBookings.length,
        confirmed: fetchedBookings.filter(b => b.status === 'confirmed').length,
        pending:   fetchedRequests.filter(r => r.status === 'pending').length,
        cancelled: fetchedBookings.filter(b => b.status === 'cancelled').length,
      });
    } catch (err: any) {
      console.error('Load bookings error:', err);
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Update a confirmed booking's status (id_b is integer PK)
  const updateBookingStatus = useCallback(async (id_b: number, status: string) => {
    try {
      const res = await axiosInstance.patch(`/bookings/${id_b}/status`, { status });
      setBookings(prev =>
        prev.map(b => b.id_b === id_b ? { ...b, ...res.data.booking } : b)
      );
      // Refresh stats
      setStats(prev => prev ? {
        ...prev,
        confirmed: status === 'confirmed' ? prev.confirmed + 1 : prev.confirmed,
        cancelled: status === 'cancelled' ? prev.cancelled + 1 : prev.cancelled,
      } : null);
    } catch (err: any) {
      console.error('Update booking status error:', err);
      throw err;
    }
  }, []);

  // Update a booking request's status (id_r is integer PK)
  const updateRequestStatus = useCallback(async (id_r: number, status: string) => {
    try {
      const res = await axiosInstance.patch(`/bookings/requests/${id_r}/status`, { status });
      setRequests(prev =>
        prev.map(r => r.id_r === id_r ? { ...r, ...res.data.request } : r)
      );
    } catch (err: any) {
      console.error('Update request status error:', err);
      throw err;
    }
  }, []);

  return {
    bookings,
    requests,
    stats,
    isLoading,
    error,
    refresh: loadBookings,
    updateBookingStatus,
    updateRequestStatus,
  };
};