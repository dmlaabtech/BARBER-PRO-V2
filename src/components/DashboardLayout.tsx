import React from "react";
import { useAuthStore } from "@/src/store/authStore";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Scissors, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  CreditCard
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationCenter } from "@/src/components/NotificationCenter";
import { useNotificationStore } from "@/src/store/notificationStore";

// Lista centralizada de itens do menu para evitar duplicidade
const menuItems = [
  { icon: LayoutDashboard, label: "Super Admin", path: "/super-admin", roles: ["SUPER_ADMIN"] },
  { icon: LayoutDashboard, label: "Dashboard", path: "/", roles: ["OWNER", "BARBER", "CLIENT", "SUPER_ADMIN"] },
  { icon: Calendar, label: "Agenda", path: "/agenda", roles: ["OWNER", "BARBER", "SUPER_ADMIN"] },
  { icon: Users, label: "Clientes", path: "/clientes", roles: ["OWNER", "SUPER_ADMIN"] },
  { icon: Users, label: "Barbeiros", path: "/barbeiros", roles: ["OWNER", "SUPER_ADMIN"] },
  { icon: Scissors, label: "Serviços", path: "/servicos", roles: ["OWNER", "SUPER_ADMIN"] },
  { icon: Package, label: "Estoque", path: "/estoque", roles: ["OWNER", "SUPER_ADMIN"] },
  { icon: ShoppingCart, label: "Vendas", path: "/vendas", roles: ["OWNER", "SUPER_ADMIN"] },
  { icon: DollarSign, label: "Financeiro", path: "/financeiro", roles: ["OWNER", "SUPER_ADMIN"] },
  { icon: CreditCard, label: "Planos & Assinaturas", path: "/configuracoes", roles: ["OWNER"] },
  { icon: Settings, label: "Configurações", path: "/configuracoes", roles: ["BARBER", "CLIENT", "SUPER_ADMIN"] },
];

export function DashboardLayout({ children, activePath, onNavigate }: { children: React.ReactNode, activePath: string, onNavigate: (path: string) => void }) {
  const { user, logout } = useAuthStore();
  const { notifications } = useNotificationStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const userRole = user?.role || "OWNER";
  
  // Filtra os itens baseado no cargo do usuário logado
  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  // Atalho de teclado para a Busca Mágica (⌘K ou Ctrl+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredItems = filteredMenuItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = notifications.filter(n => !n.read).length;
  const activeItem = filteredMenuItems.find(item => item.path === activePath) || filteredMenuItems[0];

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Overlay da Busca Mágica (Command Palette) */}
      <AnimatePresence>
        {isCommandPaletteOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCommandPaletteOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center gap-4">
                <Search className="w-5 h-5 text-zinc-500" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="O que você está procurando? (Agenda, Clientes...)" 
                  className="bg-transparent border-none outline-none text-lg w-full placeholder-zinc-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="px-2 py-1 bg-zinc-800 rounded text-[10px] font-black text-zinc-500 uppercase tracking-widest">ESC</div>
              </div>
              <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                {filteredItems.length > 0 ? (
                  <div className="space-y-1">
                    <p className="px-4 py-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Navegação</p>
                    {filteredItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          onNavigate(item.path);
                          setIsCommandPaletteOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-zinc-800 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <item.icon className="w-5 h-5 text-zinc-500 group-hover:text-zinc-100" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center space-y-4">
                    <Search className="w-12 h-12 text-zinc-800 mx-auto" />
                    <p className="text-zinc-500 font-medium">Nenhum resultado encontrado para "{searchQuery}"</p>
                  </div>
                )}
              </div>
              <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] font-bold text-zinc-400">↑↓</div>
                    <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Navegar</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] font-bold text-zinc-400">ENTER</div>
                    <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Selecionar</span>
                  </div>
                </div>
                <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">BarberPro by DM LABTECH</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-72 flex-col bg-zinc-900/50 backdrop-blur-xl border-r border-zinc-800/50 relative z-20">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center shadow-xl shadow-white/5">
              <Scissors className="w-6 h-6 text-zinc-950" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tighter text-zinc-100">BARBERPRO</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Premium SaaS</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {filteredMenuItems.map((item) => {
            const isActive = activePath === item.path;
            return (
              <button
                key={item.label}
                onClick={() => onNavigate(item.path)}
                className={cn(
                  "flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-300 group relative",
                  isActive 
                    ? "text-zinc-100 bg-zinc-800/80 shadow-lg shadow-black/20" 
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40"
                )}
              >
                <div className="flex items-center gap-3.5">
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform duration-300",
                    isActive ? "scale-110 text-zinc-100" : "group-hover:scale-110"
                  )} />
                  <span className="font-medium text-sm tracking-tight">{item.label}</span>
                </div>
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="w-1.5 h-1.5 rounded-full bg-zinc-100"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-zinc-800/50 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-400">
              {user?.name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-[10px] text-zinc-500 truncate uppercase tracking-wider">{user?.tenant?.name || "Plataforma"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-zinc-500 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Sair da conta</span>
          </button>
        </div>
      </aside>

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-20 flex items-center justify-between px-6 md:px-10 border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center gap-2 text-zinc-500 text-sm font-medium">
              <span>Painel</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-zinc-100">{activeItem?.label || "Início"}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest">Sistemas Online</span>
            </div>

            <button 
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden lg:flex items-center justify-between bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-4 py-2 w-64 group hover:border-zinc-700 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
                <span className="text-sm text-zinc-600 group-hover:text-zinc-400">Buscar...</span>
              </div>
              <div className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] font-bold text-zinc-500 uppercase tracking-widest">⌘K</div>
            </button>
            
            {(userRole === "OWNER" || userRole === "SUPER_ADMIN") && (
              <button 
                onClick={() => onNavigate("/agenda")}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-300 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Novo Agendamento
              </button>
            )}

            <button 
              onClick={() => setIsShortcutsOpen(true)}
              className="p-2.5 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-zinc-400 hover:text-zinc-100 transition-all"
              title="Atalhos de Teclado"
            >
              <span className="text-xs font-black uppercase tracking-widest">?</span>
            </button>

            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2.5 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all group"
            >
              <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-zinc-950" />
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto custom-scrollbar relative">
          <motion.div
            key={activePath}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="p-6 md:p-10 max-w-7xl mx-auto w-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Menu Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-zinc-900 z-[70] md:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-zinc-800">
                <h1 className="text-xl font-bold tracking-tighter text-zinc-100">BARBERPRO</h1>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-400">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {filteredMenuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      onNavigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-4 w-full p-4 rounded-xl transition-all",
                      activePath === item.path ? "text-zinc-100 bg-zinc-800" : "text-zinc-500"
                    )}
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="text-base font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
              <div className="p-6 border-t border-zinc-800">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 p-4 w-full text-red-400 bg-red-400/5 rounded-xl"
                >
                  <LogOut className="w-6 h-6" />
                  <span className="text-base font-medium">Sair</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Componente de Notificações */}
      <NotificationCenter 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />

      {/* Modal de Atalhos */}
      <AnimatePresence>
        {isShortcutsOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShortcutsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-8 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tighter uppercase italic">Atalhos de Teclado</h3>
                <button onClick={() => setIsShortcutsOpen(false)} className="p-2 text-zinc-500 hover:text-zinc-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Geral</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Busca Mágica</span>
                      <div className="flex gap-1">
                        <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] font-bold text-zinc-300">⌘</kbd>
                        <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] font-bold text-zinc-300">K</kbd>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Fechar Modal</span>
                      <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] font-bold text-zinc-300">ESC</kbd>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Navegação</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Agenda</span>
                      <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] font-bold text-zinc-300">G A</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Clientes</span>
                      <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] font-bold text-zinc-300">G C</kbd>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-zinc-950/50 border-t border-zinc-800 text-center">
                <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic">Aumente sua produtividade com BarberPro</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}