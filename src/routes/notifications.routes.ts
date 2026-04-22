import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../../types/express";
import { authenticateToken } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";




const router = Router();

// -------------------------------------------------------------
// VALIDAÇÕES
// -------------------------------------------------------------
const markReadSchema = z.object({
  notificationId: z.string().min(1),
});

// -------------------------------------------------------------
// ROTAS DE NOTIFICAÇÕES
// -------------------------------------------------------------

// GET /api/notifications - Listar notificações do tenant
router.get(
  "/",
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const tenantId = req.user?.tenantId as string;

    try {
      const notifications = await prisma.notification.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/notifications/read - Marcar como lida
router.patch(
  "/read",
  authenticateToken,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const result = markReadSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }

    const { notificationId } = result.data;
    const tenantId = req.user?.tenantId as string;

    try {
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          tenantId,
        },
      });

      if (!notification) {
        return res.status(404).json({ error: "Notificação não encontrada" });
      }

      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
