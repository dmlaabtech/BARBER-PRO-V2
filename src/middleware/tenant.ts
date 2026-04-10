import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types/express";

export const tenantGuard = (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.headers["x-tenant-id"] as string;
  
  if (!tenantId || (req.user.role !== "SUPER_ADMIN" && req.user.tenantId !== tenantId)) {
    return res.status(403).json({ error: "Acesso negado ao tenant solicitado" });
  }
  
  req.tenantId = tenantId;
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Permissão insuficiente para esta ação." });
    }
    next();
  };
};