import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../../types/express";
import { authenticateToken } from "../middleware/auth.js"
import { tenantGuard, requireRole } from "../middleware/tenant.js"
import { prisma } from "../lib/prisma";

const router = Router();

// -------------------------------------------------------------
// VALIDAÇÕES
// -------------------------------------------------------------
const createClientSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal('')),
  cpf: z.string().optional().or(z.literal('')),
});

// -------------------------------------------------------------
// ROTAS DE CLIENTES
// -------------------------------------------------------------

// GET /api/clients - Listar todos os clientes
router.get("/", authenticateToken, tenantGuard, async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId as string;
  try {
    const clients = await prisma.client.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { appointments: true }
        }
      },
      orderBy: { name: "asc" },
    });
    res.json(clients);
  } catch (error) {
    next(error);
  }
});

// POST /api/clients - Criar novo cliente
router.post("/", authenticateToken, tenantGuard, requireRole(['OWNER', 'MANAGER', 'RECEPTIONIST']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId as string;

  const result = createClientSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten() });

  const { name, phone, email, cpf } = result.data;
  try {
    const client = await prisma.client.create({
      data: { name, phone, email, cpf, tenantId }
    });
    res.json(client);
  } catch (error) {
    next(error);
  }
});

export default router;