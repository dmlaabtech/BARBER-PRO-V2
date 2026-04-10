import React from "react";
import { useAuthStore } from "@/src/store/authStore";
import { Scissors, Lock, Mail, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function Login({ onRegister }: { onRegister: () => void }) {
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      setError("Por favor, preencha todos os campos");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setAuth(data.user, data.token);
      } else {
        setError(data.error || "E-mail ou senha incorretos");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor. Verifique sua internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-zinc-900/50 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-zinc-800/10 rounded-full blur-3xl opacity-50" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-zinc-100 border border-zinc-200 shadow-2xl mb-2 rotate-3"
          >
            <Scissors className="w-10 h-10 text-zinc-950 -rotate-3" />
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-zinc-100 tracking-tighter uppercase leading-none">BarberPro</h1>
            <p className="text-zinc-500 font-medium tracking-tight text-sm uppercase tracking-[0.2em]">Acesso Restrito</p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-10 rounded-[40px] shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">E-mail de Acesso</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-zinc-100 transition-colors" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-4 pl-12 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-800 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Senha</label>
                <button 
                  type="button"
                  onClick={() => window.location.href = "/forgot-password"}
                  className="text-[10px] font-black text-zinc-500 hover:text-zinc-100 uppercase tracking-widest transition-colors"
                >
                  Esqueci a senha
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-zinc-100 transition-colors" />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-4 pl-12 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-800 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-100 hover:bg-zinc-300 text-zinc-950 font-black py-5 rounded-2xl transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-white/5 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Entrar no Sistema
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center space-y-6">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
              Ainda não é parceiro?{" "}
              <button 
                onClick={onRegister}
                className="text-zinc-100 hover:underline transition-all"
              >
                Adquirir Plano
              </button>
            </p>
            
            <button 
              onClick={() => window.location.href = "/"}
              className="text-zinc-600 hover:text-zinc-100 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
              <span>Voltar ao Início</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}