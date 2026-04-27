import { Booking, BookingRequest, Notification, ServiceProvider, Client } from '../models';
import { createNotificationInternal } from '../controllers/notification.controller';

/**
 * Create a booking request (first step before confirmed booking)
 */
export const createBookingRequest = async (data: {
  client_id_fk: string;
  service_provider_id_fk: string;
  service_id: string;
  requested_date: string;
  requested_time: string;
  notes?: string;
}): Promise<BookingRequest> => {
  const bookingRequest = await BookingRequest.create(data);

  // Notify the provider about the new booking request
  await createNotificationInternal({
    user_id: data.service_provider_id_fk,
    title: 'New Booking Request',
    message: `You have a new booking request from a client.`,
    type: 'booking',
  });

  return bookingRequest;
};

/**
 * Accept a booking request and create a confirmed booking
 */
export const acceptBookingRequest = async (bookingRequestId: string): Promise<Booking> => {
  const bookingRequest = await BookingRequest.findByPk(bookingRequestId);

  if (!bookingRequest) {
    throw new Error('Booking request not found');
  }

  if (bookingRequest.status !== 'pending') {
    throw new Error('Booking request is not pending');
  }

  // Create confirmed booking
  const booking = await Booking.create({
    client_id: bookingRequest.client_id_fk,
    service_provider_id: bookingRequest.service_provider_id_fk,
    service_id: bookingRequest.service_id,
    start_date: bookingRequest.requested_date,
    end_date: bookingRequest.requested_date, // Could be extended based on service duration
    status: 'confirmed',
    total_price: 0, // Calculate from service price
    notes: bookingRequest.notes,
  });

  // Update booking request status
  await bookingRequest.update({ status: 'accepted' });

  // Notify the client
  await createNotificationInternal({
    user_id: bookingRequest.client_id_fk,
    title: 'Booking Accepted',
    message: `Your booking request has been accepted by the provider.`,
    type: 'booking',
  });

  return booking;
};

/**
 * Reject a booking request
 */
export const rejectBookingRequest = async (bookingRequestId: string): Promise<void> => {
  const bookingRequest = await BookingRequest.findByPk(bookingRequestId);

  if (!bookingRequest) {
    throw new Error('Booking request not found');
  }

  await bookingRequest.update({ status: 'rejected' });

  // Notify the client
  await createNotificationInternal({
    user_id: bookingRequest.client_id_fk,
    title: 'Booking Rejected',
    message: `Your booking request has been rejected by the provider.`,
    type: 'booking',
  });
};

/**
 * Update booking status with notification
 */
export const updateBookingStatus = async (
  bookingId: string,
  status: Booking['status']
): Promise<Booking> => {
  const booking = await Booking.findByPk(bookingId);

  if (!booking) {
    throw new Error('Booking not found');
  }

  await booking.update({ status });

  // Notify relevant parties based on status change
  let notificationTitle = '';
  let notificationMessage = '';

  switch (status) {
    case 'in_progress':
      notificationTitle = 'Booking In Progress';
      notificationMessage = 'Your booking is now in progress.';
      break;
    case 'completed':
      notificationTitle = 'Booking Completed';
      notificationMessage = 'Your booking has been completed. Please leave a review!';
      break;
    case 'cancelled':
      notificationTitle = 'Booking Cancelled';
      notificationMessage = 'The booking has been cancelled.';
      break;
  }

  if (notificationTitle) {
    await createNotificationInternal({
      user_id: booking.client_id,
      title: notificationTitle,
      message: notificationMessage,
      type: 'booking',
    });
  }

  return booking;
};

/**
 * Get booking statistics for a user
 */
export const getBookingStats = async (userId: string, role: string): Promise<{
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}> => {
  const where: any = {};

  if (role === 'client') {
    where.client_id = userId;
  } else if (role === 'provider') {
    where.service_provider_id = userId;
  }

  const [total, pending, confirmed, completed, cancelled] = await Promise.all([
    Booking.count({ where }),
    Booking.count({ where: { ...where, status: 'pending' } }),
    Booking.count({ where: { ...where, status: 'confirmed' } }),
    Booking.count({ where: { ...where, status: 'completed' } }),
    Booking.count({ where: { ...where, status: 'cancelled' } }),
  ]);

  return { total, pending, confirmed, completed, cancelled };
};
