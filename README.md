# 🎵 MelodyPath — Plataforma Inteligente de Aprendizaje Musical con IA

**Proyecto:** Plataforma Inteligente de Aprendizaje Musical Gamificado con Inteligencia Artificial  
**Asignatura:** Ingeniería de Software I  
**Docente:** Ing. Martínez Canedo Rolando Antonio  
**Universidad:** UAGRM — Grupo 3

## 👥 Equipo

| Nombre | Rol |
|---|---|
| Melgar Alvis Alan Fabian | Product Owner |
| Angulo Heredia Luis Fernando | Developer |
| Cisneros Laura Moises David | Developer |
| Cortez Siles Claudia Liseth | Developer |
| Guzmán Riva Diana | Developer |
| Tapia Molina Claudia Evelin | Developer |

---

## 🏗️ Arquitectura

```
Proyectosw1/
├── frontend/          # Next.js 14 (React + TypeScript)
│   ├── app/           # App Router pages
│   │   ├── login/     # HU-001, HU-002
│   │   ├── dashboard/ # HU-003..HU-020
│   │   └── admin/     # HU-021..HU-026
│   ├── components/    # UI components reutilizables
│   ├── hooks/         # useAuth, useProgress, etc.
│   └── lib/           # api.ts (Axios client)
│
└── backend/           # Django 5.2 + DRF
    ├── melodypath/    # Config principal
    └── apps/
        ├── users/         # HU-001, HU-002, HU-021
        ├── instruments/   # HU-005, HU-006, HU-023
        ├── lessons/       # HU-007, HU-013, HU-022
        ├── exercises/     # HU-008, HU-009, HU-010
        ├── assessment/    # HU-003, HU-004, HU-012
        ├── gamification/  # HU-014, HU-015, HU-020, HU-024
        ├── progress/      # HU-016, HU-017
        ├── community/     # HU-018, HU-019, HU-026
        └── ai_analysis/   # HU-010, HU-011, HU-028
```

---

## ⚙️ Stack Tecnológico

### Frontend
- **Next.js 14** — Framework React con App Router
- **TypeScript** — Tipado estático
- **Axios** — Cliente HTTP con interceptores JWT
- **React Hot Toast** — Notificaciones
- **Recharts** — Gráficas de progreso

### Backend
- **Django 5.2** — Framework web Python
- **Django REST Framework** — API REST
- **SimpleJWT** — Autenticación JWT
- **PostgreSQL** — Base de datos relacional
- **Celery + Redis** — Tareas asíncronas
- **Librosa** — Análisis de audio con IA
- **scikit-learn / transformers** — ML y NLP
- **drf-yasg** — Documentación Swagger

---

## 🚀 Instalación y Arranque

### Requisitos previos
- Node.js 20 LTS
- Python 3.11+
- PostgreSQL 16
- Redis 7

---

### 1. Backend (Django)

```powershell
# Entrar al directorio backend
cd backend

# Crear entorno virtual
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
copy .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# Crear la base de datos en PostgreSQL
# (ejecutar en psql o pgAdmin)
# CREATE DATABASE melodypath_db;

# Ejecutar migraciones
python manage.py makemigrations
python manage.py migrate

# Cargar datos iniciales
python manage.py loaddata fixtures/instruments.json
python manage.py loaddata fixtures/lessons.json
python manage.py loaddata fixtures/badges.json

# Crear superusuario administrador
python manage.py createsuperuser

# Arrancar servidor de desarrollo
python manage.py runserver
```

Backend disponible en: `http://localhost:8000`  
API Docs (Swagger): `http://localhost:8000/api/docs/`  
Admin Django: `http://localhost:8000/django-admin/`

---

### 🌱 Datos de prueba (Seeds)

Ejecutar en orden dentro del directorio `backend/` con el entorno virtual activado:

```powershell
# 1. Instrumentos, insignias, retos y preguntas de evaluación
python manage.py shell < seed_data.py

# 2. Lecciones y ejercicios
python manage.py shell < seed_lessons.py

# 3. Usuarios de prueba
python manage.py shell < seed_users.py
```

#### Usuarios disponibles

