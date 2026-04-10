import { create } from "zustand";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    {
      id: "1",
      title: "Bem-vindo!",
      message: "Seu sistema BarberPro está pronto para uso.",
      type: "success",
      read: false,
      createdAt: new Date().toISOString(),
    }
  ],
  addNotification: (n) => set((state) => ({
    notifications: [
      {
        ...n,
        id: Math.random().toString(36).substring(7),
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...state.notifications
    ]
  })),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  clearAll: () => set({ notifications: [] }),
}));
