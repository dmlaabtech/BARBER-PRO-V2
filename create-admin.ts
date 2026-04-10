import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = "danielbvdias@gmail.com";
  const password = "admin"; // Senha temporária

  try {
    // 1. Criar um Tenant (Barbearia) padrão primeiro, pois o usuário precisa de um
    let tenant = await prisma.tenant.findFirst();
    
    if (!tenant) {
      // Se não existir, cria um tenant com um plano fictício
      const plan = await prisma.plan.create({
        data: {
          name: "Premium",
          maxBarbers: 10,
          maxAppointments: 1000,
          price: 99.90,
          features: JSON.stringify(["Tudo liberado"])
        }
      });

      tenant = await prisma.tenant.create({
        data: {
          name: "Minha Barbearia",
          slug: "minha-barbearia",
          planId: plan.id,
          planStatus: "ACTIVE"
        }
      });
      console.log("Tenant criado:", tenant.name);
    }

    // 2. Criar o usuário Admin
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: "SUPER_ADMIN",
        tenantId: tenant.id
      },
      create: {
        name: "Daniel Dias",
        email: email,
        password: hashedPassword,
        role: "SUPER_ADMIN",
        tenantId: tenant.id
      }
    });

    console.log("✅ Usuário Admin criado com sucesso!");
    console.log("------------------------------------------------");
    console.log("E-mail:", user.email);
    console.log("Senha:", password);
    console.log("------------------------------------------------");

  } catch (error) {
    console.error("Erro ao criar admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
