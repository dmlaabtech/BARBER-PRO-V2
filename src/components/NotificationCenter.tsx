import React from "react";
import { useNotificationStore, Notification } from "@/src/store/notificationStore";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/src/lib/utils";

const icons = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

export function NotificationCenter({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { notifications, markAsRead, clearAll } = useNotificationStore();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="fixed top-24 right-6 w-96 max-w-[calc(100vw-48px)] glass-card z-[101] shadow-2xl overflow-hidden flex flex-col max-h-[600px]"
          >
            <div className="p-6 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-800 rounded-lg">
                  <Bell className="w-5 h-5 text-zinc-100" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-100">Notificações</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                    {unreadCount} novas mensagens
                  </p>
                </div>
              </div>
              <button 
                onClick={clearAll}
                className="text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Limpar tudo
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-8 h-8 text-zinc-800 mx-auto mb-3 opacity-50" />
                  <p className="text-zinc-500 text-sm font-medium">Nenhuma notificação por aqui.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <motion.div 
                    key={n.id}
                    layout
                    className={cn(
                      "p-4 rounded-xl border transition-all cursor-pointer group relative",
                      n.read 
                        ? "bg-zinc-900/30 border-zinc-800/30 opacity-60" 
                        : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                    )}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5">{icons[n.type]}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-zinc-100 truncate">{n.title}</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed mt-1">{n.message}</p>
                        <p className="text-[10px] text-zinc-600 font-bold mt-2 uppercase tracking-tighter">
                          {new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    {!n.read && (
                      <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-500 rounded-full" />
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
