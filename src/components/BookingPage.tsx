import React from "react";
import { useApi } from "@/src/hooks/useApi";
import { Scissors, Calendar, Clock, User, CheckCircle2, ArrowLeft, Phone, ChevronRight, Star, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatCurrency, cn } from "@/src/lib/utils";

export function BookingPage({ slug }: { slug: string }) {
  const { fetchApi } = useApi();
  const [tenant, setTenant] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [step, setStep] = React.useState(1);
  const [selection, setSelection] = React.useState({
    serviceId: "",
    barberId: "",
    date: "",
    time: "",
    clientName: "",
    clientPhone: "",
  });
  const [success, setSuccess] = React.useState(false);
  const [bookedTimes, setBookedTimes] = React.useState<string[]>([]);

  React.useEffect(() => {
    fetchApi(`/public/booking/${slug}`)
      .then(setTenant)
      .catch((err) => setError(err.message || "Barbearia não encontrada"))
      .finally(() => setLoading(false));
  }, [slug]);

  React.useEffect(() => {
    if (selection.date && selection.barberId) {
      fetchApi(`/public/booking/${slug}/availability?date=${selection.date}&barberId=${selection.barberId}`)
        .then((data) => setBookedTimes(data.bookedTimes || []))
        .catch(console.error);
    }
  }, [selection.date, selection.barberId, slug]);

  const handleBooking = async () => {
    setLoading(true);
    try {
      const [year, month, day] = selection.date.split('-');
      const [hour, minute] = selection.time.split(':');
      const localDate = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));

      await fetchApi(`/public/booking/${slug}/appointment`, {
        method: "POST",
        body: JSON.stringify({
          ...selection,
          date: localDate.toISOString(),
        }),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro ao realizar agendamento");
    } finally {
      setLoading(false);
    }
  };

  const selectedService = tenant?.services?.find((s: any) => s.id === selection.serviceId);
  const selectedBarber = tenant?.barbers?.find((b: any) => b.id === selection.barberId);

  if (loading && !tenant) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="relative flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center animate-bounce">
            <Scissors className="w-10 h-10 text-zinc-100" />
          </div>
          <div className="text-zinc-500 font-black text-xs tracking-[0.5em] uppercase animate-pulse">Preparando...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-12 rounded-[40px] max-w-md w-full text-center space-y-8 relative z-10"
        >
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <Scissors className="w-12 h-12 text-red-500" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Ops!</h2>
            <p className="text-zinc-500 font-medium leading-relaxed">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-zinc-100 text-zinc-950 font-black py-5 rounded-2xl uppercase tracking-widest text-xs hover:bg-zinc-300 transition-all"
          >
            Tentar Novamente
          </button>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-12 rounded-[40px] max-w-md w-full text-center space-y-10 relative z-10"
        >
          <div className="w-28 h-28 bg-emerald-500/10 rounded-[40px] flex items-center justify-center mx-auto rotate-12">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 -rotate-12" />
          </div>
          <div className="space-y-4">
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Confirmado!</h2>
            <p className="text-zinc-500 font-medium">Seu horário na <span className="text-zinc-100 font-bold">{tenant.name}</span> foi reservado.</p>
          </div>
          
          <div className="bg-zinc-950/50 border border-white/5 p-8 rounded-3xl text-left space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Serviço</span>
              <span className="text-sm font-bold text-zinc-100">{selectedService?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Profissional</span>
              <span className="text-sm font-bold text-zinc-100">{selectedBarber?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Horário</span>
              <span className="text-sm font-bold text-zinc-100">{selection.date.split('-').reverse().join('/')} às {selection.time}</span>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-zinc-100 text-zinc-950 font-black py-6 rounded-2xl uppercase tracking-widest text-xs hover:bg-zinc-300 transition-all shadow-2xl shadow-white/5"
            >
              Novo Agendamento
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const primaryColor = tenant?.primaryColor || "#f59e0b";
  const backgroundUrl = tenant?.backgroundUrl || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop";
  const logoUrl = tenant?.logoUrl;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-100 selection:text-zinc-950 flex flex-col lg:flex-row" style={{ '--primary': primaryColor } as React.CSSProperties}>
      {/* Left Side - Branding & Summary */}
      <div className="lg:w-[40%] relative flex flex-col justify-between p-8 lg:p-12 min-h-[40vh] lg:min-h-screen overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-zinc-950/60 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />
          <img 
            src={backgroundUrl} 
            alt="Background" 
            className="w-full h-full object-cover opacity-60 scale-105"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-20">
          <div className="flex items-center gap-4 mb-8">
            {logoUrl ? (
              <img src={logoUrl} alt={tenant.name} className="w-16 h-16 rounded-2xl object-cover shadow-2xl" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center rotate-3 shadow-2xl" style={{ backgroundColor: primaryColor }}>
                <Scissors className="w-8 h-8 text-zinc-950 -rotate-3" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">{tenant.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-zinc-300 font-black uppercase tracking-widest">Agendamento Online</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 mt-auto">
          <AnimatePresence mode="popLayout">
            {step > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-6 rounded-[32px] space-y-4"
              >
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4">Resumo</h3>
                
                {selectedService && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                        <Scissors className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{selectedService.name}</p>
                        <p className="text-[10px] text-zinc-400 font-medium">{formatCurrency(selectedService.price)}</p>
                      </div>
                    </div>
                    {step > 1 && <button onClick={() => setStep(1)} className="text-[10px] font-bold text-amber-500 uppercase">Editar</button>}
                  </div>
                )}

                {selectedBarber && (
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                        <User className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{selectedBarber.name}</p>
                        <p className="text-[10px] text-zinc-400 font-medium">Profissional</p>
                      </div>
                    </div>
                    {step > 2 && <button onClick={() => setStep(2)} className="text-[10px] font-bold text-amber-500 uppercase">Editar</button>}
                  </div>
                )}

                {selection.date && selection.time && (
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{selection.date.split('-').reverse().join('/')}</p>
                        <p className="text-[10px] text-zinc-400 font-medium">{selection.time}</p>
                      </div>
                    </div>
                    {step > 3 && <button onClick={() => setStep(3)} className="text-[10px] font-bold text-amber-500 uppercase">Editar</button>}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Side - Interactive Steps */}
      <div className="lg:w-[60%] bg-zinc-950 relative overflow-y-auto">
        <div className="max-w-2xl mx-auto p-8 lg:p-16 min-h-full flex flex-col">
          
          {/* Progress Bar */}
          <div className="flex items-center gap-4 mb-12">
            <div className="flex-1 h-1 bg-zinc-900 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(step / 4) * 100}%` }}
                className="h-full" 
                style={{ backgroundColor: primaryColor }}
              />
            </div>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Passo {step}/4</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-1"
            >
              {step === 1 && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black tracking-tighter uppercase">Escolha o Serviço</h2>
                    <p className="text-zinc-500 font-medium">O que vamos fazer hoje?</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {tenant.services.map((service: any) => (
                      <button 
                        key={service.id}
                        onClick={() => {
                          setSelection({ ...selection, serviceId: service.id });
                          setStep(2);
                        }}
                        className={cn(
                          "p-6 rounded-[24px] border text-left transition-all group relative overflow-hidden",
                          selection.serviceId === service.id 
                            ? "text-zinc-950 shadow-xl" 
                            : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
                        )}
                        style={selection.serviceId === service.id ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                      >
                        <div className="flex items-center justify-between relative z-10">
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold uppercase tracking-tight">{service.name}</h3>
                            <div className="flex items-center gap-3">
                              <span className={cn("text-[10px] font-black uppercase tracking-widest", selection.serviceId === service.id ? "text-zinc-900/60" : "text-zinc-500")}>
                                {service.duration} min
                              </span>
                            </div>
                          </div>
                          <div className="text-2xl font-black tracking-tighter">{formatCurrency(service.price)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setStep(1)} className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors">
                      <ArrowLeft className="w-4 h-4 text-zinc-400" />
                    </button>
                    <div className="space-y-1">
                      <h2 className="text-4xl font-black tracking-tighter uppercase">O Profissional</h2>
                      <p className="text-zinc-500 font-medium">Quem vai te atender?</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {tenant.barbers.map((barber: any) => (
                      <button 
                        key={barber.id}
                        onClick={() => {
                          setSelection({ ...selection, barberId: barber.id });
                          setStep(3);
                        }}
                        className={cn(
                          "p-6 rounded-[32px] border text-center transition-all group relative overflow-hidden",
                          selection.barberId === barber.id 
                            ? "text-zinc-950 shadow-xl" 
                            : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
                        )}
                        style={selection.barberId === barber.id ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                      >
                        <div className="relative z-10 space-y-4">
                          <div className={cn(
                            "w-20 h-20 rounded-full flex items-center justify-center mx-auto border-2 transition-all duration-300 group-hover:scale-105",
                            selection.barberId === barber.id ? "bg-zinc-950/10 border-zinc-950/20" : "bg-zinc-800 border-zinc-700"
                          )}>
                            <User className={cn("w-8 h-8", selection.barberId === barber.id ? "text-zinc-950" : "text-zinc-500")} />
                          </div>
                          <h3 className="text-lg font-bold uppercase tracking-tight">{barber.name}</h3>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setStep(2)} className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors">
                      <ArrowLeft className="w-4 h-4 text-zinc-400" />
                    </button>
                    <div className="space-y-1">
                      <h2 className="text-4xl font-black tracking-tighter uppercase">Data e Hora</h2>
                      <p className="text-zinc-500 font-medium">Quando fica melhor para você?</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Dia</label>
                      <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar -mx-8 px-8 lg:mx-0 lg:px-0">
                        {Array.from({ length: 14 }).map((_, i) => {
                          const date = new Date();
                          date.setDate(date.getDate() + i);
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          const dateString = `${year}-${month}-${day}`;
                          
                          const isSelected = selection.date === dateString;
                          const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
                          const dayNumber = date.getDate();

                          return (
                            <button
                              key={dateString}
                              onClick={() => setSelection({ ...selection, date: dateString, time: "" })}
                              className={cn(
                                "flex-shrink-0 w-20 p-4 rounded-[24px] border flex flex-col items-center justify-center gap-1 transition-all snap-start",
                                isSelected 
                                  ? "text-zinc-950 shadow-xl" 
                                  : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 text-zinc-400"
                              )}
                              style={isSelected ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                            >
                              <span className={cn("text-[10px] font-black uppercase tracking-widest", isSelected ? "text-zinc-900/60" : "text-zinc-500")}>
                                {dayName}
                              </span>
                              <span className="text-2xl font-black tracking-tighter">
                                {dayNumber}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selection.date && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Horário</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"].map((time) => {
                            const [year, month, day] = selection.date.split('-');
                            const selectedDateObj = new Date(Number(year), Number(month) - 1, Number(day));
                            const now = new Date();
                            const isToday = selectedDateObj.toDateString() === now.toDateString();
                            const currentHour = now.getHours();
                            const currentMinute = now.getMinutes();
                            
                            const [h, m] = time.split(':').map(Number);
                            const isPast = isToday && (h < currentHour || (h === currentHour && m <= currentMinute));
                            
                            const isBooked = bookedTimes.includes(time);
                            const isDisabled = isBooked || isPast;

                            return (
                              <button 
                                key={time}
                                disabled={isDisabled}
                                onClick={() => {
                                  setSelection({ ...selection, time });
                                  setStep(4);
                                }}
                                className={cn(
                                  "p-4 rounded-[20px] border text-sm font-black transition-all uppercase tracking-widest",
                                  isDisabled 
                                    ? "bg-zinc-900/10 border-zinc-900 text-zinc-700 cursor-not-allowed"
                                    : selection.time === time 
                                      ? "text-zinc-950 shadow-xl" 
                                      : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 text-zinc-300"
                                )}
                                style={selection.time === time ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                              >
                                {time}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setStep(3)} className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors">
                      <ArrowLeft className="w-4 h-4 text-zinc-400" />
                    </button>
                    <div className="space-y-1">
                      <h2 className="text-4xl font-black tracking-tighter uppercase">Seus Dados</h2>
                      <p className="text-zinc-500 font-medium">Para confirmarmos sua reserva.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4">Nome Completo</label>
                      <input 
                        placeholder="Como devemos te chamar?"
                        onChange={(e) => setSelection({ ...selection, clientName: e.target.value })}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 text-white outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4">WhatsApp</label>
                      <input 
                        placeholder="(00) 00000-0000"
                        onChange={(e) => setSelection({ ...selection, clientPhone: e.target.value })}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 text-white outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                    
                    <div className="pt-6">
                      <button 
                        disabled={!selection.clientName || !selection.clientPhone || loading}
                        onClick={handleBooking}
                        className="w-full text-zinc-950 font-black py-6 rounded-[24px] transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Confirmar Agendamento</span>
                            <ChevronRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
