import React from "react";
import { useAuthStore } from "@/src/store/authStore";
import { Scissors, Plus, Clock, DollarSign, Tag, MoreVertical, Sparkles, Zap, XCircle } from "lucide-react";
import { formatCurrency } from "@/src/lib/utils";
import { Modal } from "@/src/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/src/lib/utils";

export function Services() {
  const { user, token } = useAuthStore();
  const [services, setServices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const fetchServices = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/services", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-tenant-id": user?.tenant?.id || ""
        }
      });
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchServices();
  }, [token, user?.tenant?.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      price: Number(formData.get("price")),
      duration: Number(formData.get("duration")),
      description: formData.get("description"),
    };

    try {
      const res = await fetch("/api/services", {
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
        fetchServices();
      } else {
        alert("Erro ao cadastrar serviço.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar serviço.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja excluir o serviço ${name}?`)) return;
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-tenant-id": user?.tenant?.id || ""
        }
      });
      if (res.ok) {
        fetchServices();
      } else {
        alert("Erro ao excluir serviço.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir serviço.");
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold tracking-tight text-zinc-100">Serviços</h2>
          <p className="text-zinc-500 font-medium">Configure seu cardápio de serviços premium e experiências.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="premium-button flex items-center gap-2 shadow-2xl shadow-white/5"
        >
          <Sparkles className="w-5 h-5" />
          <span>Novo Serviço</span>
        </button>
      </header>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Serviço">
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome do Serviço</label>
            <input name="name" required className="input-field" placeholder="Ex: Corte Moderno + Barba" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Preço (R$)</label>
              <input name="price" type="number" step="0.01" required className="input-field" placeholder="0,00" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Duração (min)</label>
              <input name="duration" type="number" required defaultValue="30" className="input-field" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Descrição</label>
            <textarea name="description" className="input-field h-24 resize-none" placeholder="O que está incluso neste serviço?" />
          </div>
          <button className="premium-button w-full py-4 text-lg shadow-xl shadow-white/5">
            Cadastrar Serviço
          </button>
        </form>
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center text-zinc-600 font-medium italic glass-card">Sincronizando cardápio...</div>
        ) : services.length === 0 ? (
          <div className="col-span-full py-24 text-center glass-card border-dashed border-zinc-800/50">
            <Tag className="w-12 h-12 text-zinc-800 mx-auto mb-4 opacity-50" />
            <p className="text-zinc-500 font-medium">Nenhum serviço cadastrado ainda.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {services.map((service, index) => (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-8 hover:border-zinc-700/50 transition-all group relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <Scissors className="w-7 h-7 text-zinc-100" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-zinc-100 tracking-tighter">{formatCurrency(service.price)}</p>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">Valor do Serviço</p>
                  </div>
                </div>

                <div className="space-y-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold text-zinc-100 tracking-tight">{service.name}</h3>
                    {index === 0 && <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" />}
                  </div>
                  <p className="text-sm text-zinc-500 font-medium leading-relaxed line-clamp-2">
                    {service.description || "Uma experiência completa de cuidado e estilo para o homem moderno."}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-800/50 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    <Clock className="w-4 h-4 text-zinc-600" />
                    <span>{service.duration} Minutos</span>
                  </div>
                  <button 
                    onClick={() => handleDelete(service.id, service.name)}
                    className="p-2 text-zinc-700 hover:text-red-500 transition-colors"
                    title="Excluir Serviço"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                {/* Decorative background element */}
                <div className="absolute -left-12 -top-12 w-40 h-40 bg-zinc-800/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
