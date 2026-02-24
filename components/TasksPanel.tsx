import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { dbService } from '../services/dbService';

interface Props { currentUser: User; onClose: () => void; }

const TasksPanel: React.FC<Props> = ({ currentUser, onClose }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    const data = await dbService.getTasks(currentUser.name);
    setTasks(data);
  };

  const handleAdd = async () => {
    if (!newTask.trim()) return;
    await dbService.addTask(currentUser.name, newTask);
    setNewTask('');
    loadTasks();
  };

  const toggleTask = async (task: any) => {
    await dbService.updateTask(task.id, !task.completed);
    loadTasks();
  };

  const deleteBtn = async (id: string) => {
    await dbService.deleteTask(id);
    loadTasks();
  };

  return (
    <div className="absolute top-0 right-0 w-full md:w-96 h-full bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col animate-slide-in">
      <div className="p-6 border-b flex justify-between bg-indigo-50">
        <div>
          <h3 className="text-lg font-bold text-indigo-900">Mis Tareas Rápidas</h3>
          <p className="text-xs text-indigo-600 font-medium">Solo tú ves esta lista</p>
        </div>
        <button onClick={onClose} className="text-indigo-400 hover:text-indigo-800 font-bold">✕</button>
      </div>

      <div className="p-4 border-b flex gap-2">
        <input 
          type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)}
          placeholder="Añadir tarea pendiente..." 
          className="flex-1 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button onClick={handleAdd} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700">+</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {tasks.map(task => (
          <div key={task.id} className={`flex items-center justify-between p-3 rounded-xl border bg-white shadow-sm transition ${task.completed ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task)} className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"/>
              <span className={`text-sm font-medium truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.text}</span>
            </div>
            <button onClick={() => deleteBtn(task.id)} className="text-gray-300 hover:text-red-500 ml-2">🗑️</button>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-center text-gray-400 mt-10 text-sm">No tienes tareas pendientes.</p>}
      </div>
    </div>
  );
};
export default TasksPanel;
