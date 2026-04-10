import { Router, Response, NextFunction } from "express";
import { AuthRequest } from "../../types/express";
import { authenticateToken } from "../middleware/auth";
import { tenantGuard, requireRole } from "../middleware/tenant";
import { stripe } from "../lib/stripe";
import { prisma } from "../lib/prisma";

const router = Router();

// POST /api/stripe/create-checkout-session
// Usado pela tela de Settings para o dono assinar ou trocar de plano
router.post("/create-checkout-session", authenticateToken, tenantGuard, requireRole(["OWNER"]), async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId;

  try {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ error: "Barbearia não encontrada" });

    const origin = req.headers.origin || process.env.APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: "BarberPro — Plano Premium",
              description: "Assinatura mensal do sistema de gestão para barbearias.",
            },
            unit_amount: 7990, // R$ 79,90
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/configuracoes?success=true`,
      cancel_url: `${origin}/configuracoes?canceled=true`,
      client_reference_id: tenantId,
      customer_email: req.user.email,
    });

    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
});

export default router;