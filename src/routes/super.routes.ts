import { Router, Response, NextFunction } from "express";
import { AuthRequest } from "../../types/express";
import { authenticateToken } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = Router();

const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user.role !== "SUPER_ADMIN") return res.sendStatus(403); 
  next();
};

router.get("/stats", authenticateToken, requireSuperAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [tenantsCount, usersCount, totalAppointments] = await Promise.all([
      prisma.tenant.count(), 
      prisma.user.count(),   
      prisma.appointment.count(), 
    ]);
    res.json({ tenantsCount, usersCount, totalAppointments });
  } catch (error) { next(error); }
});

router.get("/tenants", authenticateToken, requireSuperAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: { _count: { select: { users: true, barbers: true, appointments: true } } } 
    });
    res.json(tenants);
  } catch (error) { next(error); }
});

export default router;