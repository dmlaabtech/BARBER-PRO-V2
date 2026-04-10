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
const createProductSchema = z.object({
  name: z.string().min(2),
  price: z.number().min(0),
  cost: z.number().min(0),
  stock: z.number().min(0),
  minStock: z.number().min(0),
  categoryId: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
});

// -------------------------------------------------------------
// ROTAS DE PRODUTOS
// -------------------------------------------------------------

// GET /api/products
router.get(
  "/",
  authenticateToken,
  tenantGuard,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const tenantId = req.tenantId as string;

    try {
      const products = await prisma.product.findMany({
        where: { tenantId },
        include: { category: true },
        orderBy: { name: "asc" },
      });

      res.json(products);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/products
router.post(
  "/",
  authenticateToken,
  tenantGuard,
  requireRole(["OWNER", "MANAGER"]),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const tenantId = req.tenantId as string;

    const result = createProductSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }

    const { name, price, cost, stock, minStock, categoryId, sku } = result.data;

    try {
      const product = await prisma.product.create({
        data: {
          name,
          price,
          cost,
          stock,
          minStock,
          categoryId,
          sku,
          tenantId,
        },
        include: { category: true },
      });

      res.json(product);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/products/:id
router.delete(
  "/:id",
  authenticateToken,
  tenantGuard,
  requireRole(["OWNER", "MANAGER"]),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const tenantId = req.tenantId as string;

    try {
      const product = await prisma.product.findFirst({
        where: { id, tenantId },
      });

      if (!product) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }

      await prisma.product.delete({
        where: { id },
      });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

export default router;