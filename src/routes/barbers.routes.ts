import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../../types/express";
import { authenticateToken } from "../middleware/auth.js";
import { tenantGuard, requireRole } from "../middleware/tenant.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

// -------------------------------------------------------------
// VALIDAÇÕES
// -------------------------------------------------------------
const createBarberSchema = z.object({
  name: z.string().min(2),
  commission: z.number().min(0).max(100),
  bio: z.string().optional(),
});

// -------------------------------------------------------------
// ROTAS DE BARBEIROS
// -------------------------------------------------------------

// GET /api/barbers - Listar todos os barbeiros
router.get("/", authenticateToken, tenantGuard, async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId as string;
  try {
    const barbers = await prisma.barber.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
    });
    res.json(barbers);
  } catch (error) {
    next(error);
  }
});

// POST /api/barbers - Criar novo barbeiro
router.post("/", authenticateToken, tenantGuard, requireRole(['OWNER', 'MANAGER']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId as string;

  const result = createBarberSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten() });

  const { name, commission, bio } = result.data;
  try {
    const barber = await prisma.barber.create({
      data: { name, commission, bio, tenantId }
    });
    res.json(barber);
  } catch (error) {
    next(error);
  }
});

export default router;