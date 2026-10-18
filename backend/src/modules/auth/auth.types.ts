import type { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
}

export interface AuthenticatedRequest extends Request {
  authenticatedUser?: AuthenticatedUser;
  shopperId?: string;
  adminId?: string;
}

export interface ShopperRequest extends AuthenticatedRequest {
  shopperId: string;
}

export interface AdminRequest extends AuthenticatedRequest {
  adminId: string;
}
