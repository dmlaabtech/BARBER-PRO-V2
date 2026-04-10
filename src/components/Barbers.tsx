import React from "react";
import { useAuthStore } from "@/src/store/authStore";
import { Scissors, Plus, Star, Clock, DollarSign, MoreVertical, Shield, UserCheck, XCircle } from "lucide-react";
import { formatCurrency } from "@/src/lib/utils";
import { Modal } from "@/src/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/src/lib/utils";

export function Barbers() {
  const { user, token } = useAuthStore();
  const [barbers, setBarbers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const fetchBarbers = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/barbers", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-tenant-id": user?.tenant?.id || ""
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBarbers(data);
      }
    } catch (error) {
      console.error("Erro ao buscar barbeiros:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBarbers();
  }, [token, user?.tenant?.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      commission: Number(formData.get("commission")),
      bio: formData.get("bio"),
    };

    try {
      const res = await fetch("/api/barbers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-tenant-id": user?.tenant?.id || ""
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchBarbers();
      } else {
        alert("Erro ao cadastrar barbeiro.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar barbeiro.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja remover o profissional ${name}?`)) return;
    try {
      const res = await fetch(`/api/barbers/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-tenant-id": user?.tenant?.id || ""
        }
      });
      if (res.ok) {
        fetchBarbers();
      } else {
        alert("Erro ao excluir barbeiro.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir barbeiro.");
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold tracking-tight text-zinc-100">Barbeiros</h2>
          <p className="text-zinc-500 font-medium">Sua equipe de profissionais de elite e especialistas.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="premium-button flex items-center gap-2 shadow-2xl shadow-white/5"
        >
          <UserCheck className="w-5 h-5" />
          <span>Novo Profissional</span>
        </button>
      </header>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Barbeiro">
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome do Profissional</label>
            <input name="name" required className="input-field" placeholder="Ex: Carlos Oliveira" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Comissão (%)</label>
            <input name="commission" type="number" required defaultValue="50" className="input-field" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Biografia / Especialidades</label>
            <textarea name="bio" className="input-field h-24 resize-none" placeholder="Conte um pouco sobre a experiência..." />
          </div>
          <button className="premium-button w-full py-4 text-lg shadow-xl shadow-white/5">
            Cadastrar Profissional
          </button>
        </form>
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center text-zinc-600 font-medium italic glass-card">Sincronizando equipe...</div>
        ) : barbers.length === 0 ? (
          <div className="col-span-full py-24 text-center glass-card border-dashed border-zinc-800/50">
            <Scissors className="w-12 h-12 text-zinc-800 mx-auto mb-4 opacity-50" />
            <p className="text-zinc-500 font-medium">Nenhum barbeiro cadastrado ainda.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {barbers.map((barber, index) => (
              <motion.div 
                key={barber.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 hover:border-zinc-700/50 transition-all group relative overflow-hidden"
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className="w-20 h-20 rounded-3xl bg-zinc-800 border-2 border-zinc-700/50 group-hover:border-zinc-500 transition-colors flex items-center justify-center overflow-hidden shadow-2xl">
                    {barber.photoUrl ? (
                      <img src={barber.photoUrl} alt={barber.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Scissors className="w-10 h-10 text-zinc-600" />
                    )}
                  </div>
                  <button 
                    onClick={() => handleDelete(barber.id, barber.name)}
                    className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                    title="Remover Profissional"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-6 space-y-1 relative z-10">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold text-zinc-100 tracking-tight">{barber.name}</h3>
                    <Shield className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-current" />
                    ))}
                    <span className="text-[10px] font-black ml-1 uppercase tracking-widest opacity-80">Top Rated</span>
                  </div>
                </div>

                <p className="mt-4 text-sm text-zinc-500 line-clamp-2 font-medium leading-relaxed italic relative z-10">
                  "{barber.bio || "Especialista em cortes modernos e barboterapia clássica."}"
                </p>

                <div className="mt-8 pt-6 border-t border-zinc-800/50 grid grid-cols-2 gap-4 relative z-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Comissão</p>
                    <p className="text-lg font-bold text-emerald-500">{Number(barber.commission)}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Atendimentos</p>
                    <p className="text-lg font-bold text-zinc-100">128</p>
                  </div>
                </div>

                {/* Decorative background element */}
                <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-zinc-800/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
