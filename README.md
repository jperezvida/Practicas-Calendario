
# Calendario de Trabajo - Cátedra de Innovación para el Comercio

Aplicación web diseñada para la gestión diaria y planificación del equipo.

## 🚀 Arquitectura
- **Frontend:** React 18 con TypeScript y Tailwind CSS.
- **Estado:** Hooks de React (`useState`, `useMemo`, `useEffect`).
- **Persistencia:** Simulación de DB vía LocalStorage (Preparado para Firebase Firestore).

## 🛠️ Instalación y Despliegue

### Requisitos Previos
1. Node.js instalado.

### Desarrollo Local
```bash
npm install
npm run dev
```

### Despliegue en Producción (Firebase)
1. Instala Firebase CLI: `npm install -g firebase-tools`.
2. `firebase login` y `firebase init`.
3. Selecciona Hosting y Firestore.
4. Genera el build: `npm run build`.
5. Despliega: `firebase deploy`.

## 🔒 Usuarios y Roles
| Nombre | Email | Rol | Color |
| :--- | :--- | :--- | :--- |
| África | africa@comercio.es | EDITOR | #E91E63 |
| Adrián | adrian@comercio.es | EDITOR | #3F51B5 |
| Álvaro | alvaro@comercio.es | EDITOR | #4CAF50 |
| Jaime | jaime@comercio.es | EDITOR | #FF9800 |
| José Antonio | joseantonio@comercio.es | VIEWER | #9E9E9E |
| Chanthaly | chanthaly@comercio.es | VIEWER | #9E9E9E |

## 🧪 Estrategia de Pruebas Manuales
1. **Acceso:** Seleccionar un perfil en la pantalla inicial para acceder.
2. **Permisos:** Como África (EDITOR), crear una tarea. Intentar editarla (Ok). Loguear como José Antonio (VIEWER), intentar editar la tarea de África (No debe aparecer opción de edición).
3. **Filtros:** Crear varias tareas para Adrián y Álvaro. Desmarcar "Adrián" en el filtro superior. (Las tareas de Adrián deben desaparecer).
4. **Búsqueda:** Utilizar la barra de búsqueda para filtrar tareas por contenido de texto.
