import { User } from './types';

export const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const DAYS_OF_WEEK = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

export const USERS: User[] = [
  { id: '1', name: 'Naima', email: 'naima@practicas.com', role: 'EDITOR', color: '#00BCD4' }, // Cyan
  { id: '2', name: 'David', email: 'david@practicas.com', role: 'EDITOR', color: '#4CAF50' }, // Verde
  { id: '3', name: 'Prácticas 3', email: 'p3@practicas.com', role: 'EDITOR', color: '#FF9800' }, // Naranja (hueco libre)
  { id: '5', name: 'Cátedra', email: 'catedra@practicas.com', role: 'VIEWER', color: '#3F51B5' }, // Índigo
  { id: '6', name: 'Ana Bedate', email: 'ana@practicas.com', role: 'VIEWER', color: '#E91E63' } // Rosa
];
