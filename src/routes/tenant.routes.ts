import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../../types/express";
import { authenticateToken } from "../middleware/auth";
import { tenantGuard, requireRole } from "../middleware/tenant";
import { prisma } from "../lib/prisma";

const router = Router();

const updateTenantSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens").optional(),
  phone: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  backgroundUrl: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

router.put("/", authenticateToken, tenantGuard, requireRole(["OWNER", "MANAGER"]), async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId;

  const result = updateTenantSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten() });

  try {
    // Se o slug mudou, verifica se já está em uso por outro tenant
    if (result.data.slug) {
      const existing = await prisma.tenant.findUnique({
        where: { slug: result.data.slug },
      });
      if (existing && existing.id !== tenantId) {
        return res.status(409).json({ error: "Este link (slug) já está sendo usado por outra barbearia." });
      }
    }

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: result.data,
    });

    res.json(tenant);
  } catch (error) {
    next(error);
  }
});

export default router;