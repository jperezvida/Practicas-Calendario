import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// 1. OBTENCIÓN DE LA CLAVE
const API_KEY = 
  import.meta.env.VITE_GEMINI_API_KEY || 
  import.meta.env.VITE_API_KEY || 
  "";

const cleanKey = API_KEY.trim();

// 2. INICIALIZACIÓN
const genAI = cleanKey ? new GoogleGenerativeAI(cleanKey) : null;

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

// --- CAMBIO AQUÍ: Usamos "gemini-pro" que es el modelo universal ---
const model = genAI 
  ? genAI.getGenerativeModel({ model: "gemini-pro", safetySettings }) 
  : null;

export interface VoiceParsingResult {
  text: string;
  date: string;
}

// --- FUNCIÓN 1: CONSEJO ---
export async function getInnovationTip(): Promise<{ title: string; content: string } | null> {
  if (!model) return null;
  
  const prompt = "Genera un consejo muy breve (máximo 15 palabras) sobre innovación en el comercio minorista. Devuelve JSON: { \"title\": \"TITULO\", \"content\": \"Consejo\" }";
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

// --- FUNCIÓN 2: VOZ ---
export async function parseVoiceCommand(command: string): Promise<VoiceParsingResult> {
  const today = new Date().toISOString().split('T')[0];
  if (!model) return { text: command, date: today };

  const prompt = `Analiza: "${command}". Hoy es ${today}. Extrae tarea ("text") y fecha ("date" YYYY-MM-DD). Devuelve JSON: { "text": "...", "date": "..." }`;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(text);
    return { 
      text: parsed.text || command, 
      date: parsed.date || today 
    };
  } catch (error) {
    return { text: command, date: today };
  }
}

// --- FUNCIÓN 3: REPORTE SEMANAL ---
export async function generateWeeklyReport(entries: any[]): Promise<string> {
  if (!cleanKey) {
    return "ERROR DE CONFIGURACIÓN: No se encuentra ninguna API Key. Revisa las variables de entorno en Vercel.";
  }

  if (!model) {
    return "ERROR DE INICIALIZACIÓN: Fallo al cargar el modelo Gemini Pro.";
  }

  if (entries.length === 0) {
    return "No hay suficiente actividad esta semana para generar un reporte.";
  }

  const prompt = `
    Actúa como secretario. Genera un RESUMEN EJECUTIVO SEMANAL breve (max 150 palabras) de estas tareas:
    ${entries.map(e => `- [${e.date}] ${e.person}: ${e.text}`).join('\n')}
    Estructura: 1. Hitos, 2. Equipo, 3. Pasos. Tono formal. Texto plano.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: unknown) {
    console.error("Error reporte:", error);
    
    let errorMessage = "Error desconocido";
    if (error instanceof Error) errorMessage = error.message;
    else errorMessage = String(error);

    return `ERROR DE GOOGLE: ${errorMessage}`;
  }
}
