import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../../types/express";
import { authenticateToken } from "../middleware/auth";
import { tenantGuard } from "../middleware/tenant";
import { prisma } from "../lib/prisma";

const router = Router();

// -------------------------------------------------------------
// VALIDAÇÕES
// -------------------------------------------------------------
const createSaleSchema = z.object({
  total: z.number().positive(),
  paymentType: z.enum(["CASH", "PIX", "CREDIT", "DEBIT"]),
  clientId: z.string().optional().nullable(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().positive(),
    price: z.number().min(0),
  })).min(1, "A venda deve conter pelo menos um item."),
});

// -------------------------------------------------------------
// ROTAS DE VENDAS
// -------------------------------------------------------------

// GET /api/sales
router.get("/", authenticateToken, tenantGuard, async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId as string;
  try {
    const sales = await prisma.sale.findMany({
      where: { tenantId },
      include: { client: true, items: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(sales);
  } catch (error) {
    next(error);
  }
});

// POST /api/sales - Processar Venda
router.post("/", authenticateToken, tenantGuard, async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId as string;

  const result = createSaleSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten() });

  const { total, paymentType, clientId, items } = result.data;

  try {
    const sale = await prisma.$transaction(async (tx) => {
      // 1. Cria a venda
      const newSale = await tx.sale.create({
        data: {
          total,
          paymentType,
          clientId,
          tenantId,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            }))
          }
        },
        include: { client: true, items: true }
      });

      // 2. Reduz o estoque dos produtos vendidos validando concorrência
      for (const item of items) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            tenantId,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });
      
        if (updated.count === 0) {
          // Busca o produto para dar uma mensagem útil
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          throw new Error(`Estoque insuficiente para o produto: ${product?.name ?? item.productId}`);
        }
      }

      // 3. Regista a entrada financeira
      await tx.financialTransaction.create({
        data: {
          description: `Venda de Balcão #${newSale.id.slice(0, 8)}`,
          amount: total,
          type: "INCOME",
          tenantId,
        }
      });

      return newSale;
    });

    res.json(sale);
  } catch (error: any) {
    if (error.message?.startsWith('Estoque insuficiente')) {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
});

// DELETE /api/sales/:id
router.delete("/:id", authenticateToken, tenantGuard, async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const tenantId = req.tenantId as string;
  try {
    await prisma.sale.delete({
      where: { id, tenantId }
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;