import { prisma } from "../../src/lib/prisma";
import { authenticateToken } from "../../src/lib/auth";

export default async function handler(req: any, res: any) {
  // Wrapping in authenticateToken middleware logic
  await new Promise<void>((resolve, reject) => {
    authenticateToken(req, res, () => resolve());
  });

  if (res.headersSent) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.user.role !== "SUPER_ADMIN") return res.status(403).json({ error: "Forbidden" });

  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: { users: true, barbers: true, appointments: true }
        }
      }
    });
    res.json(tenants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar tenants" });
  }
}
