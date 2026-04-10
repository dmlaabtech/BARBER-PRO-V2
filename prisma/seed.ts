import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando Seed dos Planos da DM Labtech...");

  const plans = [
    {
      name: "Basic",
      maxBarbers: 1,
      maxAppointments: 100,
      price: 29.90,
      features: JSON.stringify([
        "Agenda Online 24/7",
        "Link de Agendamento",
        "Gestão de 1 Barbeiro",
        "Suporte via E-mail"
      ])
    },
    {
      name: "Pro",
      maxBarbers: 5,
      maxAppointments: 500,
      price: 49.90,
      features: JSON.stringify([
        "Tudo do Basic",
        "Gestão de até 5 Barbeiros",
        "Lembretes via WhatsApp",
        "Relatórios Financeiros",
        "Suporte via WhatsApp"
      ])
    },
    {
      name: "Premium",
      maxBarbers: 20,
      maxAppointments: 1000,
      price: 79.90,
      features: JSON.stringify([
        "Tudo do Pro",
        "Gestão de até 20 Barbeiros",
        "Controle de Estoque",
        "Programa de Fidelidade",
        "Suporte Prioritário VIP"
      ])
    }
  ];

  for (const planData of plans) {
    // Em vez de upsert, verificamos pelo nome
    const existingPlan = await prisma.plan.findFirst({
      where: { name: planData.name }
    });

    if (!existingPlan) {
      await prisma.plan.create({
        data: planData
      });
      console.log(`✅ Plano ${planData.name} criado com sucesso.`);
    } else {
      // Se quiser atualizar o preço ou as features de um plano que já existe
      await prisma.plan.update({
        where: { id: existingPlan.id },
        data: planData
      });
      console.log(`🔄 Plano ${planData.name} já existia e foi atualizado.`);
    }
  }

  console.log("✨ Todos os planos foram configurados no banco de dados.");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao rodar o seed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });