
import React from "react";
import { useApi } from "@/src/hooks/useApi";
import { useAuthStore } from "@/src/store/authStore";
import { 
  Users, 
  Store, 
  CalendarCheck, 
  TrendingUp, 
  UserPlus,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";

export function SuperAdminDashboard() {
  const { fetchApi } = useApi();
  const { logout } = useAuthStore();
  const [stats, setStats] = React.useState<any>({ tenantsCount: 0, usersCount: 0, totalAppointments: 0 });
  const [tenants, setTenants] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Estados para o Modal de Cadastro Manual
  const [showModal, setShowModal] = React.useState(false);
  const [registering, setRegistering] = React.useState(false);

  // Função para carregar os dados
  const loadData = () => {
    Promise.all([
      fetchApi("/super/stats"),
      fetchApi("/super/tenants"),
    ]).then(([statsData, tenantsData]) => {
      setStats(statsData && !statsData.error ? statsData : { tenantsCount: 0, usersCount: 0, totalAppointments: 0 });
      setTenants(Array.isArray(tenantsData) ? tenantsData : []);
      setLoading(false);
    }).catch(() => {
      setStats({ tenantsCount: 0, usersCount: 0, totalAppointments: 0 });
      setTenants([]);
      setLoading(false);
    });
  };

  React.useEffect(() => {
    loadData();
  }, []);

  // Função que envia o formulário para criar a Barbearia
  const handleManualRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegistering(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    try {
      const res = await fetchApi('/super/tenants/manual', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (!res.error) {
        alert("Novo parceiro cadastrado com sucesso!");
        setShowModal(false);
        loadData(); // Atualiza a lista automaticamente
      } else {
        alert(res.error);
      }
    } catch (error) {
      alert("Erro ao conectar com o servidor.");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-amber-500 animate-pulse font-black text-2xl tracking-tighter uppercase">Painel Admin</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho com o botão de Cadastro */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Visão Geral</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-amber-500 text-zinc-950 px-6 py-3 rounded-2xl font-black uppercase text-xs hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
        >
          <UserPlus size={18} />
          Novo Parceiro Manual
        </button>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Store} label="Barbearias Ativas" value={stats.tenantsCount} color="text-amber-500" bg="bg-amber-500/10" />
        <StatCard icon={Users} label="Usuários Totais" value={stats.usersCount} color="text-blue-500" bg="bg-blue-500/10" />
        <StatCard icon={CalendarCheck} label="Agendamentos Totais" value={stats.totalAppointments} color="text-emerald-500" bg="bg-emerald-500/10" />
      </div>

      {/* Modal de Cadastro */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 p-8 rounded-[40px] max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase">Parceiro "Offline"</h2>
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Store className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            
            <form onSubmit={handleManualRegister} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Dados da Barbearia</label>
                <input name="businessName" placeholder="Nome da Barbearia (Ex: Barber Pro)" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-colors" required />
                <input name="slug" placeholder="Link (Ex: barber-pro)" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-colors" required />
              </div>

              <div className="h-[1px] bg-zinc-800 my-4" />

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Dados do Dono</label>
                <input name="ownerName" placeholder="Nome do Dono" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-colors" required />
                <input name="ownerEmail" type="email" placeholder="E-mail de Acesso" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-colors" required />
                <input name="ownerPassword" type="password" placeholder="Senha Provisória" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-colors" required />
              </div>
              
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 text-zinc-500 font-bold uppercase text-xs hover:text-zinc-300 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={registering} className="flex-1 bg-amber-500 text-zinc-950 px-4 py-3 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-amber-400 transition-colors disabled:opacity-50">
                  {registering ? <Loader2 className="animate-spin" size={16} /> : "Ativar Barbearia"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Tenants List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            Barbearias na Plataforma
          </h2>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{tenants.length} Registradas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-950/50 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Barbearia</th>
                <th className="px-6 py-4">Slug / Link</th>
                <th className="px-6 py-4">Barbeiros</th>
                <th className="px-6 py-4">Agendamentos</th>
                <th className="px-6 py-4">Status Plano</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center font-bold text-amber-500 uppercase">
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white">{tenant.name}</p>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Desde {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <a href={`/booking/${tenant.slug}`} target="_blank" className="text-xs text-amber-500 hover:underline font-bold">
                      /booking/{tenant.slug}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-white">{tenant._count.barbers}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-white">{tenant._count.appointments}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-full uppercase">
                      Ativo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${bg}`}>
        <Icon className={`w-7 h-7 ${color}`} />
      </div>
      <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">{label}</p>
      <h4 className="text-4xl font-black mt-2 text-white tracking-tighter">{value}</h4>
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 -mr-12 -mt-12 rounded-full ${bg}`} />
    </motion.div>
  );
}