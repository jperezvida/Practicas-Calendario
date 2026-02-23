
/**
 * PASOS PARA CONFIGURAR FIREBASE REAL:
 * 
 * 1. Crea un proyecto en https://console.firebase.google.com
 * 2. Activa Firestore Database y Authentication (Email/Password).
 * 3. Crea una web app en el proyecto y copia las credenciales aquí.
 * 4. Configura las reglas de seguridad:
 * 
 * match /entries/{entryId} {
 *   allow read: if request.auth != null;
 *   allow create: if request.auth != null && getRole(request.auth.token.email) == 'EDITOR';
 *   allow update, delete: if request.auth != null && resource.data.createdBy == request.auth.uid;
 * }
 */

export const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_ID",
  appId: "TU_APP_ID"
};
