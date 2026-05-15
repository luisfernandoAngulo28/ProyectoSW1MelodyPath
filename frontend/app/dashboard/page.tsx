"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const API = "http://127.0.0.1:8000/api";

function authHeaders() {
  return { Authorization: `Bearer ${Cookies.get("access_token")}`, "Content-Type": "application/json" };
}

async function apiFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { ...authHeaders(), ...(opts.headers || {}) } });
  if (res.status === 401) { Cookies.remove("access_token"); window.location.href = "/login"; }
  return res;
}

// ── Types ──────────────────────────────────────────────
interface Question { id: number; question: string; options: string[]; category: string; }
interface Instrument { id: number; name: string; emoji: string; category: string; description: string; }
interface Stats { level: number; xp: number; xp_next: number; xp_percent: number; streak: number; completed_lessons: number; total_exercises: number; accuracy_percent: number; initial_level: string; instrument: string | null; }

export default function DashboardPage() {
  const router = useRouter();
  const [active, setActive] = useState("overview");
  const [user, setUser] = useState<any>(null);

  // Assessment
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [quizDone, setQuizDone] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [quizIdx, setQuizIdx] = useState(0);

  // Instruments
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState<number | null>(null);

  // Stats
  const [stats, setStats] = useState<Stats | null>(null);

  // Challenges
  const [challenges, setChallenges] = useState<any[]>([]);

  // Badges
  const [badges, setBadges] = useState<any[]>([]);

  // Ranking
  const [ranking, setRanking] = useState<any[]>([]);

  // ── Auth check ────────────────────────────────────────
  useEffect(() => {
    if (!Cookies.get("access_token")) { router.push("/login"); return; }
    apiFetch("/auth/me/").then(r => r.json()).then(d => { setUser(d); if (d.instrument) setSelectedInstrument(d.instrument); });
  }, []);

  // ── Load data by section ──────────────────────────────
  useEffect(() => {
    if (active === "assessment") {
      apiFetch("/assessment/initial/").then(r => r.json()).then(setQuestions).catch(()=>{});
    }
    if (active === "instrument") {
      apiFetch("/instruments/").then(r => r.json()).then(d => setInstruments(Array.isArray(d) ? d : d.results || [])).catch(()=>{});
    }
    if (active === "progress" || active === "overview") {
      apiFetch("/progress/stats/").then(r => r.json()).then(setStats).catch(()=>{});
    }
    if (active === "challenges") {
      apiFetch("/challenges/").then(r => r.json()).then(d => setChallenges(Array.isArray(d) ? d : [])).catch(()=>{});
    }
    if (active === "badges") {
      apiFetch("/badges/user/").then(r => r.json()).then(d => setBadges(Array.isArray(d) ? d : [])).catch(()=>{});
    }
    if (active === "community") {
      apiFetch("/ranking/").then(r => r.json()).then(d => setRanking(Array.isArray(d) ? d : [])).catch(()=>{});
    }
  }, [active]);

  const logout = () => { Cookies.remove("access_token"); Cookies.remove("refresh_token"); router.push("/login"); };

  // ── Submit assessment ─────────────────────────────────
  const handleSubmitAssessment = async () => {
    const payload = questions.map(q => ({ question_id: q.id, answer: answers[q.id] || "" }));
    const res = await apiFetch("/assessment/initial/submit/", { method: "POST", body: JSON.stringify({ answers: payload }) });
    const data = await res.json();
    if (res.ok) { setQuizResult(data); setQuizDone(true); toast.success(`Nivel asignado: ${data.assigned_level_display} 🎉`); }
    else { toast.error(data.detail || "Error al enviar evaluación"); }
  };

  // ── Select instrument ─────────────────────────────────
  const handleSelectInstrument = async (id: number) => {
    setSelectedInstrument(id);
    const res = await apiFetch("/auth/me/instrument/", { method: "PATCH", body: JSON.stringify({ instrument: id }) });
    if (res.ok) { toast.success("¡Instrumento actualizado! 🎸"); }
    else { toast.error("No se pudo guardar el instrumento"); }
  };

  // ── Complete challenge ────────────────────────────────
  const handleCompleteChallenge = async (id: number) => {
    const res = await apiFetch(`/challenges/${id}/complete/`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message || "¡Reto avanzado!");
      apiFetch("/challenges/").then(r => r.json()).then(d => setChallenges(Array.isArray(d) ? d : []));
    }
  };

  const nav = [
    { id:"overview",    icon:"🏠", label:"Inicio" },
    { id:"assessment",  icon:"📋", label:"Evaluación inicial" },
    { id:"instrument",  icon:"🎸", label:"Mi instrumento" },
    { id:"lessons",     icon:"📚", label:"Lecciones" },
    { id:"exercises",   icon:"🎯", label:"Ejercicios" },
    { id:"challenges",  icon:"⚡", label:"Retos" },
    { id:"progress",    icon:"📈", label:"Mi progreso" },
    { id:"badges",      icon:"🏅", label:"Insignias" },
    { id:"community",   icon:"👥", label:"Comunidad" },
  ];

  // ── Sections ──────────────────────────────────────────
  const Overview = () => (
    <div>
      <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"6px"}}>
        ¡Hola, <span className="gradient-text">{user?.name || "Músico"}</span>! 🎵
      </h2>
      <p className="text-secondary mb-6">Continúa tu camino musical. {stats?.streak ? `🔥 Racha de ${stats.streak} días.` : ""}</p>
      <div className="stats-grid">
        {[
          {icon:"⭐",value:stats?.xp??0,label:"XP Total"},
          {icon:"🔥",value:stats?.streak??0,label:"Días de racha"},
          {icon:"📚",value:stats?.completed_lessons??0,label:"Lecciones"},
          {icon:"🎯",value:`${stats?.accuracy_percent??0}%`,label:"Precisión"},
        ].map((s,i)=>(
          <div key={i} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      {stats && (
        <div className="card mb-4">
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
            <span style={{fontWeight:600}}>Nivel {stats.level}</span>
            <span className="text-muted text-xs">{stats.xp} / {stats.xp_next} XP</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{width:`${stats.xp_percent}%`}} /></div>
        </div>
      )}
      <div className="grid-2">
        <div className="card">
          <h3 className="section-title mb-4">🎯 Próximos pasos</h3>
          {[
            {icon:"📋",text:"Completa la evaluación inicial",id:"assessment"},
            {icon:"🎸",text:"Elige tu instrumento",id:"instrument"},
            {icon:"📚",text:"Empieza tu primera lección",id:"lessons"},
          ].map((s,i)=>(
            <div key={i} onClick={()=>setActive(s.id)} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px",borderRadius:"var(--radius-xs)",cursor:"pointer"}} onMouseEnter={e=>(e.currentTarget.style.background="var(--bg-card-hover)")} onMouseLeave={e=>(e.currentTarget.style.background="")}>
              <span>{s.icon}</span><span className="text-sm">{s.text}</span><span style={{marginLeft:"auto",color:"var(--accent-light)"}}>→</span>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 className="section-title mb-4">⚡ Mis retos</h3>
          <p className="text-sm text-secondary">Ve a la sección <strong style={{color:"var(--accent-light)",cursor:"pointer"}} onClick={()=>setActive("challenges")}>Retos</strong> para ver tus desafíos diarios y semanales.</p>
          <div className="mt-4">
            <button className="btn btn-primary btn-sm" onClick={()=>setActive("challenges")}>Ver retos</button>
          </div>
        </div>
      </div>
    </div>
  );

  const Assessment = () => {
    if (quizDone && quizResult) return (
      <div>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px"}}>📋 Resultado de Evaluación</h2>
        <div className="card" style={{maxWidth:"500px",textAlign:"center",padding:"40px"}}>
          <div style={{fontSize:"4rem",marginBottom:"16px"}}>🎯</div>
          <div style={{fontFamily:"var(--font-display)",fontSize:"2rem",fontWeight:900,marginBottom:"8px"}} className="gradient-text">{quizResult.score}%</div>
          <div style={{fontSize:"1.1rem",fontWeight:600,marginBottom:"8px"}}>Nivel asignado:</div>
          <div className="badge badge-accent" style={{fontSize:"1rem",padding:"8px 20px",marginBottom:"16px"}}>{quizResult.assigned_level_display}</div>
          <p className="text-secondary">{quizResult.message}</p>
          <button className="btn btn-primary mt-4" onClick={()=>setActive("lessons")}>Ver mis lecciones →</button>
        </div>
      </div>
    );

    if (questions.length === 0) return (
      <div>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px"}}>📋 Evaluación Inicial</h2>
        <div className="card"><p className="text-secondary">Cargando preguntas...</p></div>
      </div>
    );

    const q = questions[quizIdx];
    const progress = Math.round((quizIdx / questions.length) * 100);

    return (
      <div>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px"}}>📋 Evaluación Inicial</h2>
        <p className="text-secondary mb-4">Pregunta {quizIdx+1} de {questions.length}</p>
        <div className="progress-bar mb-6" style={{maxWidth:"600px"}}><div className="progress-fill" style={{width:`${progress}%`}} /></div>
        <div className="card" style={{maxWidth:"600px"}}>
          <div className="badge badge-cyan mb-4">{q.category}</div>
          <h3 style={{fontSize:"1.1rem",fontWeight:700,marginBottom:"20px"}}>{q.question}</h3>
          <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"24px"}}>
            {q.options.map((opt,i)=>(
              <button key={i} onClick={()=>setAnswers(a=>({...a,[q.id]:opt}))}
                style={{padding:"13px 18px",borderRadius:"var(--radius-sm)",border:`2px solid ${answers[q.id]===opt?"var(--accent)":"var(--border)"}`,background:answers[q.id]===opt?"var(--accent-glow)":"var(--bg-secondary)",color:answers[q.id]===opt?"var(--accent-light)":"var(--text-primary)",cursor:"pointer",textAlign:"left",fontFamily:"var(--font-sans)",fontSize:"0.9rem",transition:"var(--transition)"}}>
                {opt}
              </button>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            {quizIdx > 0 && <button className="btn btn-secondary btn-sm" onClick={()=>setQuizIdx(i=>i-1)}>← Anterior</button>}
            {quizIdx < questions.length-1
              ? <button className="btn btn-primary btn-sm" style={{marginLeft:"auto"}} onClick={()=>setQuizIdx(i=>i+1)} disabled={!answers[q.id]}>Siguiente →</button>
              : <button className="btn btn-primary btn-sm" style={{marginLeft:"auto"}} onClick={handleSubmitAssessment} disabled={Object.keys(answers).length < questions.length}>Finalizar evaluación ✓</button>
            }
          </div>
        </div>
      </div>
    );
  };

  const InstrumentSection = () => (
    <div>
      <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px"}}>🎸 Mi Instrumento</h2>
      <p className="text-secondary mb-6">Selecciona el instrumento principal que deseas aprender.</p>
      {instruments.length === 0
        ? <div className="card"><p className="text-secondary">Cargando instrumentos...</p></div>
        : <div className="grid-3">
            {instruments.map(ins=>(
              <div key={ins.id} className={`instrument-card ${selectedInstrument===ins.id?"selected":""}`} onClick={()=>handleSelectInstrument(ins.id)}>
                <span className="emoji">{ins.emoji}</span>
                <div className="name">{ins.name}</div>
                <div className="sublabel">{ins.description?.slice(0,50)}...</div>
                {selectedInstrument===ins.id && <div className="badge badge-accent mt-2">✓ Seleccionado</div>}
              </div>
            ))}
          </div>
      }
    </div>
  );

  const ChallengesSection = () => (
    <div>
      <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px"}}>⚡ Retos</h2>
      <p className="text-secondary mb-6">Completa retos diarios y semanales para ganar XP.</p>
      {challenges.length === 0
        ? <div className="card"><p className="text-secondary">Cargando retos...</p></div>
        : challenges.map((c:any)=>(
          <div key={c.id} className="challenge-card mb-3">
            <span className="challenge-icon">⚡</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:600}}>{c.title}</div>
              <div className="text-xs text-muted mb-2">{c.description}</div>
              <div className="progress-bar"><div className="progress-fill" style={{width:`${Math.min(100,((c.user_progress||0)/c.target_count)*100)}%`}} /></div>
              <div className="text-xs text-muted mt-1">{c.user_progress||0}/{c.target_count} · {c.frequency_display}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"6px"}}>
              <span className="challenge-xp">+{c.xp_reward} XP</span>
              {c.user_completed
                ? <span className="badge badge-green">✓ Completado</span>
                : <button className="btn btn-primary btn-sm" onClick={()=>handleCompleteChallenge(c.id)}>+1</button>}
            </div>
          </div>
        ))
      }
    </div>
  );

  const ProgressSection = () => (
    <div>
      <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px"}}>📈 Mi Progreso</h2>
      <p className="text-secondary mb-6">Tu evolución en MelodyPath.</p>
      {stats
        ? <>
            <div className="stats-grid">
              {[
                {icon:"🏅",value:`Nivel ${stats.level}`,label:"Nivel actual"},
                {icon:"⭐",value:stats.xp,label:"XP total"},
                {icon:"🔥",value:stats.streak,label:"Racha (días)"},
                {icon:"✅",value:`${stats.accuracy_percent}%`,label:"Precisión"},
                {icon:"📚",value:stats.completed_lessons,label:"Lecciones"},
                {icon:"🎯",value:stats.total_exercises,label:"Ejercicios"},
              ].map((s,i)=>(
                <div key={i} className="stat-card"><div className="stat-icon">{s.icon}</div><div className="stat-value" style={{fontSize:"1.4rem"}}>{s.value}</div><div className="stat-label">{s.label}</div></div>
              ))}
            </div>
            <div className="card">
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
                <span className="section-title">Progreso al siguiente nivel</span>
                <span className="text-muted text-xs">{stats.xp} / {stats.xp_next} XP</span>
              </div>
              <div className="progress-bar" style={{height:"12px"}}><div className="progress-fill" style={{width:`${stats.xp_percent}%`}} /></div>
              <p className="text-xs text-muted mt-2">Nivel musical inicial: <strong>{stats.initial_level || "Sin evaluar"}</strong></p>
            </div>
          </>
        : <div className="card"><p className="text-secondary">Cargando estadísticas...</p></div>
      }
    </div>
  );

  const BadgesSection = () => (
    <div>
      <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px"}}>🏅 Mis Insignias</h2>
      <p className="text-secondary mb-6">Logros conseguidos en tu aprendizaje.</p>
      {badges.length === 0
        ? <div className="card"><p className="text-secondary">Aún no has ganado insignias. ¡Completa lecciones y retos!</p></div>
        : <div className="grid-3">
            {badges.map((ub:any)=>(
              <div key={ub.id} className="achievement-card">
                <span className="achievement-icon">{ub.badge.icon}</span>
                <div><div className="achievement-name">{ub.badge.name}</div><div className="achievement-desc">{ub.badge.description}</div></div>
              </div>
            ))}
          </div>
      }
      <div className="mt-6">
        <h3 className="section-title mb-4">Todas las insignias disponibles</h3>
        <div className="grid-3">
          {[{icon:"🎵",name:"Primera Lección",desc:"Completa tu primera lección"},{icon:"🔥",name:"Racha 3 días",desc:"Practica 3 días seguidos"},{icon:"⭐",name:"Puntaje Perfecto",desc:"100% en evaluación"},{icon:"🏆",name:"Campeón Semanal",desc:"Gana reto semanal"},{icon:"🎓",name:"Maestro",desc:"Nivel 10"},{icon:"💯",name:"Centurión",desc:"100 ejercicios"}].map((b,i)=>(
            <div key={i} className="achievement-card locked"><span className="achievement-icon">{b.icon}</span><div><div className="achievement-name">{b.name}</div><div className="achievement-desc">{b.desc}</div></div></div>
          ))}
        </div>
      </div>
    </div>
  );

  const CommunitySection = () => (
    <div>
      <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px"}}>👥 Ranking Semanal</h2>
      <p className="text-secondary mb-6">Los músicos más activos de MelodyPath.</p>
      <div className="card">
        {ranking.length === 0
          ? <p className="text-secondary">Cargando ranking...</p>
          : ranking.map((r:any)=>(
            <div key={r.user_id} className="rank-row" style={{background:r.is_current_user?"var(--accent-glow)":""}}>
              <span className={`rank-num ${r.position<=3?"top":""}`}>{r.position<=3?["🥇","🥈","🥉"][r.position-1]:r.position}</span>
              <div className="avatar" style={{width:"32px",height:"32px",fontSize:"0.8rem"}}>{r.name[0]}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:"0.875rem"}}>{r.name}{r.is_current_user&&<span className="badge badge-accent" style={{marginLeft:"6px",fontSize:"0.65rem"}}>Tú</span>}</div>
                <div className="text-xs text-muted">{r.instrument||"Sin instrumento"} · Nivel {r.level}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div className="text-gold" style={{fontWeight:700,fontSize:"0.9rem"}}>⭐ {r.xp.toLocaleString()}</div>
                <div className="text-xs text-muted">🔥 {r.streak} días</div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );

  const sections: Record<string, React.ReactNode> = {
    overview:    <Overview />,
    assessment:  <Assessment />,
    instrument:  <InstrumentSection />,
    lessons:     <div><h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px"}}>📚 Lecciones</h2><p className="text-secondary mb-4">Las lecciones se conectan al backend Django.</p><div className="card"><a href="http://127.0.0.1:8000/api/lessons/" target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Ver lecciones en API ↗</a></div></div>,
    exercises:   <div><h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px"}}>🎯 Ejercicios</h2><p className="text-secondary mb-4">Ejercicios conectados al backend.</p><div className="card"><a href="http://127.0.0.1:8000/api/exercises/" target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Ver ejercicios en API ↗</a></div></div>,
    challenges:  <ChallengesSection />,
    progress:    <ProgressSection />,
    badges:      <BadgesSection />,
    community:   <CommunitySection />,
  };

  return (
    <div>
      <nav className="navbar">
        <div className="nav-brand">
          <div className="nav-brand-icon">🎵</div>
          <span className="nav-brand-name">Melody<span>Path</span></span>
        </div>
        <div className="nav-right">
          {stats && <div className="xp-pill">⭐ {stats.xp} XP</div>}
          {stats && <div className="xp-pill" style={{color:"var(--cyan)"}}>🔥 {stats.streak}</div>}
          <div className="avatar">{user?.name?.[0] || "U"}</div>
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
          <span className="sidebar-label">Social</span>
          {nav.slice(6).map(item=>(
            <button key={item.id} className={`sidebar-item ${active===item.id?"active":""}`} onClick={()=>setActive(item.id)}>
              <span className="icon">{item.icon}</span>{item.label}
            </button>
          ))}
          <div className="divider" />
          <a href="/admin" className="sidebar-item"><span className="icon">⚙️</span>Panel admin</a>
          <button className="sidebar-item" style={{color:"var(--red)"}} onClick={logout}><span className="icon">🚪</span>Cerrar sesión</button>
        </aside>
        <main className="main">{sections[active]}</main>
      </div>
    </div>
  );
}
