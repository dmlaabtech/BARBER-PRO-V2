import { prisma } from "../../../src/lib/prisma";

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: slug as string },
      include: {
        services: { where: { active: true } },
        barbers: { where: { active: true } },
      }
    });

    if (!tenant) return res.status(404).json({ error: "Barbearia não encontrada" });

    res.json(tenant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar dados da barbearia" });
  }
}
