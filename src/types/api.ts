export enum Role {
  USER = 'USER',
  CREATOR = 'CREATOR',
  ADMIN = 'ADMIN',
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  DRAWN = 'DRAWN',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export enum TicketStatus {
  RESERVED = 'RESERVED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  WINNER = 'WINNER',
}

export interface User {
  id: string;
  phone: string;
  role: Role;
  roleLabel: string;
  landingPath: string;
  name?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface Campaign {
  id: string;
  creatorId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  ticketPrice: number;
  totalTickets: number;
  status: CampaignStatus;
  drawAt?: string;
  createdAt: string;
  liveLinks?: {
    youtube?: string;
    facebook?: string;
  };
  creator?: {
    id: string;
    name?: string;
    avatarUrl?: string;
    phone?: string;
    bio?: string;
  };
  _count?: {
    tickets: number;
    payments: number;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface CampaignStats {
  campaignId: string;
  title?: string;
  status?: CampaignStatus;
  totalTickets: number;
  sold?: number;
  taken: number;
  remaining: number;
  expiredReservations?: number;
  counts: Record<string, number>;
  paymentCounts?: Record<string, number>;
}

export interface CampaignBuyerItem {
  id: string;
  ticketNumber: number;
  ticketStatus: TicketStatus;
  reservedUntil?: string | null;
  paidAt?: string | null;
  createdAt: string;
  payment?: {
    id: string;
    status: string;
    amount: number;
    transactionId?: string | null;
    proofUrl?: string | null;
    approvedAt?: string | null;
  } | null;
  buyer?: {
    id: string;
    name?: string | null;
    avatarUrl?: string | null;
    phone: string;
  } | null;
  winner?: {
    prizeRank: number;
  } | null;
}

export interface CampaignBuyerListResponse {
  campaignId: string;
  page: number;
  pageSize: number;
  total: number;
  summary: CampaignStats;
  items: CampaignBuyerItem[];
}

export interface ImportPreviewRow {
  buyerName: string | null;
  buyerPhone: string | null;
  ticketNumber: string | null;
  ticketStatus: string | null;
  paymentStatus: string | null;
}

export interface ImportPreviewResponse {
  source: 'csv' | 'xlsx';
  columns: string[];
  rows: ImportPreviewRow[];
  truncated: boolean;
}

export interface AdminUserListItem {
  id: string;
  phone: string;
  name?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  role: Role;
  createdAt: string;
  _count: {
    campaigns: number;
    tickets: number;
    payments: number;
  };
}
