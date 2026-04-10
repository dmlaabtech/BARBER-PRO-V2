import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Sparkles, Zap, ShieldCheck, Star, Users, TrendingUp, Calendar, ChevronRight, Play, LayoutDashboard, PieChart, Clock, MousePointer2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function LandingPage({ onLoginClick, onPricingClick }: { onLoginClick: () => void, onPricingClick: () => void }) {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'agenda' | 'financeiro'>('dashboard');
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-zinc-100 selection:text-zinc-950 overflow-x-hidden relative">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-100/[0.03] rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-100/[0.02] rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/50 backdrop-blur-xl border-b border-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
              <Scissors className="w-6 h-6 text-zinc-950" />
            </div>
            <span className="text-xl font-bold tracking-tighter uppercase">BarberPro</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            <button onClick={() => scrollToSection("features")} className="hover:text-zinc-100 transition-colors">Recursos</button>
            <button onClick={onPricingClick} className="hover:text-zinc-100 transition-colors">Planos</button>
            <button onClick={() => scrollToSection("testimonials")} className="hover:text-zinc-100 transition-colors">Depoimentos</button>
            <button onClick={() => scrollToSection("about")} className="hover:text-zinc-100 transition-colors">Sobre</button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onLoginClick}
              className="text-[10px] font-black uppercase tracking-widest text-zinc-100 hover:text-zinc-400 transition-colors px-6"
            >
              Entrar
            </button>
            <button 
              onClick={onPricingClick}
              className="premium-button py-3 px-6 text-[10px] shadow-2xl shadow-white/5"
            >
              Começar Agora
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="about" className="relative pt-48 pb-32 px-6 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center space-y-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-full text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <Sparkles className="w-3 h-3 text-zinc-100 animate-pulse" />
              <span>A Nova Era da Gestão de Barbearias by DM LABTECH</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter leading-[0.85] uppercase"
            >
              Domine o seu <br />
              <span className="text-zinc-600 italic font-light">Império</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-2xl mx-auto text-xl text-zinc-500 font-medium leading-relaxed"
            >
              A DM LABTECH apresenta a BarberPro: a plataforma definitiva para barbearias de luxo. Gestão cirúrgica, design impecável e resultados exponenciais.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8"
            >
              <button 
                onClick={onPricingClick}
                className="premium-button py-7 px-14 text-xl shadow-2xl shadow-white/10 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative z-10">Explorar Planos</span>
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform relative z-10" />
              </button>
              <button 
                onClick={() => scrollToSection("preview-section")}
                className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-100 transition-all group"
              >
                <div className="w-14 h-14 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-zinc-100 group-hover:bg-zinc-100 group-hover:text-zinc-950 transition-all duration-500 shadow-2xl shadow-white/5">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <div className="text-left">
                  <span className="block">Ver Demonstração</span>
                  <span className="text-[8px] text-zinc-700 group-hover:text-zinc-500 transition-colors">Interativo • 2 min</span>
                </div>
              </button>
            </motion.div>
          </div>

          {/* Social Proof */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="pt-32 flex flex-col items-center gap-10"
          >
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em]">Confiado por barbearias de elite em todo o Brasil</p>
            <div className="flex flex-wrap justify-center gap-16 opacity-20 grayscale hover:grayscale-0 transition-all duration-1000">
              {['BARBER CO.', 'THE GENTLEMAN', 'VINTAGE CUTS', 'ROYAL BARBER', 'ELITE STUDIO'].map(brand => (
                <span key={brand} className="text-2xl font-black tracking-tighter text-zinc-400 hover:text-zinc-100 transition-colors cursor-default">{brand}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Preview Section */}
      <section id="preview-section" className="py-48 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-zinc-900/20 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center space-y-6 mb-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-[10px] font-black uppercase tracking-widest"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Live Preview Interativo</span>
            </motion.div>
            <h2 className="text-5xl md:text-8xl font-bold tracking-tighter uppercase leading-none">
              Interface <span className="text-zinc-600 italic font-light">Inteligente</span>
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto font-medium text-lg">
              Uma experiência fluida tanto para você quanto para seu cliente. 
              Gerencie tudo em um só lugar com design de classe mundial.
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative group"
          >
            <div className="absolute -inset-4 bg-gradient-to-b from-zinc-100/10 to-transparent rounded-[48px] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
            
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.05)]">
              {/* Browser Header */}
              <div className="h-14 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-8">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                  </div>
                  <div className="ml-4 h-6 w-64 bg-zinc-900 rounded-full border border-zinc-800 flex items-center px-3 gap-2">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">app.barberpro.com.br</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 relative">
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: [0, 1, 0], x: [10, 0, 10] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -left-32 top-1/2 -translate-y-1/2 text-[8px] font-black text-zinc-500 uppercase tracking-widest hidden lg:block"
                  >
                    Clique para explorar →
                  </motion.div>
                  {['dashboard', 'agenda', 'financeiro'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest transition-all px-3 py-1.5 rounded-lg",
                        activeTab === tab 
                          ? "bg-zinc-100 text-zinc-950" 
                          : "text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Content Area */}
              <div className="relative aspect-video bg-zinc-950 overflow-hidden p-8 md:p-12">
                <AnimatePresence mode="wait">
                  {activeTab === 'dashboard' && (
                    <motion.div 
                      key="dashboard"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                      <div className="md:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="glass-card p-6 border-white/5 space-y-2">
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Receita Mensal</p>
                            <p className="text-4xl font-bold text-zinc-100">R$ 42.850</p>
                            <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold">
                              <TrendingUp className="w-3 h-3" />
                              <span>+12.5% vs mês anterior</span>
                            </div>
                          </div>
                          <div className="glass-card p-6 border-white/5 space-y-2">
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Novos Clientes</p>
                            <p className="text-4xl font-bold text-zinc-100">128</p>
                            <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold">
                              <TrendingUp className="w-3 h-3" />
                              <span>+8.2% vs mês anterior</span>
                            </div>
                          </div>
                        </div>
                        <div className="glass-card p-8 border-white/5 h-full min-h-[200px] flex flex-col justify-end">
                          <div className="flex items-end gap-2 h-32">
                            {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                              <motion.div 
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                className="flex-1 bg-zinc-100/10 rounded-t-lg relative group"
                              >
                                <div className="absolute inset-0 bg-zinc-100 opacity-0 group-hover:opacity-20 transition-opacity rounded-t-lg" />
                              </motion.div>
                            ))}
                          </div>
                          <div className="flex justify-between mt-4 text-[8px] font-black text-zinc-700 uppercase tracking-widest">
                            <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sab</span><span>Dom</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="glass-card p-6 border-white/5 space-y-4">
                          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Próximos Agendamentos</p>
                          {[
                            { name: "Carlos Silva", time: "14:30", service: "Corte + Barba" },
                            { name: "João Pedro", time: "15:15", service: "Degradê" },
                            { name: "Lucas M.", time: "16:00", service: "Barba Premium" }
                          ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                              <div>
                                <p className="text-xs font-bold text-zinc-100">{item.name}</p>
                                <p className="text-[8px] text-zinc-500 uppercase font-bold">{item.service}</p>
                              </div>
                              <p className="text-[10px] font-black text-zinc-400">{item.time}</p>
                            </div>
                          ))}
                        </div>
                        <div className="glass-card p-6 border-white/5 bg-emerald-500/5 border-emerald-500/10 relative overflow-hidden">
                          <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: "-100%" }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500/20"
                          />
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Zap className="w-3 h-3" />
                            Dica do Sistema
                          </p>
                          <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                            Você tem 5 clientes que não aparecem há mais de 30 dias. Que tal enviar uma promoção?
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'agenda' && (
                    <motion.div 
                      key="agenda"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full flex flex-col gap-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <h3 className="text-2xl font-bold tracking-tighter uppercase">Agenda Semanal</h3>
                          <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            Abril 2026
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                            <ChevronRight className="w-4 h-4 rotate-180" />
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 grid grid-cols-7 gap-4">
                        {[...Array(7)].map((_, i) => (
                          <div key={i} className="space-y-4">
                            <div className="text-center">
                              <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'][i]}</p>
                              <p className={cn("text-lg font-bold", i === 2 ? "text-zinc-100" : "text-zinc-500")}>{6 + i}</p>
                            </div>
                            <div className="flex-1 bg-zinc-900/50 rounded-2xl border border-white/5 p-2 space-y-2 min-h-[200px]">
                              {i === 2 && (
                                <>
                                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                    <p className="text-[8px] font-black text-emerald-500 uppercase">09:00</p>
                                    <p className="text-[10px] font-bold text-zinc-100 truncate">Corte VIP</p>
                                  </div>
                                  <div className="p-2 bg-zinc-800/50 border border-zinc-700/50 rounded-xl">
                                    <p className="text-[8px] font-black text-zinc-500 uppercase">10:30</p>
                                    <p className="text-[10px] font-bold text-zinc-400 truncate">Barba</p>
                                  </div>
                                </>
                              )}
                              {i === 3 && (
                                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                  <p className="text-[8px] font-black text-amber-500 uppercase">14:00</p>
                                  <p className="text-[10px] font-bold text-zinc-100 truncate">Combo</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'financeiro' && (
                    <motion.div 
                      key="financeiro"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
                    >
                      <div className="space-y-8">
                        <div className="space-y-2">
                          <h3 className="text-4xl font-bold tracking-tighter uppercase">Fluxo de Caixa</h3>
                          <p className="text-zinc-500 font-medium">Relatórios detalhados de cada centavo que entra e sai.</p>
                        </div>
                        <div className="space-y-6">
                          {[
                            { label: "Entradas", value: "R$ 12.450,00", color: "emerald-500", percent: 85 },
                            { label: "Saídas", value: "R$ 3.120,00", color: "red-500", percent: 25 },
                            { label: "Comissões", value: "R$ 4.800,00", color: "amber-500", percent: 45 }
                          ].map((item, i) => (
                            <div key={i} className="space-y-2">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-zinc-500">{item.label}</span>
                                <span className={`text-${item.color}`}>{item.value}</span>
                              </div>
                              <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${item.percent}%` }}
                                  className={cn("h-full", `bg-${item.color}`)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="relative">
                        <div className="aspect-square rounded-full border-[20px] border-zinc-900 flex items-center justify-center relative">
                          <div className="text-center">
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Lucro Líquido</p>
                            <p className="text-5xl font-bold text-zinc-100 tracking-tighter">R$ 4.530</p>
                          </div>
                          <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle 
                              cx="50%" cy="50%" r="45%" 
                              className="fill-none stroke-emerald-500 stroke-[20px]" 
                              strokeDasharray="283" 
                              strokeDashoffset="70" 
                            />
                          </svg>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Floating Interaction Hint */}
                <motion.div 
                  animate={{ 
                    x: [0, 100, 50, 0],
                    y: [0, 50, 100, 0]
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-10 right-10 pointer-events-none opacity-20"
                >
                  <MousePointer2 className="w-8 h-8 text-zinc-100" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 px-6 border-y border-zinc-900/50 bg-zinc-900/40 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-16">
          {[
            { label: "Barbearias Ativas", value: "500+" },
            { label: "Agendamentos/Mês", value: "50k+" },
            { label: "Satisfação", value: "99.9%" },
            { label: "Crescimento Médio", value: "45%" },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center space-y-3"
            >
              <p className="text-5xl font-bold tracking-tighter text-zinc-100">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-48 px-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-32">
          <div className="text-center space-y-6">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-8xl font-bold tracking-tighter uppercase"
            >
              Arsenal de <span className="text-zinc-600 italic font-light">Elite</span>
            </motion.h2>
            <p className="text-zinc-500 font-medium text-xl max-w-2xl mx-auto">Tudo o que você precisa para escalar sua barbearia ao nível máximo de profissionalismo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: Calendar,
                title: "Agenda Inteligente",
                desc: "Agendamentos online 24/7 com lembretes automáticos via WhatsApp. Reduza faltas em até 80%.",
                color: "zinc-100"
              },
              {
                icon: TrendingUp,
                title: "Financeiro Avançado",
                desc: "Controle total de fluxo de caixa, comissões automáticas e relatórios de lucratividade em tempo real.",
                color: "emerald-500"
              },
              {
                icon: Users,
                title: "CRM de Clientes",
                desc: "Histórico completo, preferências, aniversários e programas de fidelidade que realmente funcionam.",
                color: "amber-500"
              },
              {
                icon: Zap,
                title: "PDV Integrado",
                desc: "Venda produtos e serviços com rapidez. Múltiplos meios de pagamento e controle de estoque automático.",
                color: "blue-500"
              },
              {
                icon: ShieldCheck,
                title: "Segurança Total",
                desc: "Seus dados e de seus clientes protegidos com criptografia de nível bancário e backups diários.",
                color: "purple-500"
              },
              {
                icon: Star,
                title: "Marketing Digital",
                desc: "Envie promoções segmentadas e recupere clientes inativos com automações inteligentes.",
                color: "rose-500"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -15, backgroundColor: "rgba(255,255,255,0.02)" }}
                className="glass-card p-12 space-y-8 group border-white/5"
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                  `text-${feature.color}`
                )}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold tracking-tight">{feature.title}</h3>
                  <p className="text-zinc-500 leading-relaxed font-medium text-lg">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-48 px-6 bg-zinc-900/20 relative z-10">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-6">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase">Aprovado por <span className="text-zinc-600 italic font-light">Líderes</span></h2>
            <p className="text-zinc-500 font-medium text-xl">Quem usa BarberPro não volta atrás.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Ricardo Santos",
                role: "Dono da Barber Elite",
                text: "O BarberPro mudou meu negócio. O financeiro é impecável e meus clientes amam agendar online.",
                image: "https://i.pravatar.cc/150?u=ricardo"
              },
              {
                name: "André Oliveira",
                role: "CEO Barbearia Vintage",
                text: "A melhor plataforma que já usei. O suporte da DM LABTECH é nota mil e o sistema é muito rápido.",
                image: "https://i.pravatar.cc/150?u=andre"
              },
              {
                name: "Marcos Lima",
                role: "Proprietário Navalha Afiada",
                text: "O controle de estoque e o PDV integrados me poupam horas de trabalho todos os dias.",
                image: "https://i.pravatar.cc/150?u=marcos"
              }
            ].map((testimonial, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="glass-card p-10 space-y-8 border-white/5"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-zinc-100 text-zinc-100" />)}
                </div>
                <p className="text-zinc-400 text-lg italic leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-4 pt-4 border-t border-zinc-800">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full grayscale" referrerPolicy="no-referrer" />
                  <div>
                    <p className="font-bold text-zinc-100">{testimonial.name}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-48 px-6 relative z-10 bg-zinc-900/10">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-6">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase">Como <span className="text-zinc-600 italic font-light">Funciona</span></h2>
            <p className="text-zinc-500 font-medium text-xl">O caminho mais rápido para a excelência.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { step: "01", title: "Escolha seu Plano", desc: "Selecione o plano que melhor se adapta ao tamanho da sua barbearia." },
              { step: "02", title: "Configure sua Loja", desc: "Adicione seus profissionais, serviços e horários em poucos minutos." },
              { step: "03", title: "Escala Imediata", desc: "Comece a receber agendamentos e gerencie tudo com precisão cirúrgica." }
            ].map((item, i) => (
              <div key={i} className="relative space-y-6 text-center">
                <div className="text-8xl font-black text-zinc-100/5 absolute -top-10 left-1/2 -translate-x-1/2 select-none">{item.step}</div>
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto relative z-10">
                  <span className="text-xl font-bold text-zinc-100">{item.step}</span>
                </div>
                <div className="space-y-3 relative z-10">
                  <h3 className="text-2xl font-bold tracking-tight uppercase">{item.title}</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-48 px-6 relative z-10">
        <div className="max-w-4xl mx-auto space-y-24">
          <div className="text-center space-y-6">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase">Perguntas <span className="text-zinc-600 italic font-light">Frequentes</span></h2>
            <p className="text-zinc-500 font-medium text-xl">Tudo o que você precisa saber sobre o BarberPro.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Como funciona o teste grátis?",
                a: "Você tem acesso total a todas as funcionalidades do plano escolhido por 7 dias. Não pedimos cartão de crédito para começar."
              },
              {
                q: "Posso cancelar a qualquer momento?",
                a: "Sim! Não temos contratos de fidelidade. Você pode cancelar sua assinatura quando quiser diretamente pelo painel."
              },
              {
                q: "O suporte está incluso?",
                a: "Com certeza. Nossa equipe da DM LABTECH oferece suporte prioritário via WhatsApp e E-mail para todos os planos."
              },
              {
                q: "Meus dados estão seguros?",
                a: "Sim. Utilizamos criptografia de ponta a ponta e servidores de alta disponibilidade para garantir que seus dados estejam sempre protegidos."
              }
            ].map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card p-8 border-white/5 hover:border-white/10 transition-colors cursor-default group"
              >
                <h3 className="text-xl font-bold text-zinc-100 group-hover:text-white transition-colors">{faq.q}</h3>
                <p className="mt-4 text-zinc-500 leading-relaxed font-medium">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Profit Calculator Section */}
      <section className="py-48 px-6 relative z-10 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-12 md:p-24 border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <TrendingUp className="w-64 h-64" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">Calcule seu <br /><span className="text-zinc-600 italic font-light">Retorno</span></h2>
                <p className="text-xl text-zinc-500 font-medium leading-relaxed">
                  Veja quanto você pode economizar e lucrar a mais eliminando faltas e otimizando sua agenda com o BarberPro.
                </p>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      <span>Cortes por dia</span>
                      <span className="text-zinc-100">15</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-100 w-[60%]" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      <span>Valor médio do corte</span>
                      <span className="text-zinc-100">R$ 60,00</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-100 w-[40%]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950/50 border border-white/5 rounded-[32px] p-12 space-y-10">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Lucro Adicional Estimado</p>
                  <p className="text-6xl md:text-7xl font-bold tracking-tighter text-emerald-500">R$ 3.240,00</p>
                  <p className="text-sm text-zinc-500 font-medium">por mês, apenas reduzindo faltas em 15%</p>
                </div>
                
                <div className="pt-10 border-t border-zinc-800 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="text-sm text-zinc-400 font-medium">Automação de lembretes via WhatsApp inclusa.</p>
                  </div>
                  <button 
                    onClick={onPricingClick}
                    className="premium-button w-full py-6 text-lg"
                  >
                    Garantir meu Lucro Agora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-48 px-6 relative overflow-hidden z-10">
        <div className="max-w-5xl mx-auto glass-card p-24 text-center space-y-12 relative z-10 border-white/10 bg-zinc-100/[0.01]">
          <div className="space-y-6">
            <h2 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase leading-none">Pronto para o <br /><span className="text-zinc-600 italic font-light">Próximo Nível?</span></h2>
            <p className="text-2xl text-zinc-500 max-w-2xl mx-auto font-medium">
              Experimente o BarberPro por 7 dias grátis. Sem compromisso, resultados garantidos.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <button 
              onClick={onPricingClick}
              className="premium-button py-7 px-14 text-xl shadow-2xl shadow-white/10 relative group"
            >
              <div className="absolute -top-3 -right-3 bg-emerald-500 text-zinc-950 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest animate-bounce">
                7 Dias Grátis
              </div>
              <span>Começar Agora</span>
            </button>
            <button 
              onClick={() => window.open("https://wa.me/5500000000000", "_blank")}
              className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-100 transition-all flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-zinc-100 transition-colors">
                <Users className="w-4 h-4" />
              </div>
              <span>Falar com Especialista</span>
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-4xl mx-auto glass-card p-16 border-white/5 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase">Fique por <span className="text-zinc-600 italic font-light">Dentro</span></h2>
            <p className="text-zinc-500 font-medium">Receba dicas de gestão e novidades da DM LABTECH diretamente no seu e-mail.</p>
          </div>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="seu@email.com" 
              className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 text-zinc-100 focus:outline-none focus:border-zinc-100 transition-colors"
            />
            <button className="premium-button px-8 py-4 text-[10px]">Inscrever</button>
          </form>
        </div>
      </section>

      {/* Simulated Live Chat Bubble */}
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: "spring" }}
        className="fixed bottom-8 right-8 z-[100] group"
      >
        <div className="absolute bottom-full right-0 mb-4 w-64 glass-card p-4 border-white/10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all pointer-events-none">
          <p className="text-xs font-medium text-zinc-300">Olá! 👋 Precisa de ajuda para escolher o melhor plano para sua barbearia?</p>
          <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-zinc-900 border-r border-b border-white/10 rotate-45" />
        </div>
        <button 
          onClick={() => window.open("https://wa.me/5500000000000", "_blank")}
          className="w-16 h-16 rounded-full bg-zinc-100 text-zinc-950 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <Users className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-950 animate-pulse" />
        </button>
      </motion.div>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-zinc-900/50 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16">
          <div className="flex flex-col items-center md:items-start gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
                <Scissors className="w-6 h-6 text-zinc-950" />
              </div>
              <span className="text-2xl font-bold tracking-tighter uppercase">BarberPro</span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">
                Uma solução de engenharia por
              </p>
              <p className="text-lg font-bold text-zinc-100 tracking-tight">DM LABTECH</p>
            </div>
          </div>
          
          <div className="text-center md:text-right space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
              &copy; 2026 DM LABTECH. Todos os direitos reservados.
            </p>
            <div className="flex items-center justify-center md:justify-end gap-10 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <button className="hover:text-zinc-100 transition-colors">Privacidade</button>
              <button className="hover:text-zinc-100 transition-colors">Termos</button>
              <button className="hover:text-zinc-100 transition-colors">Suporte</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
