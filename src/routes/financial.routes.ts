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
const createTransactionSchema = z.object({
  description: z.string().min(2),
  amount: z.number().positive(),
  type: z.enum(["INCOME", "EXPENSE"]),
});

// -------------------------------------------------------------
// ROTAS FINANCEIRAS
// -------------------------------------------------------------
router.get(
  "/transactions",
  authenticateToken,
  tenantGuard,
  requireRole(["OWNER", "MANAGER"]),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const tenantId = req.tenantId as string;

    try {
      const transactions = await prisma.financialTransaction.findMany({
        where: { tenantId },
        orderBy: { date: "desc" },
      });

      res.json(transactions);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/transactions",
  authenticateToken,
  tenantGuard,
  requireRole(["OWNER", "MANAGER"]),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const tenantId = req.tenantId as string;

    const result = createTransactionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }

    const { description, amount, type } = result.data;

    try {
      const transaction = await prisma.financialTransaction.create({
        data: { description, amount, type, tenantId },
      });

      res.json(transaction);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/transactions/:id",
  authenticateToken,
  tenantGuard,
  requireRole(["OWNER", "MANAGER"]),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const tenantId = req.tenantId as string;

    try {
      const transaction = await prisma.financialTransaction.findFirst({
        where: { id, tenantId },
      });

      if (!transaction) {
        return res.status(404).json({ error: "Transação não encontrada" });
      }

      await prisma.financialTransaction.delete({
        where: { id },
      });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

export default router;