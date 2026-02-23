
import React from 'react';
import { USERS } from '../constants';
import { User } from '../types';

interface Props {
  onLogin: (email: string) => void;
}

const AuthForm: React.FC<Props> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-2xl w-full">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-pink-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-pink-200">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 text-center tracking-tight">Cátedra Innovación para el Comercio</h1>
          <p className="text-gray-500 text-base mt-2 font-medium">Selecciona tu perfil para acceder al calendario</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {USERS.map((user: User) => (
            <button
              key={user.id}
              onClick={() => onLogin(user.email)}
              className="group flex flex-col items-center p-4 rounded-2xl border-2 border-transparent hover:border-pink-100 hover:bg-pink-50/50 transition-all transform hover:-translate-y-1 active:scale-95"
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3 shadow-md group-hover:shadow-lg transition-all"
                style={{ backgroundColor: user.color }}
              >
                {user.name.charAt(0)}
              </div>
              <span className="text-sm font-bold text-gray-800 group-hover:text-pink-600 transition-colors">{user.name}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mt-1">{user.role === 'EDITOR' ? 'Editor' : 'Lector'}</span>
            </button>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 font-medium">Gestión de equipo y planificación diaria</p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
