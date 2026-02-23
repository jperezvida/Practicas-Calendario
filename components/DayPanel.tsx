import React, { useState } from 'react';
import { Entry, User } from '../types';
import { dbService } from '../services/dbService';
import { USERS } from '../constants';

interface Props {
  date: string;
  entries: Entry[];
  currentUser: User;
  onClose: () => void;
  onEntryChange: () => void;
}

const DayPanel: React.FC<Props> = ({ date, entries, currentUser, onClose, onEntryChange }) => {
  const [text, setText] = useState('');
  const [type, setType] = useState<'diario' | 'plan' | 'falta'>('diario');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([currentUser.name]);

  const canEdit = currentUser.role === 'EDITOR'; 

  const addToGoogleCalendar = (entry: Entry) => {
    const title = encodeURIComponent(`[Cátedra] ${entry.person}: ${entry.text}`);
    const details = encodeURIComponent(`Tarea de ${entry.person} gestionada en CátedraApp.`);
    const cleanDate = entry.date.replace(/-/g, '');
    const dates = `${cleanDate}/${cleanDate}`;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
    window.open(url, '_blank');
  };

  const handleEdit = (entry: Entry) => {
    const isParticipant = entry.participants?.includes(currentUser.name);
    const isCreator = entry.person === currentUser.name;
    if (!isCreator && !isParticipant) return;

    setEditingId(entry.id);
    setText(entry.text);
    if (entry.type === 'plan' || entry.type === 'diario' || entry.type === 'falta') {
        setType(entry.type);
    } else {
        setType('diario');
    }
    
    if (entry.participants && entry.participants.length > 0) {
      setSelectedParticipants(entry.participants);
    } else {
      setSelectedParticipants([entry.person]);
    }
  };

  const handleSave = async () => {
    if (!text.trim()) return;
    const finalParticipants = selectedParticipants.length > 0 ? selectedParticipants : [currentUser.name];

    if (editingId) {
      const originalEntry = entries.find(e => e.id === editingId);
      if (originalEntry) {
        await dbService.updateEntry({
          ...originalEntry,
          text,
          type,
          participants: finalParticipants
        });
      }
    } else {
      await dbService.addEntry({
        date,
        person: currentUser.name,        
        participants: finalParticipants, 
        text,
        type,
        completed: false
      } as any);
    }

    setText('');
    setEditingId(null);
    setSelectedParticipants([currentUser.name]); 
    onEntryChange();
  };

  const toggleParticipant = (userName: string) => {
    setSelectedParticipants(prev => prev.includes(userName) ? prev.filter(p => p !== userName) : [...prev, userName]);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar esta entrada?')) {
      await dbService.deleteEntry(id);
      onEntryChange();
    }
  };

  const toggleComplete = async (entry: Entry) => {
    const isParticipant = entry.participants?.includes(currentUser.name);
    const isCreator = entry.person === currentUser.name;
    if (!isCreator && !isParticipant) return;
    await dbService.updateEntry({ ...entry, completed: !entry.completed });
    onEntryChange();
  };

  const daysWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dateParts = date.split('-'); 
  const yearStr = parseInt(dateParts[0]);
  const monthStr = parseInt(dateParts[1]); 
  const dayStr = parseInt(dateParts[2]);   
  const tempDate = new Date(yearStr, monthStr - 1, dayStr, 12, 0, 0);
  const formattedDate = `${daysWeek[tempDate.getDay()]}, ${dayStr} de ${months[monthStr - 1]} de ${yearStr}`;

  return (
    <div className="absolute top-0 right-0 w-full md:w-96 h-full bg-white shadow-2xl border-l border-gray-200 z-40 flex flex-col animate-slide-in">
      <div className="p-6 border-b flex items-center justify-between bg-white">
        <div>
          <h3 className="text-lg font-bold text-gray-900 capitalize">{formattedDate}</h3>
          <p className="text-xs text-gray-500 font-medium">Hoja de ruta</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
        {entries.length === 0 ? (
          <div className="text-center py-20 opacity-40">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
            <p className="text-sm font-medium">Día libre de registros</p>
          </div>
        ) : (
          entries.map(entry => {
            const isPlan = entry.type === 'plan';
            const isFalta = entry.type === 'falta'; 
            const people = entry.participants && entry.participants.length > 0 ? entry.participants : [entry.person];

            return (
              <div key={entry.id} className={`group relative bg-white rounded-2xl p-4 border border-gray-200 shadow-sm transition-all ${entry.completed ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center -space-x-2 overflow-hidden py-1">
                    {people.map((pName, idx) => {
                      const u = USERS.find(user => user.name === pName);
                      const initial = pName.charAt(0).toUpperCase();
                      return (
                        <div key={idx} className="relative z-10 w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-[9px] text-white font-bold" style={{ backgroundColor: u?.color || '#ccc' }} title={pName}>
                          {initial}
                        </div>
                      );
                    })}
                    <div className="ml-3">
                      {isFalta ? (
                         <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest border bg-red-50 text-red-600 border-red-100">
                           ❌ FALTA
                         </span>
                      ) : (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest border ${entry.type === 'diario' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                            {entry.type}
                        </span>
                      )}
                    </div>
                  </div>

                  {isPlan && (
                    <button onClick={() => toggleComplete(entry)} className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${entry.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-500 text-transparent hover:text-green-500'}`}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  )}
                </div>
                
                <p className={`text-sm text-gray-700 leading-relaxed font-medium ${entry.completed ? 'line-through' : ''}`}>{entry.text}</p>
                
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-gray-100">
                  <button onClick={() => addToGoogleCalendar(entry)} className="p-1.5 text-gray-400 hover:text-indigo-600" title="Añadir a Google Calendar"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                  <button onClick={() => handleEdit(entry)} className="p-1.5 text-gray-400 hover:text-indigo-600"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                  <button onClick={() => handleDelete(entry.id)} className="p-1.5 text-gray-400 hover:text-red-600"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-6 border-t bg-white">
        <div className="mb-4 space-y-3">
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
            <button onClick={() => setType('diario')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${type === 'diario' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>DIARIO</button>
            <button onClick={() => setType('plan')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${type === 'plan' ? 'bg-white shadow text-green-600' : 'text-gray-400 hover:text-gray-600'}`}>PLAN</button>
            <button 
              onClick={() => { setType('falta'); if(!text) setText('Falta Injustificada'); }} 
              className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${type === 'falta' ? 'bg-white shadow text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              FALTA
            </button>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">¿Quién participa?</p>
            <div className="flex flex-wrap gap-2">
              {USERS.map(user => {
                const isSelected = selectedParticipants.includes(user.name);
                return (
                  <button
                    key={user.name}
                    onClick={() => toggleParticipant(user.name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      isSelected 
                        ? 'bg-gray-900 text-white border-gray-900 shadow-md transform scale-105' 
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: user.color }} />
                    {user.name}
                  </button>
                );
              })}
            </div>
          </div>

          <textarea 
            className="w-full p-4 rounded-xl border border-gray-200 text-sm font-medium bg-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition h-24"
            placeholder={type === 'diario' ? "¿Qué habéis hecho hoy?" : type === 'plan' ? "¿Qué plan tenéis?" : "Motivo de la falta..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <button 
          onClick={handleSave}
          disabled={!text.trim()}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition transform active:scale-95 disabled:opacity-50"
        >
          {editingId ? 'Guardar Cambios' : 'Añadir al Calendario'}
        </button>
      </div>
    </div>
  );
};

export default DayPanel;
