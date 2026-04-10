import React from "react";
import { useAuthStore } from "@/src/store/authStore";
import { ShoppingCart, Plus, Receipt, User, Calendar, Tag, CreditCard, Wallet, Banknote, QrCode, MoreVertical, Sparkles, Package, XCircle } from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/src/lib/utils";
import { Modal } from "@/src/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

export function Sales() {
  const { user, token } = useAuthStore();
  const [sales, setSales] = React.useState<any[]>([]);
  const [products, setProducts] = React.useState<any[]>([]);
  const [clients, setClients] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const fetchData = async () => {
    if (!token) return;
    try {
      const headers = {
        "Authorization": `Bearer ${token}`,
        "x-tenant-id": user?.tenant?.id || ""
      };

      const [salesRes, productsRes, clientsRes] = await Promise.all([
        fetch("/api/sales", { headers }),
        fetch("/api/products", { headers }),
        fetch("/api/clients", { headers })
      ]);

      if (salesRes.ok) setSales(await salesRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
      if (clientsRes.ok) setClients(await clientsRes.json());
    } catch (error) {
      console.error("Erro ao buscar dados de vendas:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [token, user?.tenant?.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;

    const formData = new FormData(e.currentTarget);
    const productId = formData.get("productId") as string;
    const quantity = Number(formData.get("quantity"));
    const product = products.find(p => p.id === productId);

    if (!product) return;

    const data = {
      total: Number(product.price) * quantity,
      paymentType: formData.get("paymentType"),
      clientId: formData.get("clientId") || null,
      items: [
        {
          productId,
          quantity,
          price: product.price,
        }
      ],
    };

    try {
      const res = await fetch("/api/sales", {
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
        fetchData();
      } else {
        alert("Erro ao cadastrar venda.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar venda.");
    }
  };

  const handleDeleteSale = async (id: string) => {
    if (!confirm(`Deseja excluir esta venda?`)) return;
    try {
      const res = await fetch(`/api/sales/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-tenant-id": user?.tenant?.id || ""
        }
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Erro ao excluir venda.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir venda.");
    }
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case "PIX": return <QrCode className="w-4 h-4" />;
      case "CREDIT": return <CreditCard className="w-4 h-4" />;
      case "DEBIT": return <Wallet className="w-4 h-4" />;
      case "CASH": return <Banknote className="w-4 h-4" />;
      default: return <Receipt className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold tracking-tight text-zinc-100">Vendas</h2>
          <p className="text-zinc-500 font-medium">Histórico de faturamento e ponto de venda (PDV).</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="premium-button flex items-center gap-2 shadow-2xl shadow-white/5"
        >
          <Sparkles className="w-5 h-5" />
          <span>Nova Venda</span>
        </button>
      </header>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ponto de Venda (PDV)">
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Produto / Item</label>
            <select name="productId" required className="input-field appearance-none">
              <option value="">Selecione um produto</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} - {formatCurrency(p.price)} ({p.stock} em estoque)
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Quantidade</label>
              <input name="quantity" type="number" required defaultValue="1" min="1" className="input-field" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Método de Pagamento</label>
              <select name="paymentType" required className="input-field appearance-none">
                <option value="PIX">PIX</option>
                <option value="CASH">Dinheiro</option>
                <option value="CREDIT">Cartão de Crédito</option>
                <option value="DEBIT">Cartão de Débito</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Cliente (Opcional)</label>
            <select name="clientId" className="input-field appearance-none">
              <option value="">Consumidor Final</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button className="premium-button w-full py-4 text-lg shadow-xl shadow-white/5">
            Finalizar Venda
          </button>
        </form>
      </Modal>

      <div className="glass-card border-zinc-800/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/50 text-zinc-500 text-[10px] uppercase tracking-widest font-black">
                <th className="p-6">ID / Data da Venda</th>
                <th className="p-6">Cliente</th>
                <th className="p-6">Pagamento</th>
                <th className="p-6">Resumo</th>
                <th className="p-6 text-right">Valor Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center text-zinc-600 font-medium italic">Sincronizando vendas...</td></tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-24 text-center">
                    <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-800/50">
                      <Receipt className="w-8 h-8 text-zinc-700" />
                    </div>
                    <p className="text-zinc-500 font-medium">Nenhuma venda registrada ainda.</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {sales.map((sale, index) => (
                    <motion.tr 
                      key={sale.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-zinc-800/20 transition-colors group"
                    >
                      <td className="p-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">#{sale.id.slice(0, 8)}</p>
                          <div className="flex items-center gap-2 text-zinc-100 font-bold">
                            <Calendar className="w-4 h-4 text-zinc-600" />
                            <span className="text-sm">{formatDate(sale.createdAt)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/30 flex items-center justify-center text-zinc-500">
                            <User className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-zinc-100 tracking-tight">{sale.client?.name || "Consumidor Final"}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/30 rounded-lg w-fit">
                          <span className="text-zinc-500">{getPaymentIcon(sale.paymentType)}</span>
                          <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                            {sale.paymentType}
                          </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-zinc-500">
                          <Package className="w-4 h-4" />
                          <span className="text-xs font-medium">{sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'}</span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-4">
                          <p className="text-2xl font-bold text-zinc-100 tracking-tighter">{formatCurrency(sale.total)}</p>
                          <button 
                            onClick={() => handleDeleteSale(sale.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-zinc-600 hover:text-red-500"
                            title="Excluir Venda"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
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
