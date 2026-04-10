import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scissors, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.error || 'Ocorreu um erro ao tentar recuperar a senha.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Erro de conexão. Tente novamente mais tarde.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl relative z-10"
      >
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-8 mt-4">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4 border border-amber-500/20">
            <Scissors className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Recuperar Senha</h1>
          <p className="text-zinc-400 text-sm mt-2 text-center">
            Digite seu e-mail para receber um link de redefinição de senha.
          </p>
        </div>

        {status === 'success' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center"
          >
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-emerald-500 font-medium mb-2">E-mail Enviado!</h3>
            <p className="text-zinc-300 text-sm mb-6">
              {message}
            </p>
            <button
              onClick={onBack}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-medium transition-colors"
            >
              Voltar para o Login
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {status === 'error' && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
