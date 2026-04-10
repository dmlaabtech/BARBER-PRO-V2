import { useAuthStore } from "@/src/store/authStore";

export function useApi() {
  const { token, user } = useAuthStore();

  const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (user?.tenant?.id) {
      headers.set("x-tenant-id", user.tenant.id);
    }
    headers.set("Content-Type", "application/json");

    try {
      const response = await fetch(`/api${endpoint}`, {
        ...options,
        headers,
      });

      // Se o token expirar ou for inválido, limpa a sessão e força o redirecionamento
      if (response.status === 401 || response.status === 403) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return { error: "Sessão expirada. Por favor, faça login novamente." };
      }

      return await response.json();
    } catch (error) {
      console.error("Erro na chamada à API:", error);
      throw error;
    }
  };

  return { fetchApi };
}