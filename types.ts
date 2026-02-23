export type Role = 'EDITOR' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  color: string;
}

export interface Entry {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  type: 'diario' | 'plan' | 'falta'; // <--- CAMBIO AQUÍ
  person: string;           
  participants?: string[];  
  completed?: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export type ViewType = 'month' | 'week';

export interface FilterState {
  persons: string[];
  search: string;
}

export interface InnovationTip {
  title: string;
  content: string;
}
