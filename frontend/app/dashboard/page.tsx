"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function DashboardPage() {
  const router = useRouter();
  const [active, setActive] = useState("overview");

  useEffect(() => {
    if (!Cookies.get("access_token")) router.push("/login");
  }, []);

  const logout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    router.push("/login");
  };

  const nav = [
    { id:"overview", icon:"🏠", label:"Inicio" },
    { id:"assessment", icon:"📋", label:"Evaluación inicial" },
    { id:"instrument", icon:"🎸", label:"Mi instrumento" },
    { id:"lessons", icon:"📚", label:"Lecciones" },
    { id:"exercises", icon:"🎯", label:"Ejercicios" },
    { id:"challenges", icon:"⚡", label:"Retos" },
    { id:"progress", icon:"📈", label:"Mi progreso" },
    { id:"badges", icon:"🏆", label:"Insignias" },
    { id:"community", icon:"👥", label:"Comunidad" },
  ];

  const content: Record<string, React.ReactNode> = {
    overview: (
      <div>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px"}}>
          ¡Bienvenido a <span className="gradient-text">MelodyPath</span>! 🎵
        </h2>
        <p className="text-secondary mb-6">Comienza tu viaje musical hoy.</p>
        <div className="stats-grid">
          {[{icon:"⭐",value:"0",label:"XP Total"},{icon:"🔥",value:"0",label:"Días de racha"},{icon:"📚",value:"0",label:"Lecciones"},{icon:"🏆",value:"0",label:"Insignias"}].map((s,i)=>(
            <div key={i} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="grid-2 mt-4">
          <div className="card">
            <h3 className="section-title mb-4">🎯 Próximos pasos</h3>
            {[{icon:"📋",text:"Completa la evaluación inicial",id:"assessment"},{icon:"🎸",text:"Elige tu instrumento",id:"instrument"},{icon:"📚",text:"Empieza tu primera lección",id:"lessons"}].map((s,i)=>(
              <div key={i} onClick={()=>setActive(s.id)} style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px",borderRadius:"var(--radius-xs)",cursor:"pointer",transition:"var(--transition)"}} onMouseEnter={e=>(e.currentTarget.style.background="var(--bg-card-hover)")} onMouseLeave={e=>(e.currentTarget.style.background="")}>
                <span style={{fontSize:"1.3rem"}}>{s.icon}</span>
                <span style={{fontSize:"0.875rem",color:"var(--text-secondary)"}}>{s.text}</span>
                <span style={{marginLeft:"auto",color:"var(--accent-light)"}}>→</span>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="section-title mb-4">⚡ Retos activos</h3>
            {[{icon:"🎵",title:"Práctica Diaria",xp:"+50 XP",desc:"Completa 1 lección hoy"},{icon:"🏋️",title:"Ejercitación Diaria",xp:"+30 XP",desc:"Completa 3 ejercicios"},{icon:"🏆",title:"Maratón Semanal",xp:"+200 XP",desc:"5 lecciones esta semana"}].map((c,i)=>(
              <div key={i} className="challenge-card mb-2">
                <span className="challenge-icon">{c.icon}</span>
                <div><div style={{fontWeight:600,fontSize:"0.875rem"}}>{c.title}</div><div className="text-xs text-muted">{c.desc}</div></div>
                <span className="challenge-xp">{c.xp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    assessment: (
      <div>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px"}}>📋 Evaluación Inicial</h2>
        <p className="text-secondary mb-6">Determina tu nivel musical respondiendo estas preguntas.</p>
        <div className="card" style={{maxWidth:"600px"}}>
          <div className="badge badge-cyan mb-4">10 preguntas · ~5 minutos</div>
          <p style={{marginBottom:"20px",fontSize:"0.9rem"}}>Esta evaluación nos permite personalizar tu ruta de aprendizaje según tu nivel actual de conocimiento musical.</p>
          <button className="btn btn-primary btn-lg" onClick={()=>window.open("http://127.0.0.1:8000/api/assessment/initial/","_blank")}>Ver preguntas en API 🔗</button>
          <p className="text-xs text-muted mt-2">La integración completa requiere el frontend conectado al backend.</p>
        </div>
      </div>
    ),
    instrument: (
      <div>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px"}}>🎸 Elige tu instrumento</h2>
        <p className="text-secondary mb-6">Selecciona el instrumento que quieres aprender.</p>
        <div className="grid-3">
          {[{e:"🎹",n:"Piano",d:"Principiante"},{e:"🎸",n:"Guitarra",d:"Popular"},{e:"🥁",n:"Batería",d:"Ritmo"},{e:"🎤",n:"Canto",d:"Voz"},{e:"🎻",n:"Violín",d:"Clásico"},{e:"🎺",n:"Trompeta",d:"Jazz"}].map((ins,i)=>(
            <div key={i} className="instrument-card">
              <span className="emoji">{ins.e}</span>
              <div className="name">{ins.n}</div>
              <div className="sublabel">{ins.d}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    lessons: (
      <div>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px"}}>📚 Lecciones</h2>
        <p className="text-secondary mb-6">Tutoriales interactivos adaptados a tu nivel.</p>
        <div className="card"><p>Conectado a: <a href="http://127.0.0.1:8000/api/lessons/" target="_blank" style={{color:"var(--accent-light)"}}>GET /api/lessons/</a></p><p className="text-xs text-muted mt-2">Las lecciones se cargan desde Django REST Framework.</p></div>
      </div>
    ),
    exercises: (
      <div>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px"}}>🎯 Ejercicios</h2>
        <p className="text-secondary mb-6">Reconocimiento de notas, ritmo y acordes.</p>
        <div className="grid-2">
          {[{t:"Reconocimiento de Notas",d:"Identifica notas musicales al escuchar",icon:"🎵"},{t:"Ritmo",d:"Desarrolla precisión y coordinación",icon:"🥁"},{t:"Acordes",d:"Aprende acordes de tu instrumento",icon:"🎸"},{t:"Afinación (Pitch)",d:"Mejora tu oído musical",icon:"🎤"}].map((ex,i)=>(
            <div key={i} className="card card-glow" style={{cursor:"pointer"}}>
              <div style={{fontSize:"2rem",marginBottom:"8px"}}>{ex.icon}</div>
              <div style={{fontWeight:700,marginBottom:"4px"}}>{ex.t}</div>
              <p className="text-sm">{ex.d}</p>
              <button className="btn btn-primary btn-sm mt-4">Practicar</button>
            </div>
          ))}
        </div>
      </div>
    ),
    challenges: (
      <div>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px"}}>⚡ Retos</h2>
        <p className="text-secondary mb-6">Retos diarios y semanales para mantener tu práctica.</p>
        <div className="tabs mb-6"><button className="tab active">Diarios</button><button className="tab">Semanales</button></div>
        {[{icon:"🎵",title:"Práctica Diaria",desc:"Completa 1 lección hoy",xp:50,prog:0,total:1},{icon:"🏋️",title:"Ejercitación",desc:"Completa 3 ejercicios hoy",xp:30,prog:1,total:3}].map((c,i)=>(
          <div key={i} className="challenge-card mb-3">
            <span className="challenge-icon">{c.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:600}}>{c.title}</div>
              <div className="text-xs text-muted mb-2">{c.desc}</div>
              <div className="progress-bar"><div className="progress-fill" style={{width:`${(c.prog/c.total)*100}%`}} /></div>
              <div className="text-xs text-muted mt-1">{c.prog}/{c.total} completados</div>
            </div>
            <span className="challenge-xp">+{c.xp} XP</span>
          </div>
        ))}
      </div>
    ),
    progress: (
      <div>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px"}}>📈 Mi Progreso</h2>
        <p className="text-secondary mb-6">Visualiza tu evolución y estadísticas.</p>
        <div className="stats-grid">
          {[{icon:"⭐",value:"0",label:"XP Total"},{icon:"📊",value:"Principiante",label:"Nivel musical"},{icon:"✅",value:"0%",label:"Precisión promedio"},{icon:"⏱️",value:"0 min",label:"Tiempo practicado"}].map((s,i)=>(
            <div key={i} className="stat-card"><div className="stat-icon">{s.icon}</div><div className="stat-value" style={{fontSize:"1.4rem"}}>{s.value}</div><div className="stat-label">{s.label}</div></div>
          ))}
        </div>
        <div className="card mt-4"><p className="text-secondary">Tu historial de progreso aparecerá aquí una vez que completes lecciones y ejercicios.</p></div>
      </div>
    ),
    badges: (
      <div>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px"}}>🏆 Insignias</h2>
        <p className="text-secondary mb-6">Logros que reconocen tu esfuerzo y constancia.</p>
        <div className="grid-3">
          {[{icon:"🎵",name:"Primera Lección",desc:"Completa tu primera lección",locked:false},{icon:"🔥",name:"Racha de 3 días",desc:"Practica 3 días seguidos",locked:true},{icon:"⭐",name:"Puntaje Perfecto",desc:"100% en una evaluación",locked:true},{icon:"🏆",name:"Campeón Semanal",desc:"Gana el reto semanal",locked:true},{icon:"🎓",name:"Maestro",desc:"Alcanza el nivel 10",locked:true},{icon:"💯",name:"Centurión",desc:"100 ejercicios completados",locked:true}].map((b,i)=>(
            <div key={i} className={`achievement-card ${b.locked?"locked":""}`}>
              <span className="achievement-icon">{b.icon}</span>
              <div><div className="achievement-name">{b.name}</div><div className="achievement-desc">{b.desc}</div></div>
              {!b.locked && <span className="badge badge-gold">✓</span>}
            </div>
          ))}
        </div>
      </div>
    ),
    community: (
      <div>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px"}}>👥 Comunidad</h2>
        <p className="text-secondary mb-6">Conecta con otros estudiantes de música.</p>
        <div className="grid-2">
          {[{icon:"🎸",name:"Guitarristas Bolivia",members:234,desc:"Grupo de guitarristas de todos los niveles"},{icon:"🎹",name:"Piano Lovers",members:189,desc:"Apasionados del piano clásico y moderno"},{icon:"🥁",name:"Percusión Latina",members:156,desc:"Ritmos y técnicas de percusión"},{icon:"🎤",name:"Voces Unidas",members:201,desc:"Técnica vocal y canto coral"}].map((c,i)=>(
            <div key={i} className="card card-glow">
              <div style={{fontSize:"2rem",marginBottom:"8px"}}>{c.icon}</div>
              <div style={{fontWeight:700}}>{c.name}</div>
              <p className="text-sm mb-4">{c.desc}</p>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span className="text-xs text-muted">👥 {c.members} miembros</span>
                <button className="btn btn-secondary btn-sm">Unirme</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div>
      <nav className="navbar">
        <div className="nav-brand">
          <div className="nav-brand-icon">🎵</div>
          <span className="nav-brand-name">Melody<span>Path</span></span>
        </div>
        <div className="nav-right">
          <div className="xp-pill">⭐ 0 XP</div>
          <div className="avatar">U</div>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Salir</button>
        </div>
      </nav>
      <div className="layout">
        <aside className="sidebar">
          <span className="sidebar-label">Principal</span>
          {nav.slice(0,2).map(item=>(
            <button key={item.id} className={`sidebar-item ${active===item.id?"active":""}`} onClick={()=>setActive(item.id)}>
              <span className="icon">{item.icon}</span>{item.label}
            </button>
          ))}
          <span className="sidebar-label">Aprendizaje</span>
          {nav.slice(2,6).map(item=>(
            <button key={item.id} className={`sidebar-item ${active===item.id?"active":""}`} onClick={()=>setActive(item.id)}>
              <span className="icon">{item.icon}</span>{item.label}
            </button>
          ))}
          <span className="sidebar-label">Gamificación</span>
          {nav.slice(6).map(item=>(
            <button key={item.id} className={`sidebar-item ${active===item.id?"active":""}`} onClick={()=>setActive(item.id)}>
              <span className="icon">{item.icon}</span>{item.label}
            </button>
          ))}
        </aside>
        <main className="main">{content[active]}</main>
      </div>
    </div>
  );
}
