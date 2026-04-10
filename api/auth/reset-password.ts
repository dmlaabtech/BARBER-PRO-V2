import { prisma } from "../../src/lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, newPassword } = req.body;
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return res.status(400).json({ error: "Token inválido ou expirado." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword }
    });

    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
    });

    res.json({ message: "Senha alterada com sucesso." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
}
