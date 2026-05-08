import { query } from '../db';
import type { Payment } from '../types';
import { sendPaymentNotification } from './notification.service';

// ── Helpers ───────────────────────────────────────────────────

/** Fetch a payment row by id_p, throws if not found */
const findPaymentById = async (paymentId: number): Promise<Payment> => {
  const result = await query(
    'SELECT * FROM payment WHERE id_p = $1',
    [paymentId]
  );
  if (result.rows.length === 0) throw new Error('Payment not found');
  return result.rows[0];
};

// ── NOTE on schema ────────────────────────────────────────────
// payment(id_p, id_s, amount, currency, status, payment_method, created_at)
// payment links to service (id_s), NOT to booking directly.
// To notify a client we resolve: payment → service → booking_request → client
// Status values in DB: 'unpaid' | 'paid'  (no 'pending'/'failed'/'refunded')

const resolveClientForService = async (id_s: number): Promise<number | null> => {
  const result = await query(
    `SELECT br.idu_cl
     FROM booking_request br
     WHERE br.service_id = $1
     ORDER BY br.id_r DESC
     LIMIT 1`,
    [id_s]
  );
  return result.rows[0]?.idu_cl ?? null;
};

// ── Service functions ─────────────────────────────────────────

export const createPayment = async (data: {
  id_s?: number;
  amount: number;
  payment_method?: string;
  status?: string;        // 'unpaid' | 'paid'
}): Promise<Payment> => {
  const result = await query(
    `INSERT INTO payment (id_s, amount, payment_method, status)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.id_s ?? null, data.amount, data.payment_method ?? null, data.status ?? 'unpaid']
  );

  const payment: Payment = result.rows[0];

  if (data.id_s) {
    const clientId = await resolveClientForService(data.id_s);
    if (clientId) await sendPaymentNotification(clientId, payment.id_p, 'created');
  }

  return payment;
};

export const completePayment = async (paymentId: number): Promise<Payment> => {
  const payment = await findPaymentById(paymentId);

  const result = await query(
    `UPDATE payment SET status = 'paid' WHERE id_p = $1 RETURNING *`,
    [paymentId]
  );
  const updated: Payment = result.rows[0];

  if (payment.id_s) {
    const clientId = await resolveClientForService(payment.id_s);
    if (clientId) await sendPaymentNotification(clientId, paymentId, 'completed');
  }

  return updated;
};

export const failPayment = async (paymentId: number): Promise<Payment> => {
  await findPaymentById(paymentId);   // ensure exists
  const payment = await findPaymentById(paymentId);

  const result = await query(
    // 'unpaid' is the closest DB equivalent to a failed/unprocessed state
    `UPDATE payment SET status = 'unpaid' WHERE id_p = $1 RETURNING *`,
    [paymentId]
  );
  const updated: Payment = result.rows[0];

  if (payment.id_s) {
    const clientId = await resolveClientForService(payment.id_s);
    if (clientId) await sendPaymentNotification(clientId, paymentId, 'failed');
  }

  return updated;
};

// ── Summary for a client ──────────────────────────────────────

export const getPaymentSummary = async (clientId: number): Promise<{
  total: number;
  paid: number;
  unpaid: number;
  count: number;
  currency: string;
}> => {
  const result = await query(
    `SELECT
       COUNT(*)                                                      AS count,
       COALESCE(SUM(p.amount), 0)                                   AS total,
       COALESCE(SUM(CASE WHEN p.status = 'paid'   THEN p.amount ELSE 0 END), 0) AS paid,
       COALESCE(SUM(CASE WHEN p.status = 'unpaid' THEN p.amount ELSE 0 END), 0) AS unpaid
     FROM payment p
     JOIN booking_request br ON br.service_id = p.id_s AND br.idu_cl = $1`,
    [clientId]
  );

  const row = result.rows[0];
  return {
    count   : parseInt(row.count, 10),
    total   : parseFloat(row.total),
    paid    : parseFloat(row.paid),
    unpaid  : parseFloat(row.unpaid),
    currency: 'DZD',
  };
};

// ── Earnings for a provider ───────────────────────────────────

export const getProviderEarnings = async (providerId: number): Promise<{
  total: number;
  paid: number;
  unpaid: number;
  month: number;
  month_jobs: number;
  currency: string;
}> => {
  const result = await query(
    `SELECT
       COALESCE(SUM(p.amount), 0)                                        AS total,
       COALESCE(SUM(CASE WHEN p.status = 'paid'   THEN p.amount ELSE 0 END), 0) AS paid,
       COALESCE(SUM(CASE WHEN p.status = 'unpaid' THEN p.amount ELSE 0 END), 0) AS unpaid,
       COALESCE(SUM(CASE WHEN DATE_TRUNC('month', p.created_at) = DATE_TRUNC('month', NOW())
                         THEN p.amount ELSE 0 END), 0)                    AS month,
       COUNT(CASE WHEN DATE_TRUNC('month', b.date::timestamp) = DATE_TRUNC('month', NOW())
                  THEN 1 END)                                             AS month_jobs
     FROM payment p
     JOIN booking_request br ON br.service_id = p.id_s AND br.idu_sp = $1
     JOIN booking b          ON b.idu_sp = br.idu_sp AND b.idu_cl = br.idu_cl`,
    [providerId]
  );

  const row = result.rows[0];
  return {
    total      : parseFloat(row.total),
    paid       : parseFloat(row.paid),
    unpaid     : parseFloat(row.unpaid),
    month      : parseFloat(row.month),
    month_jobs : parseInt(row.month_jobs, 10),
    currency   : 'DZD',
  };
};