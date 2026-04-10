import { prisma } from "../src/lib/prisma";

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let plans = await prisma.plan.findMany();
    if (plans.length === 0) {
      // Seed default plans
      await prisma.plan.createMany({
        data: [
          { 
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
          },
        ]
      });
      plans = await prisma.plan.findMany();
    } else {
      // Update existing Premium plan to 79.90 and new features
      const premiumPlan = plans.find(p => p.name === "Premium");
      if (premiumPlan) {
        await prisma.plan.update({
          where: { id: premiumPlan.id },
          data: { 
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
      }
      
      // Delete other plans if they exist to only show Premium
      const otherPlans = plans.filter(p => p.name !== "Premium");
      for (const plan of otherPlans) {
        await prisma.plan.delete({ where: { id: plan.id } });
      }
      plans = await prisma.plan.findMany();
    }
    res.json(plans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar planos" });
  }
}
