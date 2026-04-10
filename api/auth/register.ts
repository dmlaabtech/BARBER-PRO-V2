import { prisma } from "../../src/lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, password, shopName, sessionId } = req.body;
  try {
    // Verifica se a sessão de pagamento é válida
    const pending = await prisma.pendingRegistration.findUnique({
      where: { stripeSessionId: sessionId }
    });

    if (!pending || pending.used) {
      return res.status(400).json({ error: "Sessão de pagamento inválida ou já utilizada" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "E-mail já cadastrado" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const slug = shopName.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: shopName,
          slug,
          planId: pending.planId,
          planStatus: "ACTIVE",
        }
      });

      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "OWNER",
          tenantId: tenant.id,
        }
      });

      // Marca a sessão como usada
      await tx.pendingRegistration.update({
        where: { id: pending.id },
        data: { used: true }
      });

      return { user, tenant };
    });

    res.json({ message: "Cadastro realizado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao realizar cadastro" });
  }
}
