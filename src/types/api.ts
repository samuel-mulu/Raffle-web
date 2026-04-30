export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  DRAWN = 'DRAWN',
  CANCELLED = 'CANCELLED',
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
}

export interface Campaign {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  ticketPrice: number;
  totalTickets: number;
  status: CampaignStatus;
  drawAt?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
