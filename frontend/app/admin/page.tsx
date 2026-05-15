"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const MOCK_STATS = { total_users:3, new_this_week:1, premium_users:1, total_lessons:0, total_completions:0, avg_accuracy_percent:0 };
const MOCK_USERS = [
  { id:1, name:"Ana García",   email:"user@demo.com",    role:"user",  is_active:true, level:3, xp:2450, streak:7  },
  { id:2, name:"Fernando",     email:"fernando123@gmail.com", role:"admin", is_active:true, level:10, xp:9800, streak:30 },
  { id:3, name:"Laura Premium",email:"premium@demo.com", role:"premium",is_active:true, level:7, xp:6200, streak:15 },
];

export default function AdminPage() {
  const router = useRouter();
  const [active, setActive] = useState("dashboard");

  useEffect(() => {
    if (!Cookies.get("access_token")) router.push("/login");
  }, []);

  const logout = () => { Cookies.remove("access_token"); Cookies.remove("refresh_token"); router.push("/login"); };

  const nav = [
    { id:"dashboard", icon:"📊", label:"Dashboard" },
    { id:"users",     icon:"👥", label:"Usuarios" },
    { id:"lessons",   icon:"📚", label:"Lecciones" },
    { id:"instruments",icon:"🎸",label:"Instrumentos" },
    { id:"challenges",icon:"⚡", label:"Retos" },
    { id:"community", icon:"🌐", label:"Comunidades" },
    { id:"stats",     icon:"📈", label:"Estadísticas" },
  ];

  const content: Record<string, React.ReactNode> = {
    dashboard: (
      <div>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"4px"}}>Panel de Administración ⚙️</h2>
        <p className="text-secondary mb-6">Resumen general de la plataforma MelodyPath.</p>
        <div className="stats-grid">
          {[
            {icon:"👥",value:MOCK_STATS.total_users,label:"Usuarios totales"},
            {icon:"🆕",value:MOCK_STATS.new_this_week,label:"Nuevos esta semana"},
            {icon:"⭐",value:MOCK_STATS.premium_users,label:"Usuarios premium"},
            {icon:"📚",value:MOCK_STATS.total_lessons,label:"Lecciones activas"},
          ].map((s,i)=>(
            <div key={i} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="grid-2 mt-4">
          <div className="card">
            <h3 className="section-title mb-4">🔗 API Endpoints</h3>
            {[
              {label:"Swagger UI",url:"http://127.0.0.1:8000/api/docs/"},
              {label:"Django Admin",url:"http://127.0.0.1:8000/django-admin/"},
              {label:"Usuarios API",url:"http://127.0.0.1:8000/api/admin-panel/users/"},
              {label:"Instrumentos",url:"http://127.0.0.1:8000/api/instruments/"},
              {label:"Estadísticas",url:"http://127.0.0.1:8000/api/admin-panel/stats/"},
            ].map((link,i)=>(
              <a key={i} href={link.url} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--border)",color:"var(--accent-light)",textDecoration:"none",fontSize:"0.875rem"}}>
                {link.label} <span style={{fontSize:"0.75rem",color:"var(--text-muted)"}}>↗</span>
              </a>
            ))}
          </div>
          <div className="card">
            <h3 className="section-title mb-4">📋 Historias de Usuario</h3>
            {[
              {hu:"HU-021",desc:"Gestión de usuarios",done:true},
              {hu:"HU-022",desc:"CRUD de lecciones",done:true},
              {hu:"HU-023",desc:"Gestión de instrumentos",done:true},
              {hu:"HU-024",desc:"Admin retos y recompensas",done:true},
              {hu:"HU-025",desc:"Estadísticas de uso",done:true},
              {hu:"HU-026",desc:"Gestión de comunidades",done:true},
            ].map((hu,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                <span className="badge badge-accent">{hu.hu}</span>
                <span style={{fontSize:"0.85rem",flex:1}}>{hu.desc}</span>
                <span style={{color:"var(--green)",fontSize:"0.8rem"}}>✓</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    users: (
      <div>
        <div className="section-header">
          <div><h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem"}}>👥 Gestión de Usuarios</h2><p className="text-secondary text-sm">HU-021 — Control de acceso y administración</p></div>
          <button className="btn btn-primary btn-sm">+ Nuevo usuario</button>
        </div>
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Nivel</th><th>XP</th><th>Racha</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {MOCK_USERS.map(u=>(
                  <tr key={u.id}>
                    <td><div style={{fontWeight:600,color:"var(--text-primary)"}}>{u.name}</div></td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role==="admin"?"badge-red":u.role==="premium"?"badge-gold":"badge-cyan"}`}>{u.role}</span></td>
                    <td>{u.level}</td>
                    <td>{u.xp.toLocaleString()}</td>
                    <td>🔥 {u.streak}</td>
                    <td><span className="badge badge-green">Activo</span></td>
                    <td><button className="btn btn-ghost btn-sm">✏️</button><button className="btn btn-ghost btn-sm" style={{color:"var(--red)"}}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ),
    lessons: (
      <div>
        <div className="section-header">
          <div><h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem"}}>📚 Gestión de Lecciones</h2><p className="text-secondary text-sm">HU-022 — Crear y actualizar contenido educativo</p></div>
          <button className="btn btn-primary btn-sm" onClick={()=>window.open("http://127.0.0.1:8000/django-admin/","_blank")}>+ Nueva lección ↗</button>
        </div>
        <div className="card">
          <p className="text-secondary">Las lecciones se gestionan desde el <a href="http://127.0.0.1:8000/django-admin/" target="_blank" style={{color:"var(--accent-light)"}}>panel Django Admin</a> o via la API REST.</p>
          <div className="mt-4"><a href="http://127.0.0.1:8000/api/docs/#/lessons" target="_blank" className="btn btn-secondary btn-sm">Ver endpoint /api/lessons/ ↗</a></div>
        </div>
      </div>
    ),
    instruments: (
      <div>
        <div className="section-header">
          <div><h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem"}}>🎸 Instrumentos</h2><p className="text-secondary text-sm">HU-023 — Organizar la oferta formativa</p></div>
        </div>
        <div className="grid-3">
          {[{e:"🎹",n:"Piano",cat:"Teclado",active:true},{e:"🎸",n:"Guitarra",cat:"Cuerda",active:true},{e:"🥁",n:"Batería",cat:"Percusión",active:true},{e:"🎤",n:"Canto",cat:"Voz",active:true},{e:"🎻",n:"Violín",cat:"Cuerda",active:true},{e:"🎺",n:"Trompeta",cat:"Viento",active:true}].map((ins,i)=>(
            <div key={i} className="card" style={{textAlign:"center"}}>
              <div style={{fontSize:"2.5rem",marginBottom:"8px"}}>{ins.e}</div>
              <div style={{fontWeight:700}}>{ins.n}</div>
              <span className="badge badge-muted mt-2">{ins.cat}</span>
              <div className="mt-4" style={{display:"flex",gap:"6px",justifyContent:"center"}}>
                <button className="btn btn-ghost btn-sm">✏️</button>
                <button className="btn btn-ghost btn-sm" style={{color:"var(--red)"}}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    challenges: (
      <div>
        <div className="section-header">
          <div><h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem"}}>⚡ Retos y Recompensas</h2><p className="text-secondary text-sm">HU-024 — Mantener el interés de los usuarios</p></div>
          <button className="btn btn-primary btn-sm">+ Nuevo reto</button>
        </div>
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Reto</th><th>Frecuencia</th><th>XP</th><th>Meta</th><th>Estado</th></tr></thead>
              <tbody>
                {[{title:"Práctica Diaria",freq:"Diario",xp:50,target:"1 lección"},{title:"Ejercitación",freq:"Diario",xp:30,target:"3 ejercicios"},{title:"Maratón Semanal",freq:"Semanal",xp:200,target:"5 lecciones"},{title:"Reto de Precisión",freq:"Semanal",xp:150,target:"3 evaluaciones 80%+"},{title:"Racha de Práctica",freq:"Semanal",xp:300,target:"5 días seguidos"}].map((r,i)=>(
                  <tr key={i}>
                    <td style={{color:"var(--text-primary)",fontWeight:600}}>{r.title}</td>
                    <td><span className={`badge ${r.freq==="Diario"?"badge-cyan":"badge-accent"}`}>{r.freq}</span></td>
                    <td className="text-gold">+{r.xp} XP</td>
                    <td>{r.target}</td>
                    <td><span className="badge badge-green">Activo</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ),
    community: (
      <div>
        <div className="section-header">
          <div><h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem"}}>🌐 Comunidades</h2><p className="text-secondary text-sm">HU-026 — Gestionar comunidades y enlaces externos</p></div>
          <button className="btn btn-primary btn-sm">+ Nueva comunidad</button>
        </div>
        <div className="grid-2">
          {[{icon:"🎸",name:"Guitarristas Bolivia",members:234,url:"https://discord.gg/example"},{icon:"🎹",name:"Piano Lovers",members:189,url:"https://t.me/example"},{icon:"🥁",name:"Percusión Latina",members:156,url:"https://discord.gg/example"},{icon:"🎤",name:"Voces Unidas",members:201,url:"https://t.me/example"}].map((c,i)=>(
            <div key={i} className="card">
              <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"12px"}}>
                <span style={{fontSize:"1.8rem"}}>{c.icon}</span>
                <div><div style={{fontWeight:700}}>{c.name}</div><div className="text-xs text-muted">👥 {c.members} miembros</div></div>
              </div>
              <div style={{display:"flex",gap:"8px"}}>
                <a href={c.url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">Ver enlace ↗</a>
                <button className="btn btn-ghost btn-sm">✏️ Editar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    stats: (
      <div>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"4px"}}>📈 Estadísticas de Plataforma</h2>
        <p className="text-secondary mb-6">HU-025 — Evaluar el rendimiento de MelodyPath</p>
        <div className="stats-grid">
          {[{icon:"👥",value:"3",label:"Usuarios registrados"},{icon:"🎵",value:"6",label:"Instrumentos"},{icon:"🏆",value:"10",label:"Insignias"},{icon:"⚡",value:"5",label:"Retos activos"},{icon:"📋",value:"10",label:"Preguntas eval."},{icon:"💬",value:"0",label:"Respuestas hoy"}].map((s,i)=>(
            <div key={i} className="stat-card"><div className="stat-icon">{s.icon}</div><div className="stat-value" style={{fontSize:"1.6rem"}}>{s.value}</div><div className="stat-label">{s.label}</div></div>
          ))}
        </div>
        <div className="card mt-4">
          <h3 className="section-title mb-4">🔗 APIs de estadísticas</h3>
          <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
            {["http://127.0.0.1:8000/api/admin-panel/stats/","http://127.0.0.1:8000/api/admin-panel/platform-stats/"].map((url,i)=>(
              <a key={i} href={url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">{url.split("/api/")[1]} ↗</a>
            ))}
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div>
      <nav className="navbar">
        <div className="nav-brand">
          <div className="nav-brand-icon">🎵</div>
          <span className="nav-brand-name">Melody<span>Path</span> <span style={{fontSize:"0.7rem",background:"var(--accent-glow)",color:"var(--accent-light)",padding:"2px 8px",borderRadius:"99px",border:"1px solid var(--accent)"}}>ADMIN</span></span>
        </div>
        <div className="nav-right">
          <a href="http://127.0.0.1:8000/api/docs/" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">API Docs ↗</a>
          <a href="http://127.0.0.1:8000/django-admin/" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">Django Admin ↗</a>
          <div className="avatar" style={{background:"linear-gradient(135deg,#ef4444,#f59e0b)"}}>A</div>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Salir</button>
        </div>
      </nav>
      <div className="layout">
        <aside className="sidebar">
          <span className="sidebar-label">Administración</span>
          {nav.map(item=>(
            <button key={item.id} className={`sidebar-item ${active===item.id?"active":""}`} onClick={()=>setActive(item.id)}>
              <span className="icon">{item.icon}</span>{item.label}
            </button>
          ))}
          <div className="divider" />
          <a href="/dashboard" className="sidebar-item"><span className="icon">👤</span>Vista usuario</a>
          <button className="sidebar-item" style={{color:"var(--red)"}} onClick={logout}><span className="icon">🚪</span>Cerrar sesión</button>
        </aside>
        <main className="main">{content[active]}</main>
      </div>
    </div>
  );
}
