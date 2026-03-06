// ─── Enums / Literals ────────────────────────────────────────────────────────
export type Role = 'DONNEUR' | 'VALIDATEUR' | 'PARTENAIRE' | 'ADMIN';
export type NeedStatus = 'PENDING' | 'OPEN' | 'FUNDED' | 'DELIVERING' | 'CONFIRMED';
export type BusinessType = 'RESTAURANT' | 'ONG' | 'AUTRE';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  email: string;
  role: Role;
  token: string;
  nom?: string;
  prenom?: string;
  business_name?: string;
  business_type?: BusinessType;
  address?: string;
  description?: string;
}

export type AuthState = Omit<AuthUser, 'token'>;

// ─── Validator / Partner ——————————————————————————————————————————————————————
export interface Validateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  score?: number;
}

export interface Partenaire {
  id: string;
  business_name: string;
  business_type: BusinessType;
  email: string;
  address?: string;
  description?: string;
}

// ─── Need ─────────────────────────────────────────────────────────────────────
export interface Need {
  id: string;
  title: string;
  description: string;
  amount: number;
  amountRaised?: number;
  status: NeedStatus;
  approxLat: number;
  approxLng: number;
  createdAt: string;
  validateur?: Validateur;
  partenaire?: Partenaire;
  city?: string;
}

export interface NeedCreateRequest {
  title: string;
  beneficiary_name: string;
  phone_beneficiary: string;
  email_beneficiary: string;
  description: string;
  approxLat: number;
  approxLng: number;
  exactLat: number;
  exactLng: number;
  email_partenaire: string;
  amount?: number;
}

// ─── Proof ────────────────────────────────────────────────────────────────────
export interface Proof {
  id: string;
  needId: string;
  donneurId: string;
  amount: number;
  createdAt: string;
  need?: Need;
}

export interface ProofCreateRequest {
  needId: string;
  amount: number;
}

// ─── Notifications ────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

// ─── Generic API wrappers ─────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}
