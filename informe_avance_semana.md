# Informe de Avance Semanal — MelodyPath
**Integrante:** Angulo Heredia Luis Fernando  
**Período:** 21 de mayo al 25 de mayo de 2026  
**Repositorio:** ProyectoSW1MelodyPath — rama `main` / `mainfernando`

---

## Resumen Ejecutivo

Durante esta semana se realizaron **4 commits** abarcando mejoras en el frontend del dashboard, creación de datos de prueba compartidos para el equipo, documentación del proyecto y la implementación de una funcionalidad de **lecciones personalizadas con Inteligencia Artificial** usando la API de Claude (Anthropic).

---

## Cambios Realizados

### 1. Mejoras en el Dashboard — Frontend
**Commit:** `e3aa1ac` — 24 de mayo, 21:55  
**Archivo modificado:** `frontend/app/dashboard/page.tsx`

- Se reemplazaron los íconos de componentes React (`FiAward`, `GiMusicalNotes`, etc.) por emojis nativos en la sección de insignias disponibles, mejorando la compatibilidad y simplicidad visual.
- Se corrigió la visualización del **ranking de usuarios**: ahora muestra medallas con colores diferenciados por posición (oro, plata, bronce).
- Se eliminó código duplicado y roto en la sección de lecciones que generaba errores de renderizado.

**Archivos afectados:** 1 archivo — 27 líneas agregadas, 29 eliminadas.

---

### 2. Seeder de Usuarios de Prueba
**Commit:** `95426ab` — 24 de mayo, 22:00  
**Archivo creado:** `backend/seed_users.py`

Se creó un script de seed para que todo el equipo trabaje con los **mismos usuarios de prueba** en su entorno local. Incluye 8 usuarios con diferentes roles, instrumentos, niveles y datos de progreso.

| Rol | Usuario | Email | Instrumento | Nivel |
|-----|---------|-------|-------------|-------|
| Admin | Admin MelodyPath | admin@melodypath.com | — | 10 |
| Premium | Luis Fernando | luis@melodypath.com | Piano | 7 |
| Premium | Fernando Dev | fernando@melodypath.com | Guitarra | 5 |
| Premium | Sofía López | sofia@melodypath.com | Piano | 6 |
| Usuario | María García | maria@melodypath.com | Canto | 3 |
| Usuario | Ana Pérez | ana@melodypath.com | Violín | 4 |
| Usuario | Carlos Ruiz | carlos@melodypath.com | Batería | 2 |
| Usuario | Diego Torres | diego@melodypath.com | Trompeta | 1 |

**Ejecución:** `python manage.py shell < seed_users.py`  
El script usa `get_or_create`, por lo que es seguro ejecutarlo múltiples veces.

**Archivos afectados:** 1 archivo nuevo — 224 líneas.

---

### 3. Documentación en README
**Commit:** `7c9a3c9` — 24 de mayo, 22:02  
**Archivo modificado:** `README.md`

Se agregó la sección **"🌱 Datos de prueba (Seeds)"** al README principal con:
- Orden correcto de ejecución de los 3 scripts de seed (`seed_data.py` → `seed_lessons.py` → `seed_users.py`).
- Tabla completa de usuarios con credenciales para que el equipo pueda consultarla directamente en GitHub.

**Archivos afectados:** 1 archivo — 32 líneas agregadas.

---

### 4. Lecciones Personalizadas con IA — Backend
**Commit:** `7de3b83` — 24 de mayo, 22:23 (rama `mainfernando`)  
**Archivos modificados/creados:**
- `backend/apps/ai_analysis/views.py`
- `backend/apps/ai_analysis/urls.py`
- `backend/melodypath/settings.py`
- `backend/requirements.txt`
- `backend/.env.example`

Se implementó el endpoint **`GET /api/ai/personalized-lessons/`** que genera recomendaciones de lecciones personalizadas usando la **API de Claude (Anthropic)**.

**Flujo del endpoint:**
1. Recopila el perfil completo del usuario autenticado: instrumento, nivel XP, nivel inicial (evaluación diagnóstica), racha de práctica, lecciones ya completadas y precisión por tipo de ejercicio.
2. Filtra lecciones disponibles: mismo instrumento, no completadas, activas y según estado premium.
3. Envía el contexto a **Claude** (`claude-haiku`) con un prompt de tutor musical.
4. Claude selecciona entre 3 y 5 lecciones y genera una **explicación personalizada** en español para cada una.
5. Guarda las recomendaciones en el modelo `UserRecommendation` para historial.

**Ejemplo de respuesta:**
```json
{
  "mensaje_general": "¡Hola Luis! Llevas 15 días de racha consecutiva, eso demuestra mucha dedicación. Aquí tienes las lecciones más adecuadas para tu nivel actual en Piano.",
  "lecciones": [
    {
      "id": 3,
      "title": "Escalas de Piano — Nivel Intermedio",
      "level": "intermediate",
      "xp_reward": 50,
      "duration_minutes": 20,
      "ai_explanation": "Tu precisión en reconocimiento de notas está en 72%. Esta lección trabaja directamente ese punto y te preparará para los ejercicios de acordes del siguiente nivel."
    }
  ],
  "tokens_usados": 412
}
```

**Dependencia agregada:** `anthropic>=0.40` en `requirements.txt`.  
**Variable de entorno requerida:** `ANTHROPIC_API_KEY` en `.env`.

**Archivos afectados:** 5 archivos — 195 líneas agregadas.

---

## Historias de Usuario Relacionadas

| ID | Descripción | Estado |
|----|-------------|--------|
| HU-003 | Evaluación diagnóstica inicial | Base utilizada para perfil de usuario |
| HU-011 | Retroalimentación y recomendaciones con IA | ✅ Implementado |
| HU-013 | Desbloqueo y progresión de niveles | ✅ Apoyado por el motor de recomendaciones |
| HU-016 | Visualización de progreso | ✅ Datos de progreso integrados en el perfil IA |
| HU-020 | Rankings y competencias | ✅ Visualización corregida en dashboard |

---

## Estadísticas del Período

| Métrica | Valor |
|---------|-------|
| Commits realizados | 4 |
| Archivos modificados/creados | 8 |
| Líneas agregadas | +478 |
| Líneas eliminadas | -29 |
| Ramas activas | `main`, `mainfernando` |

---

## Pendiente / Próximos Pasos

- Conectar el endpoint `/api/ai/personalized-lessons/` con el frontend (dashboard o sección de lecciones).
- Agregar la `ANTHROPIC_API_KEY` al `.env` de cada integrante del equipo para habilitar la funcionalidad.
- Prueba completa del endpoint en entorno local con datos reales.
- Integrar las lecciones personalizadas en la interfaz de usuario (HU-007 / HU-013).
