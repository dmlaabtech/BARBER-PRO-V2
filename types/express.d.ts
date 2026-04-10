import { Request } from 'express';

// Use este tipo em rotas públicas (sem autenticação)
export interface AppRequest extends Request {
  tenantId?: string;
}

// Use este tipo em rotas protegidas (após authenticateToken)
export interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
    tenantId: string;
  };
  tenantId: string;
}