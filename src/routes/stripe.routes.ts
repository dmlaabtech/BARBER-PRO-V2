import { Router, Response, NextFunction } from "express";
import { AuthRequest } from "../../types/express";
import { authenticateToken } from "../middleware/auth.js";
import { tenantGuard, requireRole } from "../middleware/tenant.js";
import { getStripe } from "../lib/stripe.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

// -------------------------------------------------------------
// CRIAR CHECKOUT SESSION
// -------------------------------------------------------------
router.post(
  "/create-checkout-session",
  authenticateToken,
  tenantGuard,
  requireRole(["OWNER"]),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const tenantId = req.tenantId;

    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        return res.status(404).json({
          error: "Barbearia não encontrada",
        });
      }

      const origin =
        req.headers.origin ||
        process.env.APP_URL ||
        "http://localhost:3000";

      const stripe = getStripe();

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "brl",
              product_data: {
                name: "BarberPro V2 — Plano Premium",
                description:
                  "Acesso total à gestão de barbearia, estoque e financeiro.",
              },
              unit_amount: 7990,
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${origin}/configuracoes?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/configuracoes?canceled=true`,
        client_reference_id: tenantId,
        customer_email: req.user.email,
      });

      return res.json({
        url: session.url,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;