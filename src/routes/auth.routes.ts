import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "../lib/prisma";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

// -------------------------------------------------------------
// VALIDAÇÕES
// -------------------------------------------------------------
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  shopName: z.string().min(2),
  sessionId: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(6),
});

// -------------------------------------------------------------
// ROTAS
// -------------------------------------------------------------

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() });
  }

  if (!JWT_SECRET) {
    return res.status(500).json({
      error: "JWT_SECRET não configurado no servidor.",
    });
  }

  const { email, password } = result.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenant: user.tenant,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() });
  }

  const { name, email, password, shopName, sessionId } = result.data;

  try {
    const pending = await prisma.pendingRegistration.findUnique({
      where: { stripeSessionId: sessionId },
    });

    if (!pending || pending.used) {
      return res.status(400).json({
        error: "Sessão de pagamento inválida ou já utilizada",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "E-mail já cadastrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const baseSlug = shopName
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

    await prisma.$transaction(async (tx) => {
      let finalSlug = baseSlug;
      let attempt = 0;

      while (true) {
        const existing = await tx.tenant.findUnique({
          where: { slug: finalSlug },
        });

        if (!existing) break;

        attempt++;
        finalSlug = `${baseSlug}-${attempt}`;
      }

      const tenant = await tx.tenant.create({
        data: {
          name: shopName,
          slug: finalSlug,
          planId: pending.planId,
          planStatus: "ACTIVE",
        },
      });

      await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "OWNER",
          tenantId: tenant.id,
        },
      });

      await tx.pendingRegistration.update({
        where: { id: pending.id },
        data: { used: true },
      });
    });

    return res.json({ message: "Cadastro realizado com sucesso" });
  } catch (error) {
    next(error);
  }
});

router.post("/forgot-password", async (req: Request, res: Response, next: NextFunction) => {
  const result = forgotPasswordSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() });
  }

  const { email } = result.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.json({
        message: "Se o e-mail existir, um link de recuperação foi enviado.",
      });
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[DEV MODE] E-mail simulado enviado para: ${email}. Verifique o banco de dados para o token de reset.`
      );
    } else {
      console.log(`[INFO] Solicitação de recuperação de senha gerada para: ${email}`);
    }

    return res.json({
      message: "Se o e-mail existir, um link de recuperação foi enviado.",
    });
  } catch (error) {
    next(error);
  }
});

router.post("/reset-password", async (req: Request, res: Response, next: NextFunction) => {
  const result = resetPasswordSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() });
  }

  const { token, newPassword } = result.data;

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return res.status(400).json({ error: "Token inválido ou expirado." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return res.json({ message: "Senha alterada com sucesso." });
  } catch (error) {
    next(error);
  }
});

export default router;