// ============================================================
// types.ts — aligned with family_care PostgreSQL schema
// ============================================================

// ── User & Auth ──────────────────────────────────────────────

export interface User {
  id: string;
  fname: string;
  lname: string;
  address?: string;
  phone_number?: string;
  profile_picture?: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  status: string;             // default: 'active'
  nbr_warning: number;        // default: 0
}

export interface Account {
  email: string;               // PK, FK → user.email
  password: string;
  status?: string;             // default: 'active'
  nbr_warning?: number;        // default: 0
  created_at?: string;
  updated_at?: string;
}

export interface Admin {
  idu_a: number;               // FK → user.id
}

export interface Client {
  idu_cl: number;              // FK → user.id
}

export interface ServiceProvider {
  idu_sp: number;              // FK → user.id
  bio?: string;
  years_of_exp?: number;       // default: 0
  work_outside_city?: boolean; // default: false
  work_late?: boolean;         // default: false
  rating?: number;             // default: 0
  review_count?: number;       // default: 0
  price_per_hour?: number;
  day_of_week?: string;
  start_time?: string;         // TIME
  end_time?: string;           // TIME
}

export interface ProviderAvailability {
  service_provider_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
}


// ── Services ─────────────────────────────────────────────────

export interface ServiceCategory {
  id_c: number;
  name: string;
  target_demographics?: string;
  policies?: string;
  icon?: string;
}

export interface Service {
  id_s: number;
  name: string;
  description?: string;
  base_price?: number;
  id_c?: number;               // FK → service_category.id_c
  category?: ServiceCategory;
}

/** Junction table: which services a provider offers */
export interface Providing {
  idu_sp: number;              // FK → service_provider.idu_sp
  id_s: number;                // FK → service.id_s
}

// ── Bookings ─────────────────────────────────────────────────

export interface BookingRequest {
  id_r: number;
  idu_cl: number;              // FK → client.idu_cl
  idu_sp: number;              // FK → service_provider.idu_sp
  date: string;                // DATE
  time: string;                // TIME
  duration?: string;           // INTERVAL
  status?: string;             // default: 'pending'
  service_id?: number;         // FK → service.id_s
}

export interface Booking {
  id_b: number;
  idu_cl: number;              // FK → client.idu_cl
  idu_sp: number;              // FK → service_provider.idu_sp
  date: string;                // DATE
  time: string;                // TIME
  address?: string;
  status?: string;             // default: 'confirmed'
}

export interface Task {
  idt: number;
  idu_cl: number;              // FK → client.idu_cl
  idu_sp: number;              // FK → service_provider.idu_sp
  name?: string;
  start_time?: string;         // TIMESTAMP
  end_time?: string;           // TIMESTAMP
  duration?: string;           // INTERVAL
  status?: string;             // default: 'not_started'
}

// ── Payments ─────────────────────────────────────────────────

export interface Payment {
  id_p: number;
  id_s?: number;               // FK → service.id_s
  amount: number;
  currency?: string;           // default: 'DZD'
  status?: string;             // default: 'unpaid'
  payment_method?: string;
  created_at?: string;
}

// ── Documents & Files ────────────────────────────────────────

export interface Document {
  id_doc: number;
  name?: string;
  link?: string;
  type?: string;
  width?: number;
  idu_sp?: number;             // FK → service_provider.idu_sp
  idu_cl?: number;             // FK → client.idu_cl
  id_user?: number;            // FK → user.id
}

export interface Specification {
  id_spec: number;
  url?: string;
  description?: string;
  id_doc?: number;             // FK → document.id_doc
}

export interface File {
  idf: number;
  url?: string;
  type?: string;
  idt?: number;                // FK → task.idt
  idu_cl?: number;             // FK → client.idu_cl
  idu_sp?: number;             // FK → service_provider.idu_sp
}

// ── Dependants ───────────────────────────────────────────────

export interface Dependant {
  id_dep: number;
  name?: string;
  date_of_birth?: string;      // DATE
  relationship?: string;
  id_u_cl?: number;            // FK → client.idu_cl
}

export interface DependantFile {
  id_dep: number;              // FK → dependant.id_dep
  link?: string;
  type?: string;
}

export interface MedicalInfo {
  id_dep: number;              // PK & FK → dependant.id_dep
  blood_type?: string;
  allergies?: string;
  medications?: string;
  conditions?: string;
}

// ── Social / Admin ───────────────────────────────────────────

export interface AuthorizedPerson {
  id_ap: number;
  name?: string;
  phone_number?: string;
  national_id?: string;
  id_u_cl?: number;            // FK → client.idu_cl
}

export interface InscriptionRequest {
  id_r: number;
  status?: string;             // default: 'pending'
  submitted_at?: string;
  id_user?: number;            // FK → user.id
  id_admin?: number;           // FK → admin.id_u_a
  bio?: string;
  years_of_exp?: number;
  price_per_hour?: number;
  work_late?: boolean;
  work_outside_city?: boolean;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
}

export interface Feedback {
  idu_cl: number;              // PK & FK → client.idu_cl
  idu_sp: number;              // PK & FK → service_provider.idu_sp
  overall_rating?: number;
  punctuality?: number;
  comment?: string;
  created_at?: string;
}

export interface Report {
  id_reporter: string;         // varchar (email or user id)
  id_reported: string;         // varchar (email or user id)
  reason?: string;
  description?: string;
  created_at?: string;
}

export interface Notification {
  id: number;
  user_id?: number;            // FK → user.id
  title: string;
  description?: string;
  type?: string;
  is_read?: boolean;           // default: false
  created_at?: string;
}
