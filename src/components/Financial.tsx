import React from "react";
import { useAuthStore } from "@/src/store/authStore";
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Wallet, Calendar, Plus, TrendingUp, TrendingDown, PieChart, MoreVertical, Sparkles, Activity } from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/src/lib/utils";
import { Modal } from "@/src/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from "recharts";

export function Financial() {
  const { user, token } = useAuthStore();
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const fetchTransactions = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/financial/transactions", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-tenant-id": user?.tenant?.id || ""
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTransactions();
  }, [token, user?.tenant?.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      description: formData.get("description"),
      amount: Number(formData.get("amount")),
      type: formData.get("type"),
    };

    try {
      const res = await fetch("/api/financial/transactions", {
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
        fetchTransactions();
      } else {
        alert("Erro ao cadastrar transação.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar transação.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja excluir esta transação?")) return;
    try {
      const res = await fetch(`/api/financial/transactions/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-tenant-id": user?.tenant?.id || ""
        }
      });
      if (res.ok) {
        fetchTransactions();
      } else {
        alert("Erro ao excluir transação.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir transação.");
    }
  };

  const income = transactions.filter(t => t.type === "INCOME").reduce((acc, t) => acc + Number(t.amount), 0);
  const expense = transactions.filter(t => t.type === "EXPENSE").reduce((acc, t) => acc + Number(t.amount), 0);
  const balance = income - expense;

  const chartData = [
    { name: "Entradas", value: income, color: "#10b981" },
    { name: "Saídas", value: expense, color: "#ef4444" },
  ];

  // Mock data for a more interesting chart
  const areaData = [
    { name: "Seg", income: 400, expense: 240 },
    { name: "Ter", income: 300, expense: 139 },
    { name: "Qua", income: 200, expense: 980 },
    { name: "Qui", income: 278, expense: 390 },
    { name: "Sex", income: 189, expense: 480 },
    { name: "Sáb", income: 239, expense: 380 },
    { name: "Dom", income: 349, expense: 430 },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold tracking-tight text-zinc-100">Financeiro</h2>
          <p className="text-zinc-500 font-medium">Controle seu fluxo de caixa, lucros e saúde financeira.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="premium-button flex items-center gap-2 shadow-2xl shadow-white/5"
        >
          <Sparkles className="w-5 h-5" />
          <span>Nova Transação</span>
        </button>
      </header>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Transação">
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Descrição</label>
            <input name="description" required placeholder="Ex: Aluguel, Compra de material..." className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Valor (R$)</label>
              <input name="amount" type="number" step="0.01" required className="input-field" placeholder="0,00" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tipo</label>
              <select name="type" required className="input-field appearance-none">
                <option value="INCOME">Entrada (Receita)</option>
                <option value="EXPENSE">Saída (Despesa)</option>
              </select>
            </div>
          </div>
          <button className="premium-button w-full py-4 text-lg shadow-xl shadow-white/5">
            Registrar Transação
          </button>
        </form>
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 border-emerald-500/10 bg-emerald-500/[0.01]"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Entradas</p>
              <h4 className="text-3xl font-bold text-zinc-100 tracking-tighter">{formatCurrency(income)}</h4>
            </div>
          </div>
          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[70%]" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 border-red-500/10 bg-red-500/[0.01]"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Saídas</p>
              <h4 className="text-3xl font-bold text-zinc-100 tracking-tighter">{formatCurrency(expense)}</h4>
            </div>
          </div>
          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 w-[40%]" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8 border-zinc-700/30 shadow-2xl shadow-white/5"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-zinc-100" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Saldo Geral</p>
              <h4 className="text-3xl font-bold text-zinc-100 tracking-tighter">{formatCurrency(balance)}</h4>
            </div>
          </div>
          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-zinc-100 w-[85%]" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8 border-zinc-800/30">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-zinc-500" />
              <h3 className="text-xl font-bold text-zinc-100 tracking-tight">Análise de Fluxo</h3>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.5} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `R$ ${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "16px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}
                  itemStyle={{ fontWeight: "bold", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 border-zinc-800/30">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <PieChart className="w-5 h-5 text-zinc-500" />
              <h3 className="text-xl font-bold text-zinc-100 tracking-tight">Recentes</h3>
            </div>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="py-10 text-center text-zinc-600 font-medium italic">Sincronizando...</div>
            ) : transactions.length === 0 ? (
              <div className="py-10 text-center text-zinc-600 font-medium italic">Nenhuma transação.</div>
            ) : (
              <AnimatePresence mode="popLayout">
                {transactions.slice(0, 6).map((t, index) => (
                  <motion.div 
                    key={t.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-zinc-800/20 rounded-2xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner",
                        t.type === "INCOME" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {t.type === "INCOME" ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-100 truncate max-w-[100px] tracking-tight">{t.description}</p>
                        <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mt-0.5">{formatDate(t.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-bold text-sm tracking-tight",
                        t.type === "INCOME" ? "text-emerald-500" : "text-red-500"
                      )}>
                        {t.type === "INCOME" ? "+" : "-"}{formatCurrency(t.amount)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
