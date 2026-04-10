import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Vinculando Plano Premium ao Stripe...");

  // Removemos planos antigos para garantir que a estrutura nova (com stripePriceId) entre limpa
  await prisma.plan.deleteMany({});

  const premiumPlanData = {
    name: "Premium",
    maxBarbers: 20,
    maxAppointments: 1000,
    price: 79.90,
    stripePriceId: "price_1TJaOP0BPTZUByItpFX86oJo", // SEU ID REAL AQUI
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
  };

  await prisma.plan.create({
    data: premiumPlanData
  });

  console.log("✅ DM Labtech configurada: Plano Premium (79.90) vinculado ao Stripe com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });