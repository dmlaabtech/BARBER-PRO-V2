import { Router, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { AuthRequest } from "../../types/express";
import { authenticateToken } from "../middleware/auth.js";
import { tenantGuard } from "../middleware/tenant.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

type AppointmentWithRelations = Prisma.AppointmentGetPayload<{
  include: {
    client: true;
    barber: true;
    service: true;
  };
}>;

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
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "IN_SERVICE",
    "COMPLETED",
    "CANCELED",
    "NO_SHOW",
  ]),
});

// -------------------------------------------------------------
// ROTAS DE AGENDAMENTOS
// -------------------------------------------------------------

router.get(
  "/",
  authenticateToken,
  tenantGuard,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
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
  }
);

router.post(
  "/",
  authenticateToken,
  tenantGuard,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const tenantId = req.tenantId as string;

    const result = createAppointmentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }

    const { date, clientId, barberId, serviceId, notes, totalPrice } =
      result.data;

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
        include: {
          client: true,
          barber: true,
          service: true,
        },
      });

      await prisma.notification.create({
        data: {
          title: "Novo Agendamento",
          message: `${appointment.client.name} agendou ${appointment.service.name}. Verifique sua agenda.`,
          type: "info",
          tenantId,
        },
      });

      res.json(appointment);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/:id",
  authenticateToken,
  tenantGuard,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const tenantId = req.tenantId as string;

    const result = updateAppointmentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }

    const { status } = result.data;

    try {
      const appointment = (await prisma.appointment.findFirst({
        where: { id, tenantId },
        include: {
          client: true,
          barber: true,
          service: true,
        },
      })) as AppointmentWithRelations | null;

      if (!appointment) {
        return res.status(404).json({ error: "Agendamento não encontrado" });
      }

      const updated = await prisma.appointment.update({
        where: { id },
        data: { status },
        include: {
          client: true,
          barber: true,
          service: true,
        },
      });

      if (status === "COMPLETED" && appointment.status !== "COMPLETED") {
        await prisma.financialTransaction.create({
          data: {
            description: `Serviço: ${appointment.service.name} - Cliente: ${appointment.client.name}`,
            amount: appointment.totalPrice,
            type: "INCOME",
            tenantId,
          },
        });

        await prisma.client.update({
          where: { id: appointment.clientId },
          data: {
            loyaltyPoints: { increment: 1 },
          },
        });
      }

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  authenticateToken,
  tenantGuard,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const tenantId = req.tenantId as string;

    try {
      const appointment = await prisma.appointment.findFirst({
        where: { id, tenantId },
      });

      if (!appointment) {
        return res.status(404).json({ error: "Agendamento não encontrado" });
      }

      await prisma.appointment.delete({
        where: { id },
      });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

export default router;