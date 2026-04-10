import React from "react";
import { useAuthStore } from "@/src/store/authStore";
import { Package, Plus, AlertTriangle, Search, Tag, FolderPlus, MoreVertical, TrendingDown, BarChart3, Box, XCircle } from "lucide-react";
import { formatCurrency, cn } from "@/src/lib/utils";
import { Modal } from "@/src/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";

export function Inventory() {
  const { user, token } = useAuthStore();
  const [products, setProducts] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const fetchData = async () => {
    if (!token) return;
    try {
      const headers = {
        "Authorization": `Bearer ${token}`,
        "x-tenant-id": user?.tenant?.id || ""
      };

      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products", { headers }),
        fetch("/api/categories?type=PRODUCT", { headers })
      ]);

      if (productsRes.ok) setProducts(await productsRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
    } catch (error) {
      console.error("Erro ao buscar dados do estoque:", error);
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
    const data = {
      name: formData.get("name"),
      sku: formData.get("sku"),
      price: Number(formData.get("price")),
      cost: Number(formData.get("cost")),
      stock: Number(formData.get("stock")),
      minStock: Number(formData.get("minStock")),
      categoryId: formData.get("categoryId"),
    };

    try {
      const res = await fetch("/api/products", {
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
        alert("Erro ao cadastrar produto.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar produto.");
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      type: "PRODUCT",
    };

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-tenant-id": user?.tenant?.id || ""
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        setIsCategoryModalOpen(false);
        fetchData();
      } else {
        alert("Erro ao cadastrar categoria.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar categoria.");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Deseja excluir o produto ${name}?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-tenant-id": user?.tenant?.id || ""
        }
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Erro ao excluir produto.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir produto.");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalStockValue = products.reduce((acc, p) => acc + (Number(p.price) * p.stock), 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold tracking-tight text-zinc-100">Estoque</h2>
          <p className="text-zinc-500 font-medium">Gerencie seus produtos, suprimentos e níveis de estoque.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-zinc-100 transition-all flex items-center gap-2"
          >
            <FolderPlus className="w-5 h-5" />
            <span className="font-bold text-sm">Categorias</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="premium-button flex items-center gap-2 shadow-2xl shadow-white/5"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Produto</span>
          </button>
        </div>
      </header>

      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="Nova Categoria">
        <form onSubmit={handleCategorySubmit} className="space-y-6 p-2">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome da Categoria</label>
            <input name="name" required placeholder="Ex: Shampoos, Pomadas..." className="input-field" />
          </div>
          <button className="premium-button w-full py-4 text-lg shadow-xl shadow-white/5">
            Cadastrar Categoria
          </button>
        </form>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Produto">
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome do Produto</label>
            <input name="name" required className="input-field" placeholder="Ex: Pomada Modeladora Matte" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">SKU</label>
              <input name="sku" className="input-field" placeholder="SKU-001" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Categoria</label>
              <select name="categoryId" required className="input-field appearance-none">
                <option value="">Selecione</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Preço de Venda (R$)</label>
              <input name="price" type="number" step="0.01" required className="input-field" placeholder="0,00" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Custo (R$)</label>
              <input name="cost" type="number" step="0.01" required className="input-field" placeholder="0,00" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Estoque Inicial</label>
              <input name="stock" type="number" required defaultValue="0" className="input-field" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Estoque Mínimo</label>
              <input name="minStock" type="number" required defaultValue="5" className="input-field" />
            </div>
          </div>
          <button className="premium-button w-full py-4 text-lg shadow-xl shadow-white/5">
            Cadastrar Produto
          </button>
        </form>
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 border-zinc-800/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center">
              <Box className="w-6 h-6 text-zinc-100" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total de Itens</p>
              <h4 className="text-3xl font-bold text-zinc-100">{products.length}</h4>
            </div>
          </div>
        </div>
        <div className="glass-card p-8 border-zinc-800/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Valor em Estoque</p>
              <h4 className="text-3xl font-bold text-zinc-100">{formatCurrency(totalStockValue)}</h4>
            </div>
          </div>
        </div>
        <div className="glass-card p-8 border-zinc-800/30 border-amber-500/20 bg-amber-500/[0.02]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Estoque Baixo</p>
              <h4 className="text-3xl font-bold text-amber-500">{lowStockCount}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
        <input 
          type="text" 
          placeholder="Buscar produto por nome ou SKU..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-2xl py-4 pl-12 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 outline-none transition-all"
        />
      </div>

      <div className="glass-card border-zinc-800/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/50 text-zinc-500 text-[10px] uppercase tracking-widest font-black">
                <th className="p-6">Produto</th>
                <th className="p-6">Categoria</th>
                <th className="p-6">Preço / Custo</th>
                <th className="p-6">Estoque Atual</th>
                <th className="p-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center text-zinc-600 font-medium italic">Sincronizando inventário...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-24 text-center">
                    <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-800/50">
                      <Package className="w-8 h-8 text-zinc-700" />
                    </div>
                    <p className="text-zinc-500 font-medium">Nenhum produto encontrado.</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, index) => (
                    <motion.tr 
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-zinc-800/20 transition-colors group"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700/30 text-zinc-100 flex items-center justify-center font-bold text-lg shadow-inner">
                            <Package className="w-6 h-6 text-zinc-500" />
                          </div>
                          <div>
                            <p className="font-bold text-zinc-100 text-lg tracking-tight">{product.name}</p>
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-0.5">SKU: {product.sku || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="px-3 py-1 bg-zinc-800/50 border border-zinc-700/30 rounded-lg text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                          {product.category?.name}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-zinc-100 tracking-tight">{formatCurrency(product.price)}</p>
                          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Custo: {formatCurrency(product.cost)}</p>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <span className={cn(
                              "text-xl font-bold tracking-tighter",
                              product.stock <= product.minStock ? "text-amber-500" : "text-zinc-100"
                            )}>
                              {product.stock}
                            </span>
                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Unidades</span>
                          </div>
                          {product.stock <= product.minStock && (
                            <div className="p-2 bg-amber-500/10 rounded-xl">
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-4">
                          <span className={cn(
                            "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                            product.stock > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                          )}>
                            {product.stock > 0 ? "Em estoque" : "Esgotado"}
                          </span>
                          <button 
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-zinc-600 hover:text-red-500"
                            title="Excluir Produto"
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
