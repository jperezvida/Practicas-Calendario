import React from 'react';
import { User, FilterState, ViewType } from '../types';
import { USERS } from '../constants';

interface Props {
  user: User; onLogout: () => void;
  filters: FilterState; setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  viewType: ViewType; setViewType: (vt: ViewType) => void;
  onOpenCreateModal: () => void;
  onOpenTasks: () => void; // <--- AÑADIDO
  onOpenProgress: () => void; // <--- AÑADIDO
}

const Navbar: React.FC<Props> = ({ user, onLogout, filters, setFilters, viewType, setViewType, onOpenCreateModal, onOpenTasks, onOpenProgress }) => {
  const togglePerson = (name: string) => setFilters(prev => ({ ...prev, persons: prev.persons.includes(name) ? prev.persons.filter(p => p !== name) : [...prev.persons, name] }));

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-4 w-full md:w-auto justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-indigo-600 leading-tight text-lg">Calendario <span className="text-gray-800">Prácticas</span></span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Cátedra de Innovación</span>
          </div>
          
          <div className="flex gap-2">
            <button onClick={onOpenTasks} className="hidden md:flex items-center gap-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm hover:bg-yellow-100 transition">📝 TAREAS</button>
            <button onClick={onOpenProgress} className="hidden md:flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm hover:bg-blue-100 transition">⏱️ PROGRESO</button>
            <button onClick={onOpenCreateModal} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md hover:bg-indigo-700 transition transform hover:scale-105"><span>+ NUEVO</span></button>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setViewType('month')} className={`px-4 py-1.5 rounded-md text-xs font-medium transition ${viewType === 'month' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Mes</button>
          <button onClick={() => setViewType('week')} className={`px-4 py-1.5 rounded-md text-xs font-medium transition ${viewType === 'week' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Semana</button>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end">
          {/* Botones móviles */}
          <div className="flex md:hidden gap-2 mr-2">
            <button onClick={onOpenTasks} className="p-2 bg-yellow-50 text-yellow-700 rounded-full">📝</button>
            <button onClick={onOpenProgress} className="p-2 bg-blue-50 text-blue-700 rounded-full">⏱️</button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {USERS.map(u => (
              <button key={u.id} onClick={() => togglePerson(u.name)} className="w-8 h-8 rounded-full border-2 transition transform hover:scale-110 flex items-center justify-center text-[10px] font-bold text-white shadow-sm" style={{ backgroundColor: u.color, borderColor: filters.persons.includes(u.name) ? '#1f2937' : 'transparent', opacity: filters.persons.includes(u.name) ? 1 : 0.3 }} title={u.name}>{u.name.charAt(0)}</button>
            ))}
          </div>

          <div className="pl-4 border-l border-gray-200 ml-2">
            <button onClick={onLogout} className="relative group">
               <div className="w-9 h-9 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: user.color }}>{user.name.charAt(0)}</div>
               <span className="absolute top-full right-0 mt-1 text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
