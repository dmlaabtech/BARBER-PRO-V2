import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type Stripe from "stripe"; // Mantido apenas como TYPE para o webhook

// --- IMPORTAÇÃO DOS NOSSOS NOVOS MÓDULOS DE ROTAS ---
import authRoutes from "./src/routes/auth.routes";
import appointmentsRoutes from "./src/routes/appointments.routes";
import clientsRoutes from "./src/routes/clients.routes";
import barbersRoutes from "./src/routes/barbers.routes";
import servicesRoutes from "./src/routes/services.routes";
import productsRoutes from "./src/routes/products.routes";
import salesRoutes from "./src/routes/sales.routes";
import financialRoutes from "./src/routes/financial.routes";
import notificationsRoutes from "./src/routes/notifications.routes";
import superRoutes from "./src/routes/super.routes";
import plansRoutes from "./src/routes/plans.routes";
import publicRoutes from "./src/routes/public.routes";
import dashboardRoutes from "./src/routes/dashboard.routes";
import tenantRoutes from "./src/routes/tenant.routes";
import stripeRoutes from "./src/routes/stripe.routes";

import { stripe } from "./src/lib/stripe";
import { prisma } from "./src/lib/prisma";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // --- SEGURANÇA GLOBAL ---
  app.use(helmet({ contentSecurityPolicy: false }));
  
  // O Webhook do Stripe precisa do 'raw' body, então pomos isto ANTES do express.json()
  app.post("/api/webhooks/stripe", express.raw({ type: 'application/json' }), async (req: Request, res: Response, next: NextFunction) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
      if (endpointSecret && sig) {
        event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret);
      } else {
        event = JSON.parse(req.body.toString());
      }
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.client_reference_id && session.subscription) {
          await prisma.tenant.update({
            where: { id: session.client_reference_id },
            data: {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              planStatus: 'ACTIVE'
            }
          });
        }
      }
      res.send();
    } catch (error) {
      next(error);
    }
  });

  // Limite de payload e de acessos
  app.use(express.json({ limit: '10kb' }));
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 150,
    message: { error: "Muitas requisições. Tente novamente mais tarde." }
  });
  app.use("/api/", apiLimiter);

  // --- REGISTO DOS MÓDULOS DE ROTAS ---
  app.use("/api/auth", authRoutes);
  app.use("/api/appointments", appointmentsRoutes);
  app.use("/api/clients", clientsRoutes);
  app.use("/api/barbers", barbersRoutes);
  app.use("/api/services", servicesRoutes);
  app.use("/api/products", productsRoutes);
  app.use("/api/sales", salesRoutes);
  app.use("/api/financial", financialRoutes);
  app.use("/api/notifications", notificationsRoutes);
  app.use("/api/super", superRoutes);
  app.use("/api/plans", plansRoutes);
  app.use("/api/public", publicRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/tenant", tenantRoutes);
  app.use("/api/stripe", stripeRoutes);

  // --- TRATAMENTO GLOBAL DE ERROS ---
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Erro Global:", err.stack);
    res.status(500).json({ error: "Ocorreu um erro interno. Nossa equipa foi notificada." });
  });

  // --- SERVIDOR FRONTEND (Vite / Produção) ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  // Só inicia o .listen() se NÃO estiver rodando na Vercel (modo local)
  if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Motor BarberPro a trabalhar lindamente na porta ${PORT}!`);
    });
  }

  return app; // Retornamos o app para a Vercel poder usá-lo
}

// Em vez de só chamar startServer(), nós a exportamos para a Vercel
export default startServer();