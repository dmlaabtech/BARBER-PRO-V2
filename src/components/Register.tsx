import React, { useEffect } from "react";
import { useApi } from "@/src/hooks/useApi";
import { Scissors, User, Mail, Lock, Store, ArrowLeft, Loader2, AlertCircle, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/src/lib/utils";

export function Register({ onLogin }: { onLogin: () => void }) {
  const { fetchApi } = useApi();
  const [loading, setLoading] = React.useState(false);
  const [verifying, setVerifying] = React.useState(true);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [sessionValid, setSessionValid] = React.useState(false);
  const [prefilledEmail, setPrefilledEmail] = React.useState("");

  const sessionId = new URLSearchParams(window.location.search).get("session_id");

  useEffect(() => {
    if (!sessionId) {
      setVerifying(false);
      return;
    }

    const verifySession = async () => {
      try {
        const response = await fetchApi(`/verify-session/${sessionId}`);
        if (response.valid) {
          setSessionValid(true);
          setPrefilledEmail(response.email);
        } else {
          setError(response.error || "Sessão de pagamento inválida");
        }
      } catch (err) {
        setError("Erro ao verificar pagamento");
      } finally {
        setVerifying(false);
      }
    };

    verifySession();
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...data, sessionId }),
      });
      setSuccess(true);
      setTimeout(() => onLogin(), 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao realizar cadastro");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-100" />
      </div>
    );
  }

  if (!sessionId || !sessionValid) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-zinc-900/50 to-transparent pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass-card p-12 max-w-md w-full text-center space-y-8 relative z-10"
        >
          <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto border border-red-500/20 shadow-2xl shadow-red-500/10">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">Acesso Restrito</h2>
            <p className="text-zinc-500 font-medium leading-relaxed">
              Para se cadastrar no <span className="text-zinc-100">BarberPro Premium</span>, você precisa primeiro escolher um plano e realizar o pagamento.
            </p>
          </div>
          <div className="space-y-4 pt-4">
            <button 
              onClick={() => window.location.href = "/pricing"}
              className="premium-button w-full py-5 text-lg shadow-2xl shadow-white/5"
            >
              <Sparkles className="w-5 h-5" />
              <span>Ver Planos e Preços</span>
            </button>
            <button 
              onClick={onLogin}
              className="text-zinc-600 hover:text-zinc-100 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> 
              <span>Voltar para o Login</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 max-w-md w-full text-center space-y-6"
        >
          <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">Sucesso Total!</h2>
            <p className="text-zinc-500 font-medium">Sua barbearia foi criada com sucesso. Redirecionando para o login...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-zinc-900/50 to-transparent pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 max-w-md w-full shadow-2xl relative z-10"
      >
        <div className="text-center mb-10 space-y-4">
          <div className="w-20 h-20 bg-zinc-100/5 rounded-3xl flex items-center justify-center mx-auto border border-zinc-100/10 shadow-2xl">
            <Scissors className="w-10 h-10 text-zinc-100" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-zinc-100 tracking-tighter uppercase">Finalizar Cadastro</h1>
            <p className="text-zinc-500 font-medium">Pagamento confirmado! Configure sua barbearia.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2 ml-1">
              <Store className="w-3 h-3" /> Nome da Barbearia
            </label>
            <input 
              name="shopName"
              required 
              placeholder="Ex: Barber Shop Premium"
              className="input-field"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2 ml-1">
              <User className="w-3 h-3" /> Seu Nome
            </label>
            <input 
              name="name"
              required 
              placeholder="Seu nome completo"
              className="input-field"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2 ml-1">
              <Mail className="w-3 h-3" /> E-mail
            </label>
            <input 
              name="email"
              type="email" 
              required 
              readOnly={!!prefilledEmail}
              defaultValue={prefilledEmail}
              placeholder="seu@email.com"
              className={cn(
                "input-field",
                prefilledEmail && "opacity-50 cursor-not-allowed"
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2 ml-1">
              <Lock className="w-3 h-3" /> Senha de Acesso
            </label>
            <input 
              name="password"
              type="password" 
              required 
              placeholder="••••••••"
              className="input-field"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-500 text-[10px] font-black text-center bg-red-500/10 p-4 rounded-2xl border border-red-500/20 uppercase tracking-widest"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            disabled={loading}
            className="premium-button w-full py-5 text-lg shadow-2xl shadow-white/5 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Ativar Minha Conta
              </span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
