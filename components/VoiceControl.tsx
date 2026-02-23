import React, { useState, useRef } from 'react';
import { User } from '../types';
import { parseVoiceCommand, VoiceParsingResult } from '../services/geminiService';
import { dbService } from '../services/dbService';

interface Props {
  currentUser: User;
  onEntryCreated: () => void;
}

const VoiceControl: React.FC<Props> = ({ currentUser, onEntryCreated }) => {
  const [isListening, setIsListening] = useState(false);
  const [prediction, setPrediction] = useState<VoiceParsingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    if (currentUser.role !== 'EDITOR') return;

    // Compatibilidad con navegadores (Chrome/Edge/Android)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz. Prueba con Google Chrome.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'es-ES';
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setTranscript('Escuchando...');
    };

    recognitionRef.current.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(`Analizando: "${text}"`);
      setIsProcessing(true);
      
      try {
        const result = await parseVoiceCommand(text);
        setPrediction(result);
      } catch (error) {
        setTranscript('No te he entendido bien.');
      } finally {
        setIsProcessing(false);
        setIsListening(false);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Error de voz:", event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        alert("Permiso denegado. Activa el micrófono en el navegador.");
      } else {
        setTranscript('Error al escuchar. Inténtalo de nuevo.');
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const confirmEntry = async () => {
    if (prediction) {
      // CORRECCIÓN IMPORTANTE:
      // 1. Usamos 'addEntry' en vez de 'saveEntry'
      // 2. Añadimos el array de 'participants'
      await dbService.addEntry({
        date: prediction.date,
        person: currentUser.name,
        participants: [currentUser.name], // <--- AÑADIDO: Tu nombre como participante
        text: prediction.text,
        type: 'plan', // Por defecto los audios son planes
        createdBy: currentUser.id
      } as any);

      onEntryCreated();
      setPrediction(null);
      setTranscript('');
    }
  };

  if (currentUser.role !== 'EDITOR') return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-4 z-50">
      {prediction && (
        <div className="bg-white p-5 rounded-2xl shadow-2xl border border-pink-100 max-w-sm animate-bounce-in">
          <h4 className="font-bold text-pink-600 text-sm mb-2">Confirmar Registro por Voz</h4>
          <div className="bg-gray-50 p-3 rounded-lg mb-4 text-xs">
            <p className="mb-1"><span className="text-gray-400 font-medium">Texto:</span> {prediction.text}</p>
            <p><span className="text-gray-400 font-medium">Fecha:</span> {new Date(prediction.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setPrediction(null)}
              className="flex-1 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button 
              onClick={confirmEntry}
              className="flex-2 bg-pink-600 text-white py-2 px-4 text-xs font-bold rounded-lg shadow-md hover:bg-pink-700 transition"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      {isListening && !prediction && (
        <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-gray-100 animate-pulse text-xs font-medium text-gray-500 mb-2">
          {transcript}
        </div>
      )}

      <button 
        onClick={isListening ? () => recognitionRef.current?.stop() : startListening}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition transform hover:scale-110 active:scale-95 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-pink-600'} text-white`}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default VoiceControl;
