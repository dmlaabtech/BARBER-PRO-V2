import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../../types/express";
import { authenticateToken } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

const readNotificationSchema = z.object({
  id: z.string().uuid(),
});

// GET /api/notifications
router.get("/", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { tenantId: req.user.tenantId },
          { userId: req.user.id }
        ]
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

// POST /api/notifications/read
router.post("/read", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  const result = readNotificationSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten() });

  const { id } = result.data;
  try {
    await prisma.notification.update({
      where: { id },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;