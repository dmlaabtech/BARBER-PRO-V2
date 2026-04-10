import React from "react";
import { useApi } from "@/src/hooks/useApi";
import { useAuthStore } from "@/src/store/authStore";
import { 
  Users, 
  CalendarCheck, 
  TrendingUp, 
  Clock,
  ChevronRight,
  Plus,
  ExternalLink,
  Copy,
  Check,
  MessageCircle
} from "lucide-react";
import { cn, formatCurrency } from "@/src/lib/utils";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export function Dashboard({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { fetchApi } = useApi();
  const [stats, setStats] = React.useState({
    appointmentsCount: 0,
    clientsCount: 0,
    revenue: 0,
    revenueByBarber: [],
    revenueByDay: []
  });
  const [recentAppointments, setRecentAppointments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    Promise.all([
      fetchApi("/dashboard/stats"),
      fetchApi("/appointments"),
    ]).then(([statsData, appointmentsData]) => {
      setStats(statsData || { appointmentsCount: 0, clientsCount: 0, revenue: 0, revenueByBarber: [], revenueByDay: [] });
      
      const today = new Date();
      const todaysAppointments = Array.isArray(appointmentsData) 
        ? appointmentsData.filter(app => {
            const appDate = new Date(app.date);
            return appDate.toDateString() === today.toDateString() && 
                   app.status !== 'COMPLETED' && 
                   app.status !== 'CANCELED';
          }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        : [];
        
      setRecentAppointments(todaysAppointments.slice(0, 5));
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const { user } = useAuthStore();
  const bookingUrl = `${window.location.origin}/booking/${user?.tenant?.slug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = (clientName: string, clientPhone: string, time: string) => {
    const message = `Olá ${clientName}! Passando para confirmar seu agendamento hoje às ${time} na barbearia. Podemos confirmar?`;
    const encodedMessage = encodeURIComponent(message);
    const phone = clientPhone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold tracking-tight text-zinc-100">
            Olá, <span className="text-zinc-400">{user?.name?.split(' ')[0]}</span>
          </h2>
          <p className="text-zinc-500 font-medium">Aqui está o resumo da sua barbearia para hoje.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="glass-card px-5 py-3 flex items-center gap-4 border-zinc-800/30">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Link de Agendamento</p>
              <p className="text-xs font-mono text-zinc-300 truncate max-w-[180px]">{bookingUrl}</p>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={copyToClipboard}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-zinc-100"
                title="Copiar link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <a 
                href={bookingUrl} 
                target="_blank" 
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-zinc-100"
                title="Abrir link"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <button 
            onClick={() => onNavigate("/agenda")}
            className="premium-button flex items-center gap-2 shadow-2xl shadow-white/5"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={TrendingUp} 
          label="Receita Bruta" 
          value={formatCurrency(stats.revenue)} 
          trend="+12.5%"
          color="text-zinc-100"
          bg="bg-zinc-900"
        />
        <StatCard 
          icon={CalendarCheck} 
          label="Agendamentos" 
          value={stats.appointmentsCount} 
          trend="+5 hoje"
          color="text-zinc-100"
          bg="bg-zinc-900"
        />
        <StatCard 
          icon={Users} 
          label="Novos Clientes" 
          value={stats.clientsCount} 
          trend="+3 essa semana"
          color="text-zinc-100"
          bg="bg-zinc-900"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 border-zinc-800/30">
          <h3 className="text-lg font-bold mb-6 text-zinc-100">Faturamento (Últimos 7 dias)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueByDay}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#f59e0b' }}
                  formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 border-zinc-800/30">
          <h3 className="text-lg font-bold mb-6 text-zinc-100">Desempenho por Barbeiro</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenueByBarber} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#10b981' }}
                  formatter={(value: number) => [formatCurrency(value), 'Receita']}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 glass-card p-8 border-zinc-800/30">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="text-xl font-bold flex items-center gap-2">
                Próximos Clientes
              </h3>
              <p className="text-sm text-zinc-500">Seus agendamentos confirmados para hoje.</p>
            </div>
            <button 
              onClick={() => onNavigate("/agenda")}
              className="text-sm font-bold text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-1 group"
            >
              Ver agenda completa
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          
          <div className="space-y-3">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-600 gap-3">
                <div className="w-8 h-8 border-2 border-zinc-800 border-t-zinc-400 rounded-full animate-spin" />
                <p className="text-sm font-medium">Sincronizando agenda...</p>
              </div>
            ) : recentAppointments.length === 0 ? (
              <div className="py-20 text-center glass-card border-dashed border-zinc-800/50">
                <CalendarCheck className="w-10 h-10 text-zinc-800 mx-auto mb-4" />
                <p className="text-zinc-500 font-medium">Nenhum agendamento para hoje.</p>
              </div>
            ) : (
              recentAppointments.map((app, index) => {
                const timeStr = new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                return (
                  <motion.div 
                    key={app.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/30 hover:border-zinc-700/50 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-lg font-bold text-zinc-100 uppercase group-hover:bg-zinc-700 transition-colors">
                        {app.client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-100">{app.client.name}</p>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                          <span className="text-zinc-400">{app.service.name}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeStr}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {app.client.phone && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWhatsApp(app.client.name, app.client.phone, timeStr);
                          }}
                          className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors"
                          title="Confirmar via WhatsApp"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                      )}
                      <span className={cn(
                        "px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider",
                        app.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-500" : 
                        app.status === 'CANCELED' ? "bg-red-500/10 text-red-500" :
                        "bg-amber-500/10 text-amber-500"
                      )}>
                        {app.status === 'COMPLETED' ? 'Concluído' : 
                         app.status === 'CANCELED' ? 'Cancelado' : 'Pendente'}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          <div className="bg-zinc-100 rounded-3xl p-8 text-zinc-950 relative overflow-hidden group h-full flex flex-col justify-between min-h-[320px]">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-zinc-100" />
              </div>
              <h3 className="text-2xl font-bold leading-tight mb-3 tracking-tight">Impulsione seu faturamento</h3>
              <p className="text-zinc-600 font-medium text-sm leading-relaxed">
                Crie campanhas de fidelidade e cupons de desconto para seus clientes recorrentes.
              </p>
            </div>
            <button 
              onClick={() => onNavigate("/configuracoes")}
              className="relative z-10 w-full bg-zinc-950 text-zinc-100 py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all active:scale-[0.98] mt-8"
            >
              Começar agora
            </button>
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-zinc-200 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700" />
          </div>

          <div className="glass-card p-6 border-zinc-800/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Dica do Dia</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed font-medium">
              "Lembretes via WhatsApp reduzem faltas em até 80%. Ative as notificações automáticas nas configurações."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, color, bg }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={cn("glass-card p-8 relative overflow-hidden group transition-all border-zinc-800/30", bg)}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-2xl bg-zinc-800/50 border border-zinc-700/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <Icon className={cn("w-6 h-6 text-zinc-100")} />
        </div>
        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
          {trend}
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">{label}</p>
        <h4 className="text-3xl font-bold tracking-tight text-zinc-100">{value}</h4>
      </div>
      
      {/* Decorative element */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-zinc-800/20 rounded-full blur-2xl group-hover:bg-zinc-700/30 transition-colors" />
    </motion.div>
  );
}
