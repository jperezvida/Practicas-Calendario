import React, { useState, useEffect, useMemo } from 'react';
import { User, Entry, FilterState, ViewType } from './types';
import { USERS } from './constants';
import AuthForm from './components/AuthForm';
import Navbar from './components/Navbar';
import Calendar from './components/Calendar';
import DayPanel from './components/DayPanel';
import CreateEventModal from './components/CreateEventModal';
import TasksPanel from './components/TasksPanel';     // <--- AÑADIDO
import ProgressModal from './components/ProgressModal'; // <--- AÑADIDO
import { dbService } from './services/dbService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [tempAnnouncement, setTempAnnouncement] = useState('');
  
  const [viewDate, setViewDate] = useState(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0); });
  const [viewType, setViewType] = useState<ViewType>('month');
  const [filters, setFilters] = useState<FilterState>({ persons: USERS.map(u => u.name), search: '' });
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('catedra_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const data = await dbService.getEntries();
      setEntries(data || []);
      const msg = await dbService.getAnnouncement();
      setAnnouncement(msg);
    } catch (e) { console.error(e); }
  };

  const saveAnnouncement = async () => {
    await dbService.updateAnnouncement(tempAnnouncement);
    setAnnouncement(tempAnnouncement);
    setIsEditingAnnouncement(false);
  };

  const handleLogin = (email: string) => {
    const user = USERS.find(u => u.email === email);
    if (user) { setCurrentUser(user); localStorage.setItem('catedra_user', JSON.stringify(user)); }
  };
  const handleLogout = () => { setCurrentUser(null); localStorage.removeItem('catedra_user'); };

  const filteredEntries = useMemo(() => entries.filter(entry => filters.persons.includes(entry.person || '')), [entries, filters]);

  if (!currentUser) return <AuthForm onLogin={handleLogin} />;

  const canEditBoard = currentUser.role === 'VIEWER'; // Solo Cátedra y Ana editan el tablón

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar 
        user={currentUser} onLogout={handleLogout} filters={filters} setFilters={setFilters} viewType={viewType} setViewType={setViewType}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenTasks={() => setIsTasksOpen(true)}
        onOpenProgress={() => setIsProgressOpen(true)}
      />
      
      <main className="flex-1 overflow-hidden flex relative flex-col">
        {/* TABLÓN DE ANUNCIOS */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2 relative shadow-sm z-10">
          <span className="text-xl">📢</span>
          {isEditingAnnouncement ? (
            <div className="flex gap-2 w-full max-w-2xl items-center">
              <input type="text" value={tempAnnouncement} onChange={e => setTempAnnouncement(e.target.value)} className="flex-1 p-1 text-sm border border-amber-300 rounded outline-none" autoFocus/>
              <button onClick={saveAnnouncement} className="bg-amber-500 text-white px-3 py-1 rounded text-xs font-bold">Guardar</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-amber-900 font-medium text-sm">{announcement || 'Sin avisos importantes.'}</p>
              {canEditBoard && <button onClick={() => {setTempAnnouncement(announcement); setIsEditingAnnouncement(true);}} className="text-amber-600 hover:text-amber-800 text-xs underline">Editar</button>}
            </div>
          )}
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Calendar viewType={viewType} currentDate={viewDate} setCurrentDate={setViewDate} entries={filteredEntries} onDateClick={(date) => setSelectedDate(date)} />
        </div>

        {selectedDate && <DayPanel date={selectedDate} entries={entries.filter(e => e.date === selectedDate)} currentUser={currentUser} onClose={() => setSelectedDate(null)} onEntryChange={loadAllData} />}
        {isCreateModalOpen && <CreateEventModal currentUser={currentUser} onClose={() => setIsCreateModalOpen(false)} onSuccess={loadAllData} />}
        {isTasksOpen && <TasksPanel currentUser={currentUser} onClose={() => setIsTasksOpen(false)} />}
        {isProgressOpen && <ProgressModal currentUser={currentUser} onClose={() => setIsProgressOpen(false)} />}
      </main>
    </div>
  );
};
export default App;
