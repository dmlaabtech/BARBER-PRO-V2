import React, { useEffect, useState } from "react";
import { useApi } from "@/src/hooks/useApi";
import { Check, Loader2, ArrowLeft, Sparkles, Zap, ShieldCheck, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/src/lib/utils";

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string;
}

export default function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { fetchApi } = useApi();

  useEffect(() => {
    fetchApi("/plans").then((data) => {
      setPlans(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  const handlePlanClick = (planId: string) => {
    setSelectedPlan(planId);
    setEmailModalOpen(true);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) {
      alert("Por favor, insira um e-mail válido.");
      return;
    }
    if (!selectedPlan) return;

    setCheckingOut(selectedPlan);
    try {
      const response = await fetchApi("/checkout", {
        method: "POST",
        body: JSON.stringify({ planId: selectedPlan, email, returnUrl: window.location.origin }),
      });
      
      if (response && response.url) {
        // Abre o Stripe em uma nova aba para evitar bloqueio do iframe
        window.open(response.url, "_blank");
        setEmailModalOpen(false);
      } else {
        alert(response?.error || "Erro ao iniciar checkout. Verifique as configurações do Stripe.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Erro ao conectar com o servidor. Tente novamente.");
    } finally {
      setCheckingOut(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-100" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-100/[0.03] rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-100/[0.02] rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-12">
          <button 
            onClick={() => window.location.href = "/"}
            className="text-zinc-500 hover:text-zinc-100 flex items-center gap-2 transition-all font-bold text-sm uppercase tracking-widest group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            <span>Voltar ao Início</span>
          </button>
        </div>

        <div className="text-center mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4"
          >
            <Sparkles className="w-3 h-3 text-zinc-100" />
            <span>Planos & Assinaturas</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-zinc-100 tracking-tighter"
          >
            Escolha sua <span className="text-zinc-500">Experiência</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-xl text-zinc-500 max-w-2xl mx-auto font-medium"
          >
            Transforme a gestão da sua barbearia com ferramentas de elite projetadas para o sucesso.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => {
            let features = [];
            try {
              features = JSON.parse(plan.features);
            } catch (e) {
              features = ["Gestão Completa", "Agenda Online", "Relatórios Financeiros"];
            }
            
            const isPremium = plan.name.toLowerCase().includes("premium") || plan.name.toLowerCase().includes("pro");

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={cn(
                  "glass-card p-10 flex flex-col relative overflow-hidden group",
                  isPremium && "border-zinc-100/20 bg-zinc-100/[0.02]"
                )}
              >
                {isPremium && (
                  <div className="absolute top-0 right-0 p-6">
                    <Crown className="w-6 h-6 text-zinc-100 opacity-20" />
                  </div>
                )}

                <div className="flex-grow space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-zinc-100 tracking-tight">{plan.name}</h3>
                    <p className="text-zinc-500 text-sm font-medium">Ideal para barbearias em crescimento.</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-zinc-100 tracking-tighter">R$ {Number(plan.price).toFixed(2)}</span>
                    <span className="text-zinc-600 font-black text-[10px] uppercase tracking-widest">/ Mês</span>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-[8px] font-black uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" />
                    <span>7 Dias Grátis</span>
                  </div>

                  <div className="space-y-4 pt-8 border-t border-zinc-800/50">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">O que está incluso:</p>
                    <ul className="space-y-4">
                      {features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center">
                            <Check className="w-3 h-3 text-zinc-100" />
                          </div>
                          <span className="text-zinc-400 text-sm font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-12">
                  <button
                    onClick={() => handlePlanClick(plan.id)}
                    disabled={checkingOut !== null}
                    className={cn(
                      "premium-button w-full py-5 text-lg shadow-xl transition-all active:scale-95 disabled:opacity-50",
                      !isPremium && "bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-800"
                    )}
                  >
                    {checkingOut === plan.id ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {isPremium ? <Zap className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                        Assinar Agora
                      </span>
                    )}
                  </button>
                </div>

                {/* Hover effect background */}
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-zinc-100/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-24 text-center"
        >
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">
            Pagamento Seguro via Stripe &copy; 2026 DM LABTECH
          </p>
        </motion.div>
      </div>

      {/* Modal de E-mail */}
      <AnimatePresence>
        {emailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-md shadow-2xl relative"
            >
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Quase lá!</h3>
              <p className="text-zinc-400 text-sm mb-8">
                Para prosseguir com a assinatura, precisamos do seu e-mail. Ele será usado para criar sua conta na plataforma.
              </p>
              <form onSubmit={handleCheckout} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 ml-1">
                    Seu E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    placeholder="exemplo@email.com"
                    required
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEmailModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={checkingOut !== null}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-zinc-950 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-colors flex items-center justify-center shadow-lg shadow-amber-500/20"
                  >
                    {checkingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ir para Pagamento"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
