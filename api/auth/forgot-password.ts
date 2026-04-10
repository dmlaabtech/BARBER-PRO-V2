import { prisma } from "../../src/lib/prisma";

const APP_URL = process.env.APP_URL || "http://localhost:3000";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Retornamos sucesso mesmo se não existir por segurança
      return res.json({ message: "Se o e-mail existir, um link de recuperação foi enviado." });
    }

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt
      }
    });

    // Aqui você integraria com um serviço de e-mail (SendGrid, AWS SES, etc)
    console.log(`[SIMULAÇÃO DE E-MAIL] Link de recuperação para ${email}: ${APP_URL}/reset-password?token=${token}`);

    res.json({ message: "Se o e-mail existir, um link de recuperação foi enviado." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
}
