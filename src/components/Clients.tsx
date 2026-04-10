import React from "react";
import { useAuthStore } from "@/src/store/authStore";
import { Users as UsersIcon, Plus, Search, Phone, Mail, MoreVertical, Download, UserPlus, Calendar, XCircle } from "lucide-react";
import { Modal } from "@/src/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/src/lib/utils";

export function Clients() {
  const { user, token } = useAuthStore();
  const [clients, setClients] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const fetchClients = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/clients", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-tenant-id": user?.tenant?.id || ""
        }
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchClients();
  }, [token, user?.tenant?.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      cpf: formData.get("cpf"),
    };

    try {
      const res = await fetch("/api/clients", {
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
        fetchClients();
      } else {
        alert("Erro ao cadastrar cliente.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar cliente.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja excluir o cliente ${name}?`)) return;
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-tenant-id": user?.tenant?.id || ""
        }
      });
      if (res.ok) {
        fetchClients();
      } else {
        alert("Erro ao excluir cliente.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir cliente.");
    }
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold tracking-tight text-zinc-100">Clientes</h2>
          <p className="text-zinc-500 font-medium">Gerencie sua base de clientes e histórico de fidelidade.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              const headers = ["Nome", "Telefone", "Email", "Pontos"];
              const rows = clients.map(c => [c.name, c.phone, c.email || "", c.loyaltyPoints || 0]);
              const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement("a");
              const url = URL.createObjectURL(blob);
              link.setAttribute("href", url);
              link.setAttribute("download", "clientes.csv");
              link.style.visibility = 'hidden';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-100 transition-colors"
            title="Exportar CSV"
          >
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="premium-button flex items-center gap-2 shadow-2xl shadow-white/5"
          >
            <UserPlus className="w-5 h-5" />
            <span>Novo Cliente</span>
          </button>
        </div>
      </header>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Cliente">
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome Completo</label>
            <input name="name" required className="input-field" placeholder="Ex: João Silva" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Telefone</label>
              <input name="phone" required className="input-field" placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">E-mail</label>
              <input name="email" type="email" className="input-field" placeholder="joao@email.com" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">CPF (Opcional)</label>
            <input name="cpf" className="input-field" placeholder="000.000.000-00" />
          </div>
          <button className="premium-button w-full py-4 text-lg shadow-xl shadow-white/5">
            Cadastrar Cliente
          </button>
        </form>
      </Modal>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por nome, telefone ou e-mail..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-2xl py-4 pl-12 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 outline-none transition-all"
          />
        </div>
      </div>

      <div className="glass-card border-zinc-800/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/50 text-zinc-500 text-[10px] uppercase tracking-widest font-black">
                <th className="p-6">Cliente</th>
                <th className="p-6">Informações de Contato</th>
                <th className="p-6">Status / Fidelidade</th>
                <th className="p-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {loading ? (
                <tr><td colSpan={4} className="p-20 text-center text-zinc-600 font-medium italic">Sincronizando base de dados...</td></tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-24 text-center">
                    <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-800/50">
                      <UsersIcon className="w-8 h-8 text-zinc-700" />
                    </div>
                    <p className="text-zinc-500 font-medium">Nenhum cliente encontrado.</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredClients.map((client, index) => (
                    <motion.tr 
                      key={client.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-zinc-800/20 transition-colors group"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700/30 text-zinc-100 flex items-center justify-center font-bold text-lg shadow-inner">
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-100 text-lg tracking-tight">{client.name}</p>
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-0.5">ID: {client.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="space-y-2">
                          <p className="text-sm flex items-center gap-2.5 text-zinc-300 font-medium">
                            <Phone className="w-4 h-4 text-zinc-600" /> {client.phone}
                          </p>
                          {client.email && (
                            <p className="text-xs flex items-center gap-2.5 text-zinc-500">
                              <Mail className="w-4 h-4 text-zinc-700" /> {client.email}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider bg-amber-500/10 px-2 py-1 rounded-md">
                              {client.loyaltyPoints || 0} Pontos
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                            <Calendar className="w-3 h-3" />
                            {client._count?.appointments > 0 ? `${client._count.appointments} Visitas` : "Primeira vez"}
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <button 
                          onClick={() => handleDelete(client.id, client.name)}
                          className="p-3 hover:bg-red-500/10 rounded-xl transition-all text-zinc-600 hover:text-red-500"
                          title="Excluir Cliente"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
