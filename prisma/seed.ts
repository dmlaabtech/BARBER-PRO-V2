import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existingPlan = await prisma.plan.findFirst();
  
  if (!existingPlan) {
    await prisma.plan.create({
      data: {
        name: "Premium",
        maxBarbers: 20,
        maxAppointments: 1000,
        price: 79.90,
        features: JSON.stringify([
          "Agenda Online 24/7",
          "Lembretes automáticos via WhatsApp",
          "Link de Agendamento Personalizado",
          "Gestão de Equipe e Comissões",
          "Controle de Estoque Inteligente",
          "Relatórios Financeiros Avançados",
          "Programa de Fidelidade",
          "Suporte Prioritário VIP"
        ])
      }
    });
    console.log("Plano Premium criado via Seed com sucesso.");
  } else {
    console.log("Os planos já estão configurados no banco de dados.");
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });