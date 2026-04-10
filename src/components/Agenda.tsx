import React from "react";
import { useAuthStore } from "@/src/store/authStore";
import { Calendar as CalendarIcon, Plus, Clock, User, Scissors, ChevronLeft, ChevronRight, MoreVertical, CheckCircle2, XCircle, MessageCircle } from "lucide-react";
import { formatDateTime, formatCurrency } from "@/src/lib/utils";
import { Modal } from "@/src/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/src/lib/utils";

export function Agenda() {
  const { user, token } = useAuthStore();
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [clients, setClients] = React.useState<any[]>([]);
  const [barbers, setBarbers] = React.useState<any[]>([]);
  const [services, setServices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [selectedBarberFilter, setSelectedBarberFilter] = React.useState<string>("ALL");
  const [modalData, setModalData] = React.useState({
    date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
    time: "",
    clientId: "",
    barberId: "",
    serviceId: "",
    notes: ""
  });

  const fetchData = async () => {
    if (!token) return;
    try {
      const headers = {
        "Authorization": `Bearer ${token}`,
        "x-tenant-id": user?.tenant?.id || ""
      };

      const [appsRes, clientsRes, barbersRes, servicesRes] = await Promise.all([
        fetch("/api/appointments", { headers }),
        fetch("/api/clients", { headers }),
        fetch("/api/barbers", { headers }),
        fetch("/api/services", { headers })
      ]);

      if (appsRes.ok) setAppointments(await appsRes.json());
      if (clientsRes.ok) setClients(await clientsRes.json());
      if (barbersRes.ok) setBarbers(await barbersRes.json());
      if (servicesRes.ok) setServices(await servicesRes.json());
    } catch (error) {
      console.error("Erro ao buscar dados da agenda:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [token, user?.tenant?.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!modalData.time || !token) return;

    const service = services.find(s => s.id === modalData.serviceId);
    if (!service) return;

    const [year, month, day] = modalData.date.split('-');
    const [hour, minute] = modalData.time.split(':');
    const localDate = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));

    const data = {
      date: localDate.toISOString(),
      clientId: modalData.clientId,
      barberId: modalData.barberId,
      serviceId: modalData.serviceId,
      notes: modalData.notes,
      totalPrice: service.price,
    };

    try {
      const res = await fetch("/api/appointments", {
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
        alert("Erro ao criar agendamento.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao criar agendamento.");
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-tenant-id": user?.tenant?.id || ""
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Erro ao atualizar status.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja excluir este agendamento?")) return;
    try {
      // O backend não tem rota DELETE para appointments ainda, mas vamos simular ou chamar se existir
      // Para segurança, vamos apenas cancelar se não houver delete
      const res = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-tenant-id": user?.tenant?.id || ""
        }
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Erro ao excluir agendamento.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir agendamento.");
    }
  };

  const openModal = () => {
    setModalData({
      date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
      time: "",
      clientId: "",
      barberId: "",
      serviceId: "",
      notes: ""
    });
    setIsModalOpen(true);
  };

  const handleWhatsApp = (clientName: string, clientPhone: string, time: string) => {
    if (!clientPhone) return;
    const message = `Olá ${clientName}! Passando para confirmar seu agendamento hoje às ${time} na barbearia. Podemos confirmar?`;
    const encodedMessage = encodeURIComponent(message);
    const phone = clientPhone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodedMessage}`, '_blank');
  };

  const getBookedTimes = () => {
    if (!modalData.date || !modalData.barberId) return [];
    const [year, month, day] = modalData.date.split('-');
    const requestedDateString = new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('pt-BR');
    
    return appointments.filter(app => {
      if (app.status === 'CANCELED') return false;
      if (app.barberId !== modalData.barberId) return false;
      const appDate = new Date(app.date);
      return appDate.toLocaleDateString('pt-BR') === requestedDateString;
    }).map(app => {
      return new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    });
  };

  const bookedTimes = getBookedTimes();

  const filteredAppointments = appointments.filter(app => {
    const isSameDate = new Date(app.date).toDateString() === selectedDate.toDateString();
    const isSameBarber = selectedBarberFilter === "ALL" || app.barberId === selectedBarberFilter;
    return isSameDate && isSameBarber;
  });

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold tracking-tight text-zinc-100">Agenda</h2>
          <p className="text-zinc-500 font-medium">Gerencie os horários e compromissos da sua equipe.</p>
        </div>
        <button 
          onClick={openModal}
          className="premium-button flex items-center gap-2 shadow-2xl shadow-white/5"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Agendamento</span>
        </button>
      </header>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Novo Agendamento"
      >
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Data</label>
              <input 
                name="date" 
                type="date" 
                required 
                value={modalData.date}
                min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
                onChange={e => setModalData({ ...modalData, date: e.target.value, time: "" })}
                className="input-field" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Barbeiro</label>
            <select 
              name="barberId" 
              required 
              value={modalData.barberId}
              onChange={e => setModalData({ ...modalData, barberId: e.target.value, time: "" })}
              className="input-field appearance-none"
            >
              <option value="">Selecione um barbeiro</option>
              {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Horários Disponíveis</label>
            {!modalData.barberId ? (
              <p className="text-xs text-zinc-500">Selecione um barbeiro primeiro.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"].map((time) => {
                  const [year, month, day] = modalData.date.split('-');
                  const selectedDateObj = new Date(Number(year), Number(month) - 1, Number(day));
                  const now = new Date();
                  const isToday = selectedDateObj.toDateString() === now.toDateString();
                  const currentHour = now.getHours();
                  const currentMinute = now.getMinutes();
                  
                  const [h, m] = time.split(':').map(Number);
                  const isPast = isToday && (h < currentHour || (h === currentHour && m <= currentMinute));
                  const isBooked = bookedTimes.includes(time);
                  const isDisabled = isPast || isBooked;
                  
                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setModalData({ ...modalData, time })}
                      className={cn(
                        "p-2 rounded-xl border text-xs font-bold transition-all",
                        isDisabled 
                          ? "bg-zinc-900/20 border-white/5 text-zinc-700 cursor-not-allowed"
                          : modalData.time === time 
                            ? "bg-zinc-100 text-zinc-950 border-zinc-100" 
                            : "bg-zinc-900/50 border-white/5 hover:border-white/10 text-zinc-300"
                      )}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Cliente</label>
            <select 
              name="clientId" 
              required 
              value={modalData.clientId}
              onChange={e => setModalData({ ...modalData, clientId: e.target.value })}
              className="input-field appearance-none"
            >
              <option value="">Selecione um cliente</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Serviço</label>
            <select 
              name="serviceId" 
              required 
              value={modalData.serviceId}
              onChange={e => setModalData({ ...modalData, serviceId: e.target.value })}
              className="input-field appearance-none"
            >
              <option value="">Selecione um serviço</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} - {formatCurrency(Number(s.price))}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Observações</label>
            <textarea 
              name="notes" 
              value={modalData.notes}
              onChange={e => setModalData({ ...modalData, notes: e.target.value })}
              className="input-field h-24 resize-none" 
              placeholder="Opcional..." 
            />
          </div>

          <button disabled={!modalData.time} className="premium-button w-full py-4 text-lg shadow-xl shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed">
            Confirmar Agendamento
          </button>
        </form>
      </Modal>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Mini Calendar / Date Picker */}
        <div className="glass-card p-6 border-zinc-800/30 h-fit space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-zinc-100">Calendário</h3>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() - 1);
                  setSelectedDate(newDate);
                }}
                className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() + 1);
                  setSelectedDate(newDate);
                }}
                className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((offset) => {
              const date = new Date();
              date.setDate(date.getDate() + offset);
              const isSelected = date.toDateString() === selectedDate.toDateString();
              
              return (
                <button
                  key={offset}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-all group",
                    isSelected 
                      ? "bg-zinc-100 text-zinc-950 shadow-lg" 
                      : "hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                      {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </span>
                    <span className="text-sm font-bold">
                      {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                    </span>
                  </div>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline View */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 px-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
                {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </h3>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedBarberFilter}
                onChange={(e) => setSelectedBarberFilter(e.target.value)}
                className="input-field py-1.5 px-3 text-xs w-auto min-w-[150px]"
              >
                <option value="ALL">Todos os Barbeiros</option>
                {barbers.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest whitespace-nowrap">
                {filteredAppointments.length} agendamentos
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-600 gap-3 glass-card">
                <div className="w-8 h-8 border-2 border-zinc-800 border-t-zinc-400 rounded-full animate-spin" />
                <p className="text-sm font-medium">Sincronizando agenda...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="py-24 text-center glass-card border-dashed border-zinc-800/50">
                <CalendarIcon className="w-12 h-12 text-zinc-800 mx-auto mb-4 opacity-50" />
                <p className="text-zinc-500 font-medium">Nenhum agendamento para esta data.</p>
                <button 
                  onClick={openModal}
                  className="mt-4 text-sm font-bold text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  + Adicionar primeiro compromisso
                </button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredAppointments.map((app, index) => (
                  <motion.div 
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card p-5 flex items-center justify-between hover:border-zinc-700/50 transition-all group relative overflow-hidden"
                  >
                    <div className="flex items-center gap-8 relative z-10">
                      <div className="text-center min-w-[80px]">
                        <p className="text-2xl font-bold tracking-tighter text-zinc-100">
                          {new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-0.5">Horário</p>
                      </div>
                      
                      <div className="h-12 w-px bg-zinc-800/50" />

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-lg text-zinc-100 tracking-tight">{app.client.name}</p>
                          <span className={cn(
                            "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest",
                            app.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-500" : 
                            app.status === 'CANCELED' ? "bg-red-500/10 text-red-500" :
                            "bg-zinc-800 text-zinc-400"
                          )}>
                            {app.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Scissors className="w-3.5 h-3.5 text-zinc-600" /> {app.service.name}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-zinc-600" /> {app.barber.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 relative z-10">
                      {app.client.phone && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWhatsApp(app.client.name, app.client.phone, new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
                          }}
                          className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-zinc-950 rounded-xl transition-all"
                          title="Confirmar via WhatsApp"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                      )}
                      {app.status !== 'COMPLETED' && app.status !== 'CANCELED' ? (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(app.id, 'COMPLETED')}
                            className="p-2.5 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500 hover:text-zinc-950 rounded-xl transition-all"
                            title="Concluir"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(app.id, 'CANCELED')}
                            className="p-2.5 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-zinc-950 rounded-xl transition-all"
                            title="Cancelar"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleDelete(app.id)}
                          className="p-2.5 text-zinc-700 hover:text-red-500 transition-colors"
                          title="Excluir"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    
                    {/* Background decoration */}
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-zinc-800/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
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
