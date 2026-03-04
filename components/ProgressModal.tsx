import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { USERS } from '../constants';
import { dbService } from '../services/dbService';

interface Props { currentUser: User; onClose: () => void; }

const ProgressModal: React.FC<Props> = ({ currentUser, onClose }) => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [myEndDate, setMyEndDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const isViewer = currentUser.role === 'VIEWER';
  const editors = USERS.filter(u => u.role === 'EDITOR');

  useEffect(() => { loadProfiles(); }, []);

  const loadProfiles = async () => {
    const data = await dbService.getProfiles();
    setProfiles(data);
    if (!isViewer) {
      const myProfile = data.find((p: any) => p.user_name === currentUser.name);
      if (myProfile?.end_date) setMyEndDate(myProfile.end_date);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await dbService.updateProfile(currentUser.name, myEndDate);
    await loadProfiles();
    setIsSaving(false);
  };

  const calculateDaysLeft = (endDateStr: string) => {
    if (!endDateStr) return null;
    const end = new Date(endDateStr);
    const today = new Date();
    end.setHours(0,0,0,0); today.setHours(0,0,0,0);
    const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  };

  // --- NUEVA FUNCIÓN MÁGICA PARA GENERAR EL INFORME ---
  const downloadReport = async (userName: string) => {
    setIsGenerating(userName);
    try {
      const allEntries = await dbService.getEntries();
      
      // Filtramos solo las de esta persona y las ordenamos desde la más antigua a la más nueva
      const userEntries = allEntries
        .filter(e => e.person === userName || e.participants?.includes(userName))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (userEntries.length === 0) {
        alert(`No hay registros guardados para ${userName}.`);
        setIsGenerating(null);
        return;
      }

      // Creamos el texto del informe
      let reportContent = `==================================================\n`;
      reportContent += ` INFORME DE PRÁCTICAS - CÁTEDRA DE INNOVACIÓN\n`;
      reportContent += `==================================================\n\n`;
      reportContent += `🧑‍🎓 Alumno/a: ${userName}\n`;
      reportContent += `📅 Fecha de generación: ${new Date().toLocaleDateString('es-ES')}\n`;
      reportContent += `📊 Total de registros: ${userEntries.length}\n\n`;
      reportContent += `--- HISTORIAL DE ACTIVIDAD ---\n\n`;

      userEntries.forEach(entry => {
        const typeLabel = entry.type.toUpperCase();
        const status = entry.type === 'plan' ? (entry.completed ? '[✓ Completado]' : '[⏳ Pendiente]') : '';
        const isFalta = entry.type === 'falta' ? '❌ ' : '';
        
        reportContent += `${isFalta}Fecha: ${entry.date} | Tipo: ${typeLabel} ${status}\n`;
        reportContent += `📝 Tarea: ${entry.text}\n`;
        reportContent += `--------------------------------------------------\n`;
      });

      // Creamos un archivo de texto virtual y forzamos la descarga
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Informe_Practicas_${userName.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error al generar el informe:", error);
      alert("Hubo un error al generar el documento.");
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">{isViewer ? 'Torre de Control (Progreso)' : 'Mi Progreso'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
        </div>
        <div className="p-6 overflow-y-auto">
          {!isViewer ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Configura cuándo terminan tus prácticas.</p>
              <input type="date" value={myEndDate} onChange={(e) => setMyEndDate(e.target.value)} className="w-full p-3 border rounded-xl text-sm font-medium outline-none"/>
              {myEndDate && (
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-center">
                  <p className="text-sm text-indigo-800 mb-1">Te quedan:</p>
                  <p className="text-4xl font-bold text-indigo-600">{calculateDaysLeft(myEndDate)} <span className="text-lg">días</span></p>
                </div>
              )}
              <button onClick={handleSave} disabled={isSaving || !myEndDate} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 mt-4">
                {isSaving ? 'Guardando...' : 'Guardar Fecha'}
              </button>
              
              {/* BOTÓN DEL ALUMNO PARA DESCARGAR SU INFORME */}
              <button 
                onClick={() => downloadReport(currentUser.name)} 
                disabled={isGenerating === currentUser.name}
                className="w-full py-3 bg-gray-100 text-gray-700 border border-gray-300 rounded-xl font-bold hover:bg-gray-200 transition mt-2 flex items-center justify-center gap-2"
              >
                📄 {isGenerating === currentUser.name ? 'Generando...' : 'Descargar mi informe de prácticas'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {editors.map(editor => {
                const profile = profiles.find((p: any) => p.user_name === editor.name);
                const daysLeft = profile ? calculateDaysLeft(profile.end_date) : null;
                return (
                  <div key={editor.name} className="flex items-center justify-between p-3 border bg-gray-50 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: editor.color }}>{editor.name.charAt(0)}</div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-sm">{editor.name}</span>
                        {/* BOTÓN DE LOS ADMINISTRADORES PARA DESCARGAR INFORME */}
                        <button 
                          onClick={() => downloadReport(editor.name)}
                          disabled={isGenerating === editor.name}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold text-left mt-0.5"
                        >
                          {isGenerating === editor.name ? 'Generando...' : '📄 Descargar Informe'}
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      {daysLeft !== null ? (
                        <div className="flex flex-col">
                          <span className={`text-xl font-bold leading-none ${daysLeft < 15 ? 'text-orange-600' : 'text-indigo-600'}`}>{daysLeft} <span className="text-xs text-gray-500">días</span></span>
                        </div>
                      ) : <span className="text-xs text-gray-400 italic">Sin configurar</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProgressModal;
