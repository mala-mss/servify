import React, { createContext, useContext, useState, useCallback } from 'react';
import axiosInstance from "@/controllers/api/axiosInstance";

// Mirrors DB: booking(id_b, idu_cl, idu_sp, date, time, address, status)
export interface Booking {
  id_b: number;
  idu_cl: number;
  idu_sp: number;
  date: string;        // DATE  e.g. "2024-06-15"
  time: string;        // TIME  e.g. "09:00:00"
  address?: string;
  status?: string;     // default: 'confirmed'
}

// Mirrors DB: booking_request(id_r, idu_cl, idu_sp, date, time, duration, status, service_id)
export interface BookingRequest {
  id_r: number;
  idu_cl: number;
  idu_sp: number;
  date: string;
  time: string;
  duration?: string;
  status?: string;     // default: 'pending'
  service_id?: number;
}

interface BookingContextType {
  bookings: Booking[];
  bookingRequests: BookingRequest[];
  isLoading: boolean;
  error: string | null;
  fetchBookings: () => Promise<void>;
  fetchBookingRequests: () => Promise<void>;
  createBookingRequest: (data: Omit<BookingRequest, 'id_r' | 'status'>) => Promise<void>;
  updateBookingStatus: (id_b: number, status: string) => Promise<void>;
  updateRequestStatus: (id_r: number, status: string) => Promise<void>;
  deleteBooking: (id_b: number) => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookings, setBookings]               = useState<Booking[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading]             = useState(false);
  const [error, setError]                     = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/bookings');
      setBookings(res.data.bookings ?? []);
    } catch (err: any) {
      console.error('Fetch bookings error:', err);
      setError('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBookingRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/bookings/requests');
      setBookingRequests(res.data.requests ?? []);
    } catch (err: any) {
      console.error('Fetch booking requests error:', err);
      setError('Failed to load booking requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBookingRequest = useCallback(async (
    data: Omit<BookingRequest, 'id_r' | 'status'>
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post('/bookings/requests', data);
      setBookingRequests(prev => [res.data.request, ...prev]);
    } catch (err: any) {
      console.error('Create booking request error:', err);
      setError('Failed to create booking request');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBookingStatus = useCallback(async (id_b: number, status: string) => {
    setError(null);
    try {
      const res = await axiosInstance.patch(`/bookings/${id_b}/status`, { status });
      setBookings(prev =>
        prev.map(b => b.id_b === id_b ? { ...b, ...res.data.booking } : b)
      );
    } catch (err: any) {
      console.error('Update booking status error:', err);
      setError('Failed to update booking');
      throw err;
    }
  }, []);

  const updateRequestStatus = useCallback(async (id_r: number, status: string) => {
    setError(null);
    try {
      const res = await axiosInstance.patch(`/bookings/requests/${id_r}/status`, { status });
      setBookingRequests(prev =>
        prev.map(r => r.id_r === id_r ? { ...r, ...res.data.request } : r)
      );
    } catch (err: any) {
      console.error('Update request status error:', err);
      setError('Failed to update booking request');
      throw err;
    }
  }, []);

  const deleteBooking = useCallback(async (id_b: number) => {
    setError(null);
    try {
      await axiosInstance.delete(`/bookings/${id_b}`);
      setBookings(prev => prev.filter(b => b.id_b !== id_b));
    } catch (err: any) {
      console.error('Delete booking error:', err);
      setError('Failed to delete booking');
      throw err;
    }
  }, []);

  return (
    <BookingContext.Provider value={{
      bookings,
      bookingRequests,
      isLoading,
      error,
      fetchBookings,
      fetchBookingRequests,
      createBookingRequest,
      updateBookingStatus,
      updateRequestStatus,
      deleteBooking,
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBookings must be used within a BookingProvider');
  return context;
};

export { BookingContext };