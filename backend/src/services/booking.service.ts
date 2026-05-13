import { Booking, BookingRequest } from '../models';
import { createNotificationInternal } from '../controllers/notification.controller';

/**
 * Create a booking request
 */
export const createBookingRequestService = async (data: {
  idU_cl: number;
  idU_SP: number;
  service_id: number;
  date: Date;
  time: string;
  duration?: string;
}): Promise<BookingRequest> => {
  const bookingRequest = await BookingRequest.create({
    ...data,
    status: 'pending'
  });

  // Notify the provider
  await createNotificationInternal(
    data.idU_SP,
    'New Booking Request',
    `You have a new booking request from a client.`,
    'booking'
  );

  return bookingRequest;
};

/**
 * Accept a booking request and create a confirmed booking
 */
export const acceptBookingRequestService = async (id_R: number, idU_cl: number, idU_SP: number): Promise<Booking> => {
  const bookingRequest = await BookingRequest.findOne({ where: { id_R, idU_cl, idU_SP } });

  if (!bookingRequest) {
    throw new Error('Booking request not found');
  }

  if (bookingRequest.status !== 'pending') {
    throw new Error('Booking request is not pending');
  }

  // Create confirmed booking
  const booking = await Booking.create({
    idU_cl: bookingRequest.idU_cl,
    idU_SP: bookingRequest.idU_SP,
    date: bookingRequest.date,
    time: bookingRequest.time,
    status: 'confirmed',
  });

  // Update booking request status
  await bookingRequest.update({ status: 'accepted' });

  // Notify the client
  await createNotificationInternal(
    bookingRequest.idU_cl,
    'Booking Accepted',
    `Your booking request has been accepted by the provider.`,
    'booking'
  );

  return booking;
};

/**
 * Reject a booking request
 */
export const rejectBookingRequestService = async (id_R: number, idU_cl: number, idU_SP: number): Promise<void> => {
  const bookingRequest = await BookingRequest.findOne({ where: { id_R, idU_cl, idU_SP } });

  if (!bookingRequest) {
    throw new Error('Booking request not found');
  }

  await bookingRequest.update({ status: 'rejected' });

  // Notify the client
  await createNotificationInternal(
    bookingRequest.idU_cl,
    'Booking Rejected',
    `Your booking request has been rejected by the provider.`,
    'booking'
  );
};

/**
 * Update booking status with notification
 */
export const updateBookingStatusService = async (
  id_B: number, idU_cl: number, idU_SP: number,
  status: string
): Promise<Booking> => {
  const booking = await Booking.findOne({ where: { id_B, idU_cl, idU_SP } });

  if (!booking) {
    throw new Error('Booking not found');
  }

  await booking.update({ status });

  // Notify relevant parties
  let notificationTitle = '';
  let notificationMessage = '';

  switch (status) {
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
    await createNotificationInternal(
      booking.idU_cl,
      notificationTitle,
      notificationMessage,
      'booking'
    );
  }

  return booking;
};
