import React from 'react';
import { User, FilterState, ViewType } from '../types';
import { USERS } from '../constants';

interface Props {
  user: User;
  onLogout: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  viewType: ViewType;
  setViewType: (vt: ViewType) => void;
  onOpenCreateModal: () => void; // <--- NUEVA PROP
}

const Navbar: React.FC<Props> = ({ user, onLogout, filters, setFilters, viewType, setViewType, onOpenCreateModal }) => {
  
  const togglePerson = (name: string) => {
    setFilters(prev => ({
      ...prev,
      persons: prev.persons.includes(name) 
        ? prev.persons.filter(p => p !== name)
        : [...prev.persons, name]
    }));
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* IZQUIERDA: LOGO Y BOTÓN NUEVO */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-pink-600 leading-tight text-lg">Cátedra<span className="text-gray-800">App</span></span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Calendario</span>
          </div>
          
          {/* BOTÓN NUEVO EVENTO GLOBAL */}
          <button 
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-md hover:bg-pink-700 transition transform hover:scale-105 active:scale-95"
          >
            <span className="text-lg leading-none">+</span>
            <span>NUEVO</span>
          </button>
        </div>

        {/* CENTRO: SELECTOR VISTA */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setViewType('month')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition ${viewType === 'month' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Mes
          </button>
          <button 
            onClick={() => setViewType('week')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition ${viewType === 'week' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Semana
          </button>
        </div>

        {/* DERECHA: USUARIOS (SIN SCROLLBAR) */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end">
          {/* Usamos flex-wrap para que bajen a la siguiente línea si no caben, sin scroll */}
          <div className="flex flex-wrap gap-2 justify-center">
            {USERS.map(u => (
              <button
                key={u.id}
                onClick={() => togglePerson(u.name)}
                className="w-8 h-8 rounded-full border-2 transition transform hover:scale-110 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                style={{ 
                  backgroundColor: u.color,
                  borderColor: filters.persons.includes(u.name) ? '#1f2937' : 'transparent',
                  opacity: filters.persons.includes(u.name) ? 1 : 0.3,
                  transform: filters.persons.includes(u.name) ? 'scale(1.1)' : 'scale(1)'
                }}
                title={u.name}
              >
                {u.name.charAt(0)}
              </button>
            ))}
          </div>

          {/* PERFIL (Salir) */}
          <div className="pl-4 border-l border-gray-200 ml-2">
            <button onClick={onLogout} className="relative group">
               <div className="w-9 h-9 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: user.color }}>
                  {user.name.charAt(0)}
               </div>
               <span className="absolute top-full right-0 mt-1 text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
