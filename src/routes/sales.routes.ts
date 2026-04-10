import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../../types/express";
import { authenticateToken } from "../middleware/auth.js";
import { tenantGuard } from "../middleware/tenant.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

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

router.post("/", authenticateToken, tenantGuard, async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId as string;
  const result = createSaleSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten() });

  const { total, paymentType, clientId, items } = result.data;

  try {
    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          total,
          paymentType,
          clientId,
          tenantId,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { client: true, items: true },
      });

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
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          throw new Error(`Estoque insuficiente para o produto: ${product?.name ?? item.productId}`);
        }
      }

      await tx.financialTransaction.create({
        data: {
          description: `Venda de Balcão #${newSale.id.slice(0, 8)}`,
          amount: total,
          type: "INCOME",
          tenantId,
        },
      });

      return newSale;
    });

    res.json(sale);
  } catch (error: any) {
    if (error.message?.startsWith("Estoque insuficiente")) {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
});

router.delete("/:id", authenticateToken, tenantGuard, async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const tenantId = req.tenantId as string;
  try {
    const sale = await prisma.sale.findFirst({ where: { id, tenantId } });
    if (!sale) return res.status(404).json({ error: "Venda não encontrada" });

    await prisma.sale.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
