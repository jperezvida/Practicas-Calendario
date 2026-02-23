import { createClient } from '@supabase/supabase-js';
import { Entry } from '../types';

// 1. Conectamos con las claves que guardaste en Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Protección: Si no hay claves, no intenta conectar para no dar error
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const dbService = {
  // --- LEER DATOS (Desde la nube) ---
  getEntries: async (): Promise<Entry[]> => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('entries')
      .select('*');
    
    if (error) {
      console.error('Error cargando de Supabase:', error);
      return [];
    }
    return data as Entry[];
  },
  
  // --- AÑADIR DATO (A la nube) ---
  addEntry: async (entry: any) => {
    if (!supabase) return null;

    // Quitamos el ID temporal local. Supabase generará uno oficial.
    const { id, ...entryData } = entry; 
    
    const { data, error } = await supabase
      .from('entries')
      .insert([entryData])
      .select()
      .single();

    if (error) {
      console.error('Error guardando en Supabase:', error);
      return null;
    }
    return data;
  },

  // --- ACTUALIZAR DATO ---
  updateEntry: async (entry: any) => {
    if (!supabase) return;

    const { error } = await supabase
      .from('entries')
      .update(entry)
      .eq('id', entry.id);

    if (error) console.error('Error actualizando en Supabase:', error);
  },

  // --- BORRAR DATO ---
  deleteEntry: async (id: string) => {
    if (!supabase) return;

    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id);

    if (error) console.error('Error borrando en Supabase:', error);
  }
};
