// ============================================================
// backend/src/types.ts — mirrors family_care PostgreSQL schema
// ============================================================

export interface User {
  id: number;
  fname: string;
  lname: string;
  address?: string;
  phone_number?: string;
  profile_picture?: string;
  email: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Account {
  email: string;
  password: string;
  status?: string;       // default: 'active'
  nbr_warning?: number;  // default: 0
  created_at?: Date;
  updated_at?: Date;
}

export interface Admin {
  idu_a: number;
}

export interface Client {
  idu_cl: number;
}

export interface ServiceProvider {
  idu_sp: number;
  bio?: string;
  years_of_exp?: number;
  work_outside_city?: boolean;
  work_late?: boolean;
  rating?: number;
  review_count?: number;
  price_per_hour?: number;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
}

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
  id_c?: number;
}

export interface Providing {
  idu_sp: number;
  id_s: number;
}

export interface BookingRequest {
  id_r: number;
  idu_cl: number;
  idu_sp: number;
  date: string;
  time: string;
  duration?: string;
  status?: string;       // default: 'pending'
  service_id?: number;
}

export interface Booking {
  id_b: number;
  idu_cl: number;
  idu_sp: number;
  date: string;
  time: string;
  address?: string;
  status?: string;       // default: 'confirmed'
}

export interface Task {
  idt: number;
  idu_cl: number;
  idu_sp: number;
  name?: string;
  start_time?: string;
  end_time?: string;
  duration?: string;
  status?: string;       // default: 'not_started'
}

export interface Payment {
  id_p: number;
  id_s?: number;
  amount: number;
  currency?: string;     // default: 'DZD'
  status?: string;       // default: 'unpaid'
  payment_method?: string;
  created_at?: Date;
}

export interface Document {
  id_doc: number;
  name?: string;
  link?: string;
  type?: string;
  width?: number;
  idu_sp?: number;
  idu_cl?: number;
}

export interface Specification {
  id_spec: number;
  url?: string;
  description?: string;
  id_doc?: number;
}

export interface File {
  idf: number;
  url?: string;
  type?: string;
  idt?: number;
  idu_cl?: number;
  idu_sp?: number;
}

export interface Dependant {
  id_dep: number;
  name?: string;
  date_of_birth?: string;
  relationship?: string;
  id_u_cl?: number;
}

export interface DependantFile {
  id_dep: number;
  link?: string;
  type?: string;
}

export interface MedicalInfo {
  id_dep: number;
  blood_type?: string;
  allergies?: string;
  medications?: string;
  conditions?: string;
}

export interface AuthorizedPerson {
  id_ap: number;
  name?: string;
  phone_number?: string;
  national_id?: string;
  id_u_cl?: number;
}

export interface InscriptionRequest {
  id_r: number;
  status?: string;       // default: 'pending'
  submitted_at?: Date;
  id_u_sp?: number;
}

export interface Feedback {
  idu_cl: number;
  idu_sp: number;
  overall_rating?: number;
  punctuality?: number;
  comment?: string;
  created_at?: Date;
}

export interface Report {
  id_reporter: string;
  id_reported: string;
  reason?: string;
  description?: string;
  created_at?: Date;
}

export interface Notification {
  id: number;
  user_id?: number;
  title: string;
  description?: string;
  type?: string;
  is_read?: boolean;     // default: false
  created_at?: Date;
}