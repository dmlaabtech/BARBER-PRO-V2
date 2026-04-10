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
const createAppointmentSchema = z.object({
  date: z.string().datetime(),
  clientId: z.string().uuid(),
  barberId: z.string().uuid(),
  serviceId: z.string().uuid(),
  notes: z.string().optional(),
  totalPrice: z.number().positive(),
});

const updateAppointmentSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "IN_SERVICE", "COMPLETED", "CANCELED", "NO_SHOW"]),
});

// -------------------------------------------------------------
// ROTAS DE AGENDAMENTOS
// -------------------------------------------------------------

// GET /api/appointments - Listar todos os agendamentos do Tenant
router.get("/", authenticateToken, tenantGuard, async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId as string;
  try {
    const appointments = await prisma.appointment.findMany({
      where: { tenantId },
      include: {
        client: true,
        barber: true,
        service: true,
      },
      orderBy: { date: "asc" },
    });
    res.json(appointments);
  } catch (error) {
    next(error);
  }
});

// POST /api/appointments - Criar novo agendamento
router.post("/", authenticateToken, tenantGuard, async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId as string;
  
  const result = createAppointmentSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten() });

  const { date, clientId, barberId, serviceId, notes, totalPrice } = result.data;
  try {
    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        clientId,
        barberId,
        serviceId,
        notes,
        totalPrice,
        tenantId,
      },
      include: { client: true, barber: true, service: true }
    });

    await prisma.notification.create({
      data: {
        title: "Novo Agendamento",
        message: `${appointment.client.name} agendou ${appointment.service.name}. Verifique sua agenda.`,
        type: "info",
        tenantId: tenantId
      }
    });

    res.json(appointment);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/appointments/:id - Atualizar status com Zod
router.patch("/:id", authenticateToken, tenantGuard, async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const tenantId = req.tenantId as string;

  const result = updateAppointmentSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.flatten() });

  const { status } = result.data;

  try {
    const appointment = await prisma.appointment.findFirst({
      where: { id, tenantId },
      include: { client: true, service: true }
    });

    if (!appointment) return res.status(404).json({ error: "Agendamento não encontrado" });

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status }
    });

    if (status === "COMPLETED" && appointment.status !== "COMPLETED") {
      await prisma.financialTransaction.create({
        data: {
          description: `Serviço: ${appointment.service.name} - Cliente: ${appointment.client.name}`,
          amount: appointment.totalPrice,
          type: "INCOME",
          tenantId
        }
      });
      await prisma.client.update({
        where: { id: appointment.clientId },
        data: { loyaltyPoints: { increment: 1 } }
      });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/appointments/:id - Cancelar/Excluir agendamento
router.delete("/:id", authenticateToken, tenantGuard, async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const tenantId = req.tenantId as string;

  try {
    const appointment = await prisma.appointment.findFirst({
      where: { id, tenantId }
    });

    if (!appointment) return res.status(404).json({ error: "Agendamento não encontrado" });

    await prisma.appointment.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;