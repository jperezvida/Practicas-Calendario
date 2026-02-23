import React, { useState } from 'react';
import { User } from '../types';
import { USERS } from '../constants';
import { dbService } from '../services/dbService';

interface Props {
  currentUser: User;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateEventModal: React.FC<Props> = ({ currentUser, onClose, onSuccess }) => {
  const [text, setText] = useState('');
  const [type, setType] = useState<'diario' | 'plan' | 'falta'>('plan');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([currentUser.name]);
  
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [isSaving, setIsSaving] = useState(false);

  const toggleParticipant = (userName: string) => {
    setSelectedParticipants(prev => 
      prev.includes(userName) ? prev.filter(p => p !== userName) : [...prev, userName]
    );
  };

  const handleSave = async () => {
    if (!text.trim()) return;
    setIsSaving(true);

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const datesToCreate: string[] = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        datesToCreate.push(new Date(d).toISOString().split('T')[0]);
      }

      const promises = datesToCreate.map(dateStr => 
        dbService.addEntry({
          date: dateStr,
          person: currentUser.name,
          participants: selectedParticipants.length > 0 ? selectedParticipants : [currentUser.name],
          text,
          type,
          completed: false
        })
      );

      await Promise.all(promises);
      onSuccess(); 
      onClose();   
      
    } catch (error) {
      console.error(error);
      alert('Error al crear los eventos');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        
        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Nuevo Evento</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Desde</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"/>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Hasta</label>
              <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"/>
            </div>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
            <button onClick={() => setType('diario')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition ${type === 'diario' ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}>DIARIO</button>
            <button onClick={() => setType('plan')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition ${type === 'plan' ? 'bg-white shadow text-green-600' : 'text-gray-400'}`}>PLAN</button>
            <button onClick={() => { setType('falta'); setText('Falta Injustificada'); }} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition ${type === 'falta' ? 'bg-white shadow text-red-600' : 'text-gray-400'}`}>FALTA</button>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Participantes</p>
            <div className="flex flex-wrap gap-2">
              {USERS.map(user => (
                <button
                  key={user.name}
                  onClick={() => toggleParticipant(user.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                    selectedParticipants.includes(user.name) 
                      ? 'bg-gray-800 text-white border-gray-800' 
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: user.color }} />
                  {user.name}
                </button>
              ))}
            </div>
          </div>

          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Descripción..."
            className="w-full p-3 border rounded-xl text-sm h-24 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
          />

          <button 
            onClick={handleSave}
            disabled={isSaving || !text.trim()}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Crear Evento'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;
