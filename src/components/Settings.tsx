import React from "react";
import { useAuthStore } from "@/src/store/authStore";
import { useApi } from "@/src/hooks/useApi";
import { Settings as SettingsIcon, Shield, CreditCard, Bell, Smartphone, Globe, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function Settings() {
  const { user, setAuth } = useAuthStore();
  const { fetchApi } = useApi();
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = React.useState("profile");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      phone: formData.get("phone"),
      logoUrl: formData.get("logoUrl"),
      backgroundUrl: formData.get("backgroundUrl"),
      primaryColor: formData.get("primaryColor"),
    };

    try {
      const updatedTenant = await fetchApi("/tenant", {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (updatedTenant.id) {
        // Update local state
        const token = localStorage.getItem("token");
        if (token) {
          setAuth({ ...user, tenant: updatedTenant }, token);
        }
        setMessage({ type: "success", text: "Configurações atualizadas com sucesso!" });
      } else {
        setMessage({ type: "error", text: updatedTenant.error || "Erro ao atualizar" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro de conexão" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-white">Configurações</h2>
        <p className="text-zinc-500">Personalize sua barbearia e gerencie sua assinatura.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="space-y-1">
          <button 
            onClick={() => setActiveTab("profile")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all",
              activeTab === "profile" ? "bg-amber-500/10 text-amber-500" : "text-zinc-400 hover:bg-zinc-900"
            )}
          >
            <SettingsIcon className="w-4 h-4" /> Perfil da Barbearia
          </button>
          <button 
            onClick={() => setActiveTab("subscription")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all",
              activeTab === "subscription" ? "bg-amber-500/10 text-amber-500" : "text-zinc-400 hover:bg-zinc-900"
            )}
          >
            <CreditCard className="w-4 h-4" /> Assinatura e Planos
          </button>
          <button 
            onClick={() => setActiveTab("notifications")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all",
              activeTab === "notifications" ? "bg-amber-500/10 text-amber-500" : "text-zinc-400 hover:bg-zinc-900"
            )}
          >
            <Bell className="w-4 h-4" /> Notificações
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all",
              activeTab === "security" ? "bg-amber-500/10 text-amber-500" : "text-zinc-400 hover:bg-zinc-900"
            )}
          >
            <Shield className="w-4 h-4" /> Segurança
          </button>
        </aside>

        <div className="lg:col-span-3 space-y-6">
          {activeTab === "profile" && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-8 text-white">Informações Gerais</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {message.text && (
                  <div className={`p-4 rounded-xl text-sm font-bold ${
                    message.type === "success" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                  }`}>
                    {message.text}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Nome da Barbearia</label>
                    <input 
                      name="name"
                      type="text" 
                      defaultValue={user?.tenant?.name}
                      required
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Slug (URL Personalizada)</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input 
                        name="slug"
                        type="text" 
                        defaultValue={user?.tenant?.slug}
                        required
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 pl-10 text-white focus:border-amber-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Telefone de Contato</label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input 
                      name="phone"
                      type="text" 
                      defaultValue={user?.tenant?.phone}
                      placeholder="(00) 00000-0000"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 pl-10 text-white focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">URL da Logo</label>
                    <input 
                      name="logoUrl"
                      type="url" 
                      defaultValue={(user?.tenant as any)?.logoUrl || ""}
                      placeholder="https://..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">URL do Fundo (Background)</label>
                    <input 
                      name="backgroundUrl"
                      type="url" 
                      defaultValue={(user?.tenant as any)?.backgroundUrl || ""}
                      placeholder="https://..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Cor Principal (Hexadecimal)</label>
                  <div className="flex gap-4">
                    <input 
                      name="primaryColor"
                      type="color" 
                      defaultValue={(user?.tenant as any)?.primaryColor || "#f59e0b"}
                      className="w-14 h-14 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input 
                      type="text" 
                      defaultValue={(user?.tenant as any)?.primaryColor || "#f59e0b"}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:border-amber-500 outline-none transition-all"
                      readOnly
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-800 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-black px-8 py-4 rounded-xl transition-all active:scale-95 flex items-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    SALVAR ALTERAÇÕES
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "subscription" && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 border-amber-500/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Seu Plano Atual</h3>
                  <p className="text-zinc-500 text-sm">Gerencie sua assinatura e limites.</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-amber-500 font-black uppercase text-lg">Plano Ativo</p>
                    <p className="text-zinc-500 text-xs">Renovação automática</p>
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        const res = await fetchApi("/stripe/create-checkout-session", { method: "POST" });
                        if (res.url) window.location.href = res.url;
                      } catch (e) {
                        alert("Erro ao iniciar checkout");
                      }
                    }}
                    className="bg-zinc-100 hover:bg-zinc-300 text-zinc-950 font-black px-6 py-3 rounded-xl transition-all active:scale-95 text-sm"
                  >
                    Gerenciar Assinatura
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center py-20">
              <Bell className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Configurações de Notificação</h3>
              <p className="text-zinc-500">Em breve você poderá configurar alertas de WhatsApp e Email.</p>
            </div>
          )}

          {activeTab === "security" && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center py-20">
              <Shield className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Segurança da Conta</h3>
              <p className="text-zinc-500">Alteração de senha e autenticação em dois fatores em breve.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
