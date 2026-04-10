import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "barber-pro-secret-key";

export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

export const tenantGuard = (req: any, res: any, next: any) => {
  const tenantId = req.headers["x-tenant-id"];
  if (!tenantId || (req.user.role !== "SUPER_ADMIN" && req.user.tenantId !== tenantId)) {
    return res.status(403).json({ error: "Acesso negado ao tenant solicitado" });
  }
  req.tenantId = tenantId;
  next();
};