| Rol | Nombre | Email | Contraseña | Instrumento | Nivel |
|-----|--------|-------|-----------|-------------|-------|
| 👑 Admin | Admin MelodyPath | `admin@melodypath.com` | `Admin123!` | — | 10 |
| ⭐ Premium | Luis Fernando | `luis@melodypath.com` | `Test123!` | Piano | 7 |
| ⭐ Premium | Fernando Dev | `fernando@melodypath.com` | `Test123!` | Guitarra | 5 |
| ⭐ Premium | Sofía López | `sofia@melodypath.com` | `Test123!` | Piano | 6 |
| 👤 Usuario | María García | `maria@melodypath.com` | `Test123!` | Canto | 3 |
| 👤 Usuario | Ana Pérez | `ana@melodypath.com` | `Test123!` | Violín | 4 |
| 👤 Usuario | Carlos Ruiz | `carlos@melodypath.com` | `Test123!` | Batería | 2 |
| 👤 Usuario | Diego Torres | `diego@melodypath.com` | `Test123!` | Trompeta | 1 |

> Los seeds usan `get_or_create`, por lo que son seguros de ejecutar varias veces sin duplicar datos.

---

### 2. Frontend (Next.js)

```powershell
# Entrar al directorio frontend
cd frontend

# Instalar dependencias
npm install

# Variables de entorno (ya configuradas en .env.local)
# NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Arrancar servidor de desarrollo
npm run dev
```

Frontend disponible en: `http://localhost:3000`

---

### 3. Celery (tareas asíncronas de IA)

```powershell
# En una terminal separada (con venv activado)
cd backend
celery -A melodypath worker --loglevel=info
```

---

## 📋 Historias de Usuario implementadas

| ID | Módulo | Descripción |
|---|---|---|
| HU-001 | Auth | Registro de usuario |
| HU-002 | Auth | Login seguro + recuperación de contraseña |
| HU-003 | Assessment | Evaluación diagnóstica inicial |
| HU-004 | Assessment | Clasificación automática de nivel por IA |
| HU-005 | Instruments | Selección de instrumento principal |
| HU-006 | Instruments | Cambio/adición de instrumentos |
| HU-007 | Lessons | Tutoriales interactivos con video |
| HU-008 | Exercises | Reconocimiento de notas y ritmo |
| HU-009 | Exercises | Identificación de notas del instrumento |
| HU-010 | AI | Retroalimentación inmediata con librosa |
| HU-011 | AI | Análisis de desempeño y recomendaciones |
| HU-012 | Assessment | Evaluaciones por módulo con resultados |
| HU-013 | Gamification | Desbloqueo de niveles con XP |
| HU-014 | Gamification | Logros e insignias automáticas |
| HU-015 | Gamification | Retos diarios y semanales |
| HU-016 | Progress | Visualización de progreso general |
| HU-017 | Progress | Recordatorios de práctica |
| HU-018 | Community | Compartir logros |
| HU-019 | Community | Comunidades de aprendizaje |
| HU-020 | Gamification | Rankings y competencias |
| HU-021 | Admin | Gestión de usuarios |
| HU-022 | Admin | CRUD de lecciones |
| HU-023 | Admin | Gestión de instrumentos y niveles |
| HU-024 | Admin | Administración de retos y recompensas |
| HU-025 | Admin | Estadísticas de la plataforma |
| HU-026 | Admin | Gestión de comunidades externas |
| HU-027 | Premium | Contenido exclusivo |
| HU-028 | Premium | Análisis avanzado de desempeño |

---

## 🔑 API Endpoints principales

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/register/` | Registro |
| POST | `/api/auth/login/` | Login JWT |
| POST | `/api/auth/token/refresh/` | Refresh token |
| GET | `/api/auth/me/` | Perfil actual |
| POST | `/api/auth/password-reset/` | Recuperar contraseña |
| GET | `/api/instruments/` | Listar instrumentos |
| GET | `/api/lessons/` | Listar lecciones |
| POST | `/api/lessons/{id}/complete/` | Completar lección |
| GET | `/api/assessment/initial/` | Evaluación inicial |
| POST | `/api/assessment/initial/submit/` | Enviar respuestas |
| POST | `/api/exercises/{id}/submit/` | Enviar ejercicio |
| POST | `/api/ai/audio/` | Análisis de audio (librosa) |
| GET | `/api/ai/recommendations/` | Recomendaciones IA |
| GET | `/api/challenges/` | Retos activos |
| GET | `/api/ranking/` | Ranking semanal |
| GET | `/api/progress/stats/` | Estadísticas de progreso |
| GET | `/api/community/` | Comunidades |

---

## 📁 Convención de ramas Git

```
main          ← Producción estable
develop       ← Integración continua
feature/HU-XXX ← Una rama por historia de usuario
hotfix/...    ← Correcciones urgentes
```
