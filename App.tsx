import React, { useState, useEffect, useMemo } from 'react';
import { User, Entry, FilterState, ViewType, InnovationTip } from './types';
import { USERS } from './constants';
import AuthForm from './components/AuthForm';
import Navbar from './components/Navbar';
import Calendar from './components/Calendar';
import DayPanel from './components/DayPanel';
import CreateEventModal from './components/CreateEventModal'; // <--- IMPORTANTE
import { dbService } from './services/dbService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  });

  const [viewType, setViewType] = useState<ViewType>('month');
  
  const [filters, setFilters] = useState<FilterState>({
    persons: USERS.map(u => u.name),
    search: ''
  });
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // <--- ESTADO NUEVO

  useEffect(() => {
    const savedUser = localStorage.getItem('catedra_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const data = await dbService.getEntries();
      setEntries(data || []);
    } catch (e) {
      console.error("Error cargando entradas", e);
    }
  };

  const handleLogin = (email: string) => {
    const user = USERS.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('catedra_user', JSON.stringify(user));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('catedra_user');
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const personName = entry.person || ''; 
      const matchPerson = filters.persons.includes(personName);
      // Aunque hemos quitado el input visual, mantenemos la lógica por si acaso
      const textContent = entry.text || '';
      const matchSearch = textContent.toLowerCase().includes(filters.search.toLowerCase());
      return matchPerson && matchSearch;
    });
  }, [entries, filters]);

  if (!currentUser) return <AuthForm onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar 
        user={currentUser} 
        onLogout={handleLogout}
        filters={filters}
        setFilters={setFilters}
        viewType={viewType}
        setViewType={setViewType}
        onOpenCreateModal={() => setIsCreateModalOpen(true)} // <--- CONECTAR BOTÓN
      />
      
      <main className="flex-1 overflow-hidden flex relative">
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Calendar 
            viewType={viewType}
            currentDate={viewDate}
            setCurrentDate={setViewDate}
            entries={filteredEntries}
            onDateClick={(date) => setSelectedDate(date)}
          />
        </div>

        {/* PANEL LATERAL DE DÍA (EXISTENTE) */}
        {selectedDate && (
          <DayPanel 
            date={selectedDate}
            entries={entries.filter(e => e.date === selectedDate)}
            currentUser={currentUser}
            onClose={() => setSelectedDate(null)}
            onEntryChange={loadEntries}
          />
        )}

        {/* MODAL DE CREACIÓN GLOBAL (NUEVO) */}
        {isCreateModalOpen && (
          <CreateEventModal 
            currentUser={currentUser}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={loadEntries}
          />
        )}
      </main>
    </div>
  );
};

export default App;
