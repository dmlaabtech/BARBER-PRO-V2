import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../../types/express";
import { authenticateToken } from "../middleware/auth.js";
import { tenantGuard, requireRole } from "../middleware/tenant.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

const updateTenantSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  phone: z.string().optional(),
  logoUrl: z.string().optional(),
  backgroundUrl: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

router.put("/", authenticateToken, tenantGuard, requireRole(["OWNER", "MANAGER"]), async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId;
  const result = updateTenantSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() });
  }

  try {
    if (result.data.slug) {
      const existing = await prisma.tenant.findUnique({ where: { slug: result.data.slug } });
      if (existing && existing.id !== tenantId) {
        return res.status(409).json({ error: "Este endereço (slug) já está sendo usado por outra barbearia." });
      }
    }

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: result.data
    });

    res.json(tenant);
  } catch (error) {
    next(error);
  }
});

export default router;