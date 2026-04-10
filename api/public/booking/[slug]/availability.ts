import { prisma } from "../../../../src/lib/prisma";

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug, date, barberId } = req.query;

  if (!date || !barberId) {
    return res.status(400).json({ error: "Data e barbeiro são obrigatórios" });
  }

  try {
    const tenant = await prisma.tenant.findUnique({ where: { slug: slug as string } });
    if (!tenant) return res.status(404).json({ error: "Barbearia não encontrada" });

    // Start and end of the selected date in local time (assuming UTC-3 for simplicity, or just matching the date string)
    // The date string is YYYY-MM-DD. We need to find appointments that fall on this day.
    const startDate = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(`${date}T23:59:59.999Z`);
    
    // Since the appointments are stored in UTC, and the local date is converted to UTC,
    // we need to query appointments where the date is between the start and end of the UTC day,
    // OR we can just fetch all appointments for the barber and filter them.
    // To be safe with timezones, let's fetch appointments for the barber from startDate - 1 day to endDate + 1 day
    const startQuery = new Date(startDate);
    startQuery.setDate(startQuery.getDate() - 1);
    const endQuery = new Date(endDate);
    endQuery.setDate(endQuery.getDate() + 1);

    const appointments = await prisma.appointment.findMany({
      where: {
        tenantId: tenant.id,
        barberId: String(barberId),
        status: { notIn: ['CANCELED'] },
        date: {
          gte: startQuery,
          lte: endQuery
        }
      }
    });

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar disponibilidade" });
  }
}
