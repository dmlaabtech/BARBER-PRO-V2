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
const createServiceSchema = z.object({
  name: z.string().min(2),
  price: z.number().min(0),
  duration: z.number().min(1), // duração em minutos
  description: z.string().optional(),
});

// -------------------------------------------------------------
// ROTAS DE SERVIÇOS
// -------------------------------------------------------------

// GET /api/services - Listar serviços
router.get("/", authenticateToken, tenantGuard, async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId as string;
  try {
    const services = await prisma.service.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
    });
    res.json(services);
  } catch (error) {
    next(error);
  }
});

// POST /api/services - Criar serviço
router.post("/", authenticateToken, tenantGuard, requireRole(['OWNER', 'MANAGER']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId as string;

  const result = createServiceSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten() });

  const { name, price, duration, description } = result.data;
  try {
    const service = await prisma.service.create({
      data: { name, price, duration, description, tenantId }
    });
    res.json(service);
  } catch (error) {
    next(error);
  }
});

// Nota de correção: Caso exista um endpoint DELETE futuramente ou no seu arquivo, 
// basta inserir a mesma função `requireRole(['OWNER', 'MANAGER'])`
export default router;