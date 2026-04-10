import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type Stripe from "stripe";

// --- IMPORTAÇÃO DOS MÓDULOS DE ROTAS (Com extensão .js para Vercel ESM) ---
import authRoutes from "./src/routes/auth.routes.js";
import appointmentsRoutes from "./src/routes/appointments.routes.js";
import clientsRoutes from "./src/routes/clients.routes.js";
import barbersRoutes from "./src/routes/barbers.routes.js";
import servicesRoutes from "./src/routes/services.routes.js";
import productsRoutes from "./src/routes/products.routes.js";
import salesRoutes from "./src/routes/sales.routes.js";
import financialRoutes from "./src/routes/financial.routes.js";
import notificationsRoutes from "./src/routes/notifications.routes.js";
import superRoutes from "./src/routes/super.routes.js";
import plansRoutes from "./src/routes/plans.routes.js";
import publicRoutes from "./src/routes/public.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";
import tenantRoutes from "./src/routes/tenant.routes.js";
import stripeRoutes from "./src/routes/stripe.routes.js";

import { stripe } from "./src/lib/stripe.js";
import { prisma } from "./src/lib/prisma.js";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(helmet({ contentSecurityPolicy: false }));

  // Webhook do Stripe (Deve vir antes do express.json)
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

  app.use(express.json({ limit: '10kb' }));
  
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 150,
    message: { error: "Muitas requisições. Tente novamente mais tarde." }
  });
  app.use("/api/", apiLimiter);

  // --- REGISTRO DAS ROTAS ---
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

  // Erros Globais
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Erro Global:", err.stack);
    res.status(500).json({ error: "Ocorreu um erro interno no servidor." });
  });

  // Frontend (Vite no Dev, Estático na Produção)
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  return app;
}

// Ponte para Serverless Vercel
const appPromise = startServer();

export default async function handler(req: any, res: any) {
  const app = await appPromise;
  app(req, res);
}

// Inicia servidor local em desenvolvimento
if (process.env.NODE_ENV !== "production") {
  startServer().then((app) => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 BarberPro rodando localmente em http://localhost:${PORT}`);
    });
  });
}