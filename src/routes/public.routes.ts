import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const router = Router();

const bookingSchema = z.object({
  clientName: z.string().min(2),
  clientPhone: z.string().min(8),
  date: z.string().min(1),
  barberId: z.string().uuid(),
  serviceId: z.string().uuid(),
});

// GET /api/public/booking/:slug — dados públicos da barbearia
router.get("/booking/:slug", async (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params;
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      include: {
        services: { where: { active: true } },
        barbers: { where: { active: true } },
      }
    });
    if (!tenant) return res.status(404).json({ error: "Barbearia não encontrada" });
    res.json(tenant);
  } catch (error) { next(error); }
});

// GET /api/public/booking/:slug/availability — horários ocupados
router.get("/booking/:slug/availability", async (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params;
  const { date, barberId } = req.query;

  if (!date || !barberId) {
    return res.status(400).json({ error: "Data e barbeiro são obrigatórios" });
  }

  try {
    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) return res.status(404).json({ error: "Barbearia não encontrada" });

    const [year, month, day] = String(date).split("-").map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59);

    const appointments = await prisma.appointment.findMany({
      where: {
        tenantId: tenant.id,
        barberId: String(barberId),
        status: { notIn: ["CANCELED"] },
        date: { gte: startOfDay, lte: endOfDay },
      },
      select: { date: true },
    });

    const bookedTimes = appointments.map((app) =>
      app.date.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" })
    );

    res.json({ bookedTimes });
  } catch (error) { next(error); }
});

// POST /api/public/booking/:slug/appointment — criar agendamento público
router.post("/booking/:slug/appointment", async (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params;

  const result = bookingSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten() });

  const { clientName, clientPhone, date, barberId, serviceId } = result.data;

  try {
    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) return res.status(404).json({ error: "Barbearia não encontrada" });

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return res.status(404).json({ error: "Serviço não encontrado" });

    let client = await prisma.client.findFirst({
      where: { phone: clientPhone, tenantId: tenant.id }
    });

    if (!client) {
      client = await prisma.client.create({
        data: { name: clientName, phone: clientPhone, tenantId: tenant.id }
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        clientId: client.id,
        barberId,
        serviceId,
        totalPrice: service.price,
        tenantId: tenant.id,
        status: "PENDING",
      }
    });

    res.status(201).json(appointment);
  } catch (error) { next(error); }
});

export default router;