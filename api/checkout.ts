import { prisma } from "../src/lib/prisma";
import Stripe from "stripe";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "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";
const stripe = new Stripe(STRIPE_KEY);
const APP_URL = process.env.APP_URL || "http://localhost:3000";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { planId, email, returnUrl } = req.body;
  const baseUrl = returnUrl || APP_URL;
  
  try {
    if (!stripe) {
      // Modo de Teste/Demo sem Stripe
      const sessionId = `demo_session_${Math.random().toString(36).substr(2, 9)}`;
      await prisma.pendingRegistration.create({
        data: {
          stripeSessionId: sessionId,
          email,
          planId,
        }
      });
      return res.json({ url: `${baseUrl}/register?session_id=${sessionId}` });
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) return res.status(404).json({ error: "Plano não encontrado" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `BarberPro by DM LABTECH - Plano ${plan.name}`,
            },
            unit_amount: Math.round(Number(plan.price) * 100),
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/register?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      customer_email: email,
    });

    // Salva a sessão pendente
    await prisma.pendingRegistration.create({
      data: {
        stripeSessionId: session.id,
        email,
        planId,
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar sessão de checkout" });
  }
}
