import { User } from './types';

export const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const DAYS_OF_WEEK = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

export const USERS: User[] = [
  { id: '1', name: 'Naima', email: 'naima@practicas.com', role: 'EDITOR', color: '#00BCD4' }, // Cyan
  { id: '2', name: 'David', email: 'david@practicas.com', role: 'EDITOR', color: '#4CAF50' }, // Verde
  { id: '3', name: 'Pablo', email: 'pablo@practicas.com', role: 'EDITOR', color: '#FF9800' }, // Naranja
  { id: '4', name: 'Iria', email: 'iria@practicas.com', role: 'EDITOR', color: '#9C27B0' }, // Morado
  { id: '5', name: 'Cátedra', email: 'catedra@practicas.com', role: 'VIEWER', color: '#9b9b9b' }, // Gris
  { id: '6', name: 'Ana Bedate', email: 'ana@practicas.com', role: 'VIEWER', color: '#9b9b9b' } // Gris
];
