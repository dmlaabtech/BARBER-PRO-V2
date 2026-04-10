import { prisma } from "../src/lib/prisma";

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.query;
  try {
    const pending = await prisma.pendingRegistration.findUnique({
      where: { stripeSessionId: sessionId as string }
    });

    if (!pending || pending.used) {
      return res.status(400).json({ error: "Sessão inválida ou já utilizada" });
    }

    res.json({ valid: true, email: pending.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao verificar sessão" });
  }
}
