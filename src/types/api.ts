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
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export enum TicketStatus {
  RESERVED = 'RESERVED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  WINNER = 'WINNER',
}

export interface User {
  id: string;
  phone: string;
  role: Role;
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
  creator?: {
    id: string;
    name?: string;
    avatarUrl?: string;
    phone?: string;
    bio?: string;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
