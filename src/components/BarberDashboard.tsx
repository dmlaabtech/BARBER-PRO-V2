import React from "react";
import { useApi } from "@/src/hooks/useApi";
import { useAuthStore } from "@/src/store/authStore";
import { 
  CalendarCheck, 
  Clock,
  ChevronRight,
  DollarSign
} from "lucide-react";
import { cn, formatCurrency } from "@/src/lib/utils";
import { motion } from "framer-motion";

export function BarberDashboard() {
  const { fetchApi } = useApi();
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuthStore();

  React.useEffect(() => {
    fetchApi("/appointments").then((data) => {
      // Filter appointments for this barber
      const myAppointments = Array.isArray(data) 
        ? data.filter((app: any) => app.barberId === user?.id)
        : [];
      setAppointments(myAppointments);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const todayAppointments = appointments.filter(app => {
    const today = new Date().toDateString();
    return new Date(app.date).toDateString() === today;
  });

  const totalCommission = appointments
    .filter(app => app.status === 'COMPLETED')
    .reduce((acc, app) => acc + (Number(app.totalPrice) * 0.3), 0); // Mock 30% commission

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <h2 className="text-4xl font-bold tracking-tight text-zinc-100">
          Olá, <span className="text-zinc-400">{user?.name?.split(' ')[0]}</span>
        </h2>
        <p className="text-zinc-500 font-medium">Sua agenda e comissões para hoje.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-8 border-zinc-800/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center">
              <CalendarCheck className="w-6 h-6 text-zinc-100" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Agendamentos Hoje</p>
              <h4 className="text-3xl font-bold text-zinc-100">{todayAppointments.length}</h4>
            </div>
          </div>
        </div>
        <div className="glass-card p-8 border-zinc-800/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-zinc-100" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Comissão Estimada</p>
              <h4 className="text-3xl font-bold text-zinc-100">{formatCurrency(totalCommission)}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 border-zinc-800/30">
        <h3 className="text-xl font-bold mb-6">Sua Agenda de Hoje</h3>
        <div className="space-y-3">
          {loading ? (
            <div className="py-12 text-center text-zinc-500">Carregando agenda...</div>
          ) : todayAppointments.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">Nenhum agendamento para hoje.</div>
          ) : (
            todayAppointments.map((app, index) => (
              <motion.div 
                key={app.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-zinc-100 uppercase">
                    {app.client.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-zinc-100">{app.client.name}</p>
                    <p className="text-xs text-zinc-500">{app.service.name} • {new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <span className={cn(
                  "px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider",
                  app.status === 'CONFIRMED' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                )}>
                  {app.status}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
