import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { stripe } from "../lib/stripe";

const router = Router();
const APP_URL = process.env.APP_URL || "http://localhost:3000";

const checkoutSchema = z.object({
  planId: z.string().min(1),
  email: z.string().email(),
  returnUrl: z.string().url().optional(),
});

// GET /api/plans — somente leitura
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await prisma.plan.findMany();
    res.json(plans);
  } catch (error) { next(error); }
});

// POST /api/plans/checkout
router.post("/checkout", async (req: Request, res: Response, next: NextFunction) => {
  const result = checkoutSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten() });

  const { planId, email, returnUrl } = result.data;
  const baseUrl = returnUrl || APP_URL;

  try {
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) return res.status(404).json({ error: "Plano não encontrado" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "brl",
          product_data: { name: `BarberPro - Plano ${plan.name}` },
          unit_amount: Math.round(Number(plan.price) * 100),
          recurring: { interval: "month" },
        },
        quantity: 1,
      }],
      mode: "subscription",
      success_url: `${baseUrl}/register?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      customer_email: email,
    });

    await prisma.pendingRegistration.create({
      data: { stripeSessionId: session.id, email, planId }
    });

    res.json({ url: session.url });
  } catch (error) { next(error); }
});

// GET /api/plans/verify-session/:sessionId
router.get("/verify-session/:sessionId", async (req: Request, res: Response, next: NextFunction) => {
  const { sessionId } = req.params;
  try {
    const pending = await prisma.pendingRegistration.findUnique({
      where: { stripeSessionId: sessionId }
    });
    if (!pending || pending.used) {
      return res.status(400).json({ error: "Sessão inválida ou já utilizada" });
    }
    res.json({ valid: true, email: pending.email });
  } catch (error) { next(error); }
});

export default router;