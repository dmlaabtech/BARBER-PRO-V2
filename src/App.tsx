import React from "react";
import { useAuthStore } from "@/src/store/authStore";
import { Login } from "@/src/components/Login";
import { DashboardLayout } from "@/src/components/DashboardLayout";
import { Dashboard } from "@/src/components/Dashboard";
import { Agenda } from "@/src/components/Agenda";
import { Clients } from "@/src/components/Clients";
import { Barbers } from "@/src/components/Barbers";
import { Services } from "@/src/components/Services";
import { Inventory } from "@/src/components/Inventory";
import { Sales } from "@/src/components/Sales";
import { Financial } from "@/src/components/Financial";
import { Settings } from "@/src/components/Settings";

import { Register } from "@/src/components/Register";
import Pricing from "@/src/components/Pricing";
import { BookingPage } from "@/src/components/BookingPage";
import { SuperAdminDashboard } from "@/src/components/SuperAdminDashboard";
import { LandingPage } from "@/src/components/LandingPage";

import { BarberDashboard } from "@/src/components/BarberDashboard";
import { ClientDashboard } from "@/src/components/ClientDashboard";

import { ForgotPassword } from "@/src/components/ForgotPassword";
import { ResetPassword } from "@/src/components/ResetPassword";

// 1. IMPORTAMOS O TOASTER AQUI NO TOPO
import { Toaster } from 'react-hot-toast';

export default function App() {
  const { user } = useAuthStore();
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);

  React.useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, "", path);
  };

  // Handle public routes first
  if (currentPath.startsWith("/booking/")) {
    const slug = currentPath.split("/")[2];
    return (
      <>
        <BookingPage slug={slug} />
        <Toaster position="top-right" toastOptions={{ style: { background: '#18181b', color: '#f4f4f5', border: '1px solid #27272a' } }} />
      </>
    );
  }

  if (currentPath === "/pricing") {
    return (
      <>
        <Pricing />
        <Toaster position="top-right" toastOptions={{ style: { background: '#18181b', color: '#f4f4f5', border: '1px solid #27272a' } }} />
      </>
    );
  }

  if (currentPath === "/register") {
    return (
      <>
        <Register onLogin={() => navigate("/")} />
        <Toaster position="top-right" toastOptions={{ style: { background: '#18181b', color: '#f4f4f5', border: '1px solid #27272a' } }} />
      </>
    );
  }

  if (currentPath === "/forgot-password") {
    return (
      <>
        <ForgotPassword onBack={() => navigate("/login")} />
        <Toaster position="top-right" toastOptions={{ style: { background: '#18181b', color: '#f4f4f5', border: '1px solid #27272a' } }} />
      </>
    );
  }

  if (currentPath.startsWith("/reset-password")) {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
      navigate("/login");
      return null;
    }
    
    return (
      <>
        <ResetPassword token={token} onLoginClick={() => navigate("/login")} />
        <Toaster position="top-right" toastOptions={{ style: { background: '#18181b', color: '#f4f4f5', border: '1px solid #27272a' } }} />
      </>
    );
  }

  if (!user) {
    if (currentPath === "/login") {
      return (
        <>
          <Login onRegister={() => navigate("/pricing")} />
          <Toaster position="top-right" toastOptions={{ style: { background: '#18181b', color: '#f4f4f5', border: '1px solid #27272a' } }} />
        </>
      );
    }
    return (
      <>
        <LandingPage 
          onLoginClick={() => navigate("/login")} 
          onPricingClick={() => navigate("/pricing")} 
        />
        <Toaster position="top-right" toastOptions={{ style: { background: '#18181b', color: '#f4f4f5', border: '1px solid #27272a' } }} />
      </>
    );
  }

  const renderContent = () => {
    // Common routes for all authenticated users
    switch (currentPath) {
      case "/super-admin":
        if (user.role === "SUPER_ADMIN") return <SuperAdminDashboard />;
        return <Dashboard onNavigate={navigate} />;
      case "/":
        if (user.role === "SUPER_ADMIN") return <Dashboard onNavigate={navigate} />;
        if (user.role === "BARBER") return <BarberDashboard />;
        if (user.role === "CLIENT") return <ClientDashboard onNavigate={navigate} />;
        return <Dashboard onNavigate={navigate} />;
      case "/agenda":
        return <Agenda />;
      case "/clientes":
        return <Clients />;
      case "/barbeiros":
        return <Barbers />;
      case "/servicos":
        return <Services />;
      case "/estoque":
        return <Inventory />;
      case "/vendas":
        return <Sales />;
      case "/financeiro":
        return <Financial />;
      case "/configuracoes":
        return <Settings />;
      default:
        if (user.role === "BARBER") return <BarberDashboard />;
        if (user.role === "CLIENT") return <ClientDashboard onNavigate={navigate} />;
        return <Dashboard onNavigate={navigate} />;
    }
  };

  // 2. RENDERIZAMOS O TOASTER JUNTO COM O DASHBOARD (PARA UTILIZADORES LOGADOS)
  return (
    <>
      <DashboardLayout activePath={currentPath} onNavigate={navigate}>
        {renderContent()}
      </DashboardLayout>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181b', // zinc-900
            color: '#f4f4f5', // zinc-100
            border: '1px solid #27272a', // zinc-800
          },
          success: {
            iconTheme: {
              primary: '#10b981', // emerald-500
              secondary: '#18181b',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444', // red-500
              secondary: '#18181b',
            },
          },
        }} 
      />
    </>
  );
}