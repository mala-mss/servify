import { Payment, Booking } from '../models';
import { sendPaymentNotification } from './notification.service';

/**
 * Create a new payment record
 */
export const createPayment = async (data: {
  booking_id: string;
  amount: number;
  payment_method: string;
  status?: 'pending' | 'paid' | 'failed' | 'refunded';
}): Promise<Payment> => {
  const payment = await Payment.create({
    ...data,
    status: data.status || 'pending',
  });

  // Get booking to find the client
  const booking = await Booking.findByPk(data.booking_id);
  if (booking) {
    await sendPaymentNotification(booking.client_id, payment.id, 'created');
  }

  return payment;
};

/**
 * Process payment completion
 */
export const completePayment = async (paymentId: string): Promise<Payment> => {
  const payment = await Payment.findByPk(paymentId);

  if (!payment) {
    throw new Error('Payment not found');
  }

  await payment.update({ status: 'paid' });

  // Get booking to find the client
  const booking = await Booking.findByPk(payment.booking_id);
  if (booking) {
    await sendPaymentNotification(booking.client_id, paymentId, 'completed');
  }

  return payment;
};

/**
 * Mark payment as failed
 */
export const failPayment = async (paymentId: string): Promise<Payment> => {
  const payment = await Payment.findByPk(paymentId);

  if (!payment) {
    throw new Error('Payment not found');
  }

  await payment.update({ status: 'failed' });

  // Get booking to find the client
  const booking = await Booking.findByPk(payment.booking_id);
  if (booking) {
    await sendPaymentNotification(booking.client_id, paymentId, 'failed');
  }

  return payment;
};

/**
 * Process refund
 */
export const refundPayment = async (paymentId: string): Promise<Payment> => {
  const payment = await Payment.findByPk(paymentId);

  if (!payment) {
    throw new Error('Payment not found');
  }

  if (payment.status !== 'paid') {
    throw new Error('Only paid payments can be refunded');
  }

  await payment.update({ status: 'refunded' });

  return payment;
};

/**
 * Get payment summary for a user
 */
export const getPaymentSummary = async (userId: string): Promise<{
  total: number;
  pending: number;
  paid: number;
  refunded: number;
  count: number;
}> => {
  // Get all bookings for this client
  const clientBookings = await Booking.findAll({
    where: { client_id: userId },
    attributes: ['id'],
  });

  const bookingIds = clientBookings.map((b: any) => b.id);

  const payments = await Payment.findAll({
    where: { booking_id: bookingIds },
  });

  const total = payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
  const pending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
  const paid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
  const refunded = payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

  return {
    total,
    pending,
    paid,
    refunded,
    count: payments.length,
  };
};

/**
 * Get provider earnings
 */
export const getProviderEarnings = async (providerId: string): Promise<{
  total: number;
  pending: number;
  completed: number;
}> => {
  // Get all bookings for this provider
  const providerBookings = await Booking.findAll({
    where: { service_provider_id: providerId },
    attributes: ['id', 'status', 'total_price'],
  });

  const total = providerBookings.reduce((sum, b) => sum + parseFloat(b.total_price?.toString() || '0'), 0);
  const pending = providerBookings
    .filter(b => b.status === 'pending' || b.status === 'confirmed')
    .reduce((sum, b) => sum + parseFloat(b.total_price?.toString() || '0'), 0);
  const completed = providerBookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + parseFloat(b.total_price?.toString() || '0'), 0);

  return { total, pending, completed };
};
