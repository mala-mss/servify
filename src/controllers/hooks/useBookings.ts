import { useState, useEffect, useCallback } from 'react';
import { bookingService } from '../services';
import { Booking, BookingStats } from '../models';

interface UseBookingsResult {
  bookings: Booking[];
  stats: BookingStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<void>;
}

export const useBookings = (): UseBookingsResult => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [bookingsRes, statsRes] = await Promise.all([
        bookingService.getAll(),
        bookingService.getStats(),
      ]);
      setBookings(bookingsRes.bookings);
      setStats(statsRes.stats);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const updateBookingStatus = useCallback(async (id: string, status: Booking['status']) => {
    const response = await bookingService.updateStatus(id, status);
    setBookings(prev => prev.map(b => b.id === id ? response.booking : b));
  }, []);

  return {
    bookings,
    stats,
    isLoading,
    error,
    refresh: loadBookings,
    updateBookingStatus,
  };
};












