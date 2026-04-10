import React from "react";
import { useApi } from "@/src/hooks/useApi";
import { useAuthStore } from "@/src/store/authStore";
import { 
  CalendarCheck, 
  Clock,
  ChevronRight,
  Plus,
  Star,
  Scissors,
  MapPin,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion } from "motion/react";

export function ClientDashboard({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { fetchApi } = useApi();
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuthStore();

  React.useEffect(() => {
    fetchApi("/appointments").then((data) => {
      const myAppointments = Array.isArray(data) 
        ? data.filter((app: any) => app.clientId === user?.id)
        : [];
      setAppointments(myAppointments);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const upcomingAppointments = appointments.filter(app => {
    return new Date(app.date) > new Date() && app.status !== 'CANCELED';
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastAppointments = appointments.filter(app => app.status === 'COMPLETED')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const nextAppointment = upcomingAppointments[0];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            Bem-vindo de volta
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-100">
            Olá, <span className="text-amber-500">{user?.name?.split(' ')[0]}</span>
          </h2>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate(`/booking/${user?.tenant?.slug}`)}
          className="group relative overflow-hidden rounded-2xl bg-amber-500 px-6 py-4 text-zinc-950 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)]"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <Plus className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Novo Agendamento</span>
        </motion.button>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Next Appointment Card (Spans 8 cols on desktop) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-8 relative overflow-hidden rounded-[32px] bg-zinc-900 border border-zinc-800/50 p-8 flex flex-col justify-between min-h-[300px] group"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Próximo Agendamento</h3>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : nextAppointment ? (
            <div className="relative z-10 space-y-6">
              <div className="space-y-2">
                <h4 className="text-4xl md:text-5xl font-black text-white tracking-tight">{nextAppointment.service.name}</h4>
                <p className="text-xl text-zinc-400 font-medium flex items-center gap-2">
                  Com <span className="text-zinc-200">{nextAppointment.barber.name}</span>
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <div className="px-5 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Horário</p>
                    <p className="text-sm font-bold text-zinc-100">
                      {new Date(nextAppointment.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="px-5 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                  <CalendarCheck className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Data</p>
                    <p className="text-sm font-bold text-zinc-100">
                      {new Date(nextAppointment.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 relative z-10">
              <div className="w-16 h-16 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                <Scissors className="w-6 h-6 text-zinc-600" />
              </div>
              <div>
                <p className="text-zinc-300 font-bold text-lg">Nenhum agendamento futuro</p>
                <p className="text-zinc-500 text-sm">Que tal marcar um horário agora?</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Loyalty Points Card (Spans 4 cols on desktop) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-4 relative overflow-hidden rounded-[32px] bg-gradient-to-br from-amber-500 to-amber-700 p-8 flex flex-col justify-between min-h-[300px] text-zinc-950"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[60px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950/10 flex items-center justify-center backdrop-blur-md">
              <Star className="w-6 h-6 text-zinc-950" />
            </div>
            <span className="px-3 py-1 rounded-full bg-zinc-950/10 text-xs font-black uppercase tracking-widest backdrop-blur-md">
              Fidelidade
            </span>
          </div>

          <div className="relative z-10 space-y-2">
            <p className="text-sm font-bold uppercase tracking-widest opacity-80">Seus Pontos</p>
            <h4 className="text-6xl font-black tracking-tighter">{(user as any)?.loyaltyPoints || 0}</h4>
            <p className="text-sm font-medium opacity-80 pt-2">Acumule pontos e troque por serviços exclusivos.</p>
          </div>
        </motion.div>

        {/* History Section (Spans 12 cols) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-12 rounded-[32px] bg-zinc-900/50 border border-zinc-800/50 p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-3">
              <Clock className="w-5 h-5 text-zinc-500" />
              Histórico Recente
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-zinc-800/50 animate-pulse" />
              ))
            ) : pastAppointments.length === 0 ? (
              <div className="col-span-full py-8 text-center text-zinc-500">
                Você ainda não possui histórico de serviços.
              </div>
            ) : (
              pastAppointments.slice(0, 6).map((app, index) => (
                <div 
                  key={app.id} 
                  className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-800/50 hover:border-zinc-700 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center font-black text-zinc-500 uppercase">
                    {app.barber.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-zinc-100 truncate">{app.service.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{app.barber.name} • {new Date(app.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
