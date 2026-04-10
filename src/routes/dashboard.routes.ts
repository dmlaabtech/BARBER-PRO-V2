import { Router, Response, NextFunction } from "express";
import { AuthRequest } from "../../types/express";
import { authenticateToken } from "../middleware/auth";
import { tenantGuard } from "../middleware/tenant";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/stats", authenticateToken, tenantGuard, async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId as string;
  try {
    const [appointmentsCount, clientsCount, salesRevenue, appointmentsRevenue, barbers] =
      await Promise.all([
        prisma.appointment.count({ where: { tenantId, status: "COMPLETED" } }),
        prisma.client.count({ where: { tenantId } }),
        prisma.sale.aggregate({ where: { tenantId }, _sum: { total: true } }),
        prisma.appointment.aggregate({
          where: { tenantId, status: "COMPLETED" },
          _sum: { totalPrice: true },
        }),
        prisma.barber.findMany({
          where: { tenantId },
          include: { appointments: { where: { status: "COMPLETED" } } },
        }),
      ]);

    const totalRevenue =
      (Number(salesRevenue._sum.total) || 0) +
      (Number(appointmentsRevenue._sum.totalPrice) || 0);

    const revenueByBarber = barbers
      .map((barber) => ({
        name: barber.name,
        revenue: barber.appointments.reduce((sum, app) => sum + Number(app.totalPrice), 0),
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        name: d.toLocaleDateString("pt-BR", { weekday: "short" }),
        revenue: 0,
      };
    });

    res.json({
      appointmentsCount,
      clientsCount,
      revenue: totalRevenue,
      revenueByBarber,
      revenueByDay: last7Days,
    });
  } catch (error) {
    next(error);
  }
});

export default router;