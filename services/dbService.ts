import { createClient } from '@supabase/supabase-js';
import { Entry } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY; 

export const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export const dbService = {
  // --- ENTRIES (Calendario) ---
  getEntries: async (): Promise<Entry[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('entries').select('*');
    if (error) console.error(error);
    return data as Entry[] || [];
  },
  addEntry: async (entry: any) => {
    if (!supabase) return null;
    const { id, ...entryData } = entry; 
    const { data, error } = await supabase.from('entries').insert([entryData]).select();
    if (error) throw error;
    return data ? data[0] : null;
  },
  updateEntry: async (entry: any) => {
    if (!supabase) return;
    const { error } = await supabase.from('entries').update(entry).eq('id', entry.id);
    if (error) throw error;
  },
  deleteEntry: async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('entries').delete().eq('id', id);
    if (error) throw error;
  },

  // --- TABLÓN DE ANUNCIOS ---
  getAnnouncement: async () => {
    if (!supabase) return '';
    const { data } = await supabase.from('announcements').select('text').eq('id', 1).single();
    return data ? data.text : '';
  },
  updateAnnouncement: async (text: string) => {
    if (!supabase) return;
    await supabase.from('announcements').upsert({ id: 1, text, updatedAt: Date.now() });
  },

  // --- PROGRESO (Perfiles) ---
  getProfiles: async () => {
    if (!supabase) return [];
    const { data } = await supabase.from('user_profiles').select('*');
    return data || [];
  },
  updateProfile: async (user_name: string, end_date: string) => {
    if (!supabase) return;
    await supabase.from('user_profiles').upsert({ user_name, end_date });
  },

  // --- MIS TAREAS ---
  getTasks: async (person: string) => {
    if (!supabase) return [];
    const { data } = await supabase.from('tasks').select('*').eq('person', person).order('createdAt', { ascending: false });
    return data || [];
  },
  addTask: async (person: string, text: string) => {
    if (!supabase) return;
    await supabase.from('tasks').insert([{ person, text, completed: false, createdAt: Date.now() }]);
  },
  updateTask: async (id: string, completed: boolean) => {
    if (!supabase) return;
    await supabase.from('tasks').update({ completed }).eq('id', id);
  },
  deleteTask: async (id: string) => {
    if (!supabase) return;
    await supabase.from('tasks').delete().eq('id', id);
  }
};
