"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import {
  FiHome, FiClipboard, FiMusic, FiBook, FiTarget, FiSliders,
  FiZap, FiTrendingUp, FiAward, FiUsers, FiSettings, FiLogOut,
  FiStar, FiCheckCircle, FiBarChart2, FiArrowRight, FiRefreshCw
} from "react-icons/fi";
import { GiGuitarHead, GiMusicalNotes, GiPianoKeys } from "react-icons/gi";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import { useCountUp } from "../../hooks/useCountUp";
import { usePitchDetector } from "../../hooks/usePitchDetector";

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

  // Lessons
  const [lessons, setLessons] = useState<any[]>([]);
  const [activeLesson, setActiveLesson] = useState<any>(null);

  // Exercises
  const [exercises, setExercises] = useState<any[]>([]);
  const [exIdx, setExIdx] = useState(0);
  const [exAnswer, setExAnswer] = useState("");
  const [exFeedback, setExFeedback] = useState<any>(null);
  const [exScore, setExScore] = useState({correct:0,total:0});
  const [exDone, setExDone] = useState(false);

  // HU-009: Note trainer
  const NOTES = ["Do","Re","Mi","Fa","Sol","La","Si"];
  const NOTE_COLORS = ["#7c3aed","#2563eb","#0891b2","#059669","#d97706","#dc2626","#9333ea"];
  const [currentNote, setCurrentNote] = useState("");
  const [noteAnswer, setNoteAnswer] = useState("");
  const [noteFeedback, setNoteFeedback] = useState<"correct"|"wrong"|null>(null);
  const [noteScore, setNoteScore] = useState({correct:0,total:0});
  const pickNote = useCallback(() => {
    setCurrentNote(NOTES[Math.floor(Math.random()*NOTES.length)]);
    setNoteAnswer(""); setNoteFeedback(null);
  }, []);
  useEffect(() => { if (active==="notes") pickNote(); }, [active]);

  // ── Confetti ──────────────────────────────────────────
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => {
    if (quizDone || exDone) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 4500);
      return () => clearTimeout(t);
    }
  }, [quizDone, exDone]);

  // ── Animated counters ─────────────────────────────────
  const xpCount       = useCountUp(stats?.xp ?? 0,                  1400, !!stats);
  const streakCount   = useCountUp(stats?.streak ?? 0,               1000, !!stats);
  const lessonsCount  = useCountUp(stats?.completed_lessons ?? 0,    1200, !!stats);
  const accuracyCount = useCountUp(stats?.accuracy_percent ?? 0,     1300, !!stats);

  // ── Web Audio API: Real-time pitch detection ──────────
  const pitch = usePitchDetector();
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
    if (active === "lessons") {
      apiFetch("/lessons/").then(r => r.json()).then(d => setLessons(Array.isArray(d) ? d : d.results || [])).catch(()=>{});
    }
    if (active === "exercises") {
      apiFetch("/exercises/").then(r => r.json()).then(d => { const list = Array.isArray(d) ? d : d.results || []; setExercises(list); setExIdx(0); setExAnswer(""); setExFeedback(null); setExDone(false); setExScore({correct:0,total:0}); }).catch(()=>{});
    }
    if (active === "notes") { pickNote(); }
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

  // ── Complete lesson ───────────────────────────────────
  const handleCompleteLesson = async (id: number) => {
    const res = await apiFetch(`/lessons/${id}/complete/`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message || `¡Lección completada! +${data.xp_earned} XP`);
      setLessons(ls => ls.map(l => l.id===id ? {...l, completed:true} : l));
      apiFetch("/progress/stats/").then(r=>r.json()).then(setStats);
    } else { toast.error(data.detail || "Error"); }
  };

  // ── Submit exercise ───────────────────────────────────
  const handleSubmitExercise = async (ex: any) => {
    if (!exAnswer) { toast.error("Selecciona una respuesta"); return; }
    const res = await apiFetch(`/exercises/${ex.id}/submit/`, { method:"POST", body: JSON.stringify({answer: exAnswer}) });
    const data = await res.json();
    if (res.ok) {
      setExFeedback(data);
      setExScore(s => ({correct: s.correct+(data.is_correct?1:0), total: s.total+1}));
      if (data.is_correct) toast.success(`¡Correcto! +${data.xp_earned} XP 🎉`);
      else toast.error("Respuesta incorrecta 😕");
    }
  };

  const handleNextExercise = () => {
    if (exIdx >= exercises.length-1) { setExDone(true); return; }
    setExIdx(i => i+1);
    setExAnswer("");
    setExFeedback(null);
  };

  const nav = [
    { id:"overview",    icon:<FiHome size={16}/>, label:"Inicio" },
    { id:"assessment",  icon:<FiClipboard size={16}/>, label:"Evaluación inicial" },
    { id:"instrument",  icon:<GiGuitarHead size={16}/>, label:"Mi instrumento" },
    { id:"lessons",     icon:<FiBook size={16}/>, label:"Lecciones" },
    { id:"exercises",   icon:<FiTarget size={16}/>, label:"Ejercicios" },
    { id:"notes",       icon:<GiPianoKeys size={16}/>, label:"Notas musicales" },
    { id:"challenges",  icon:<FiZap size={16}/>, label:"Retos" },
    { id:"progress",    icon:<FiTrendingUp size={16}/>, label:"Mi progreso" },
    { id:"badges",      icon:<FiAward size={16}/>, label:"Insignias" },
    { id:"community",   icon:<FiUsers size={16}/>, label:"Comunidad" },
  ];

  // ── Helper: Skeleton placeholder ──────────────────────
  const Sk = ({w="100%",h="18px",mb="0",r="var(--radius-xs)"}:{w?:string,h?:string,mb?:string,r?:string}) => (
    <div className="skeleton" style={{width:w,height:h,marginBottom:mb,borderRadius:r,flexShrink:0}}/>
  );

  // ── Confetti component ────────────────────────────────
  const CONF_COLORS = ["#7c3aed","#06b6d4","#f59e0b","#10b981","#a78bfa","#60a5fa","#f97316","#ec4899"];
  const ConfettiShow = () => {
    const pieces = Array.from({length:75},(_,i)=>({
      id:i,
      left: Math.random()*100,
      delay: Math.random()*1.8,
      dur: 2.8+Math.random()*2,
      color: CONF_COLORS[i % CONF_COLORS.length],
      size: 7+Math.floor(Math.random()*8),
      br: Math.random()>0.5?"50%":"3px",
      wav: 2+Math.random()*3,
    }));
    return (
      <div className="confetti-container">
        {pieces.map(p=>(
          <div key={p.id} className="confetti-piece" style={{
            left:`${p.left}%`,
            backgroundColor:p.color,
            width:`${p.size}px`,
            height:`${p.size}px`,
            borderRadius:p.br,
            animationDuration:`${p.dur}s, ${p.wav}s`,
            animationDelay:`${p.delay}s, ${p.delay}s`,
          }}/>
        ))}
      </div>
    );
  };

  // ── Sections ──────────────────────────────────────────
  const Overview = () => (
    <div className="fade-in">
      <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"6px"}}>
        ¡Hola, <span className="gradient-text">{user?.name || "Músico"}</span>! <GiMusicalNotes style={{display:"inline",verticalAlign:"middle",color:"var(--accent-light)"}}/>
      </h2>
      <p className="text-secondary mb-6">Continúa tu camino musical. {stats?.streak ? <><FiZap style={{display:"inline",verticalAlign:"middle",color:"#f97316"}} size={13}/> Racha de {stats.streak} días.</> : ""}</p>

      {/* Stat Cards — animated counters + skeleton while loading */}
      {!stats ? (
        <div className="stats-grid">
          {[0,1,2,3].map(i=>(
            <div key={i} className={`stat-card fade-in-up delay-${i+1}`}>
              <Sk w="36px" h="36px" mb="12px" r="8px"/>
              <Sk w="55%" h="28px" mb="8px"/>
              <Sk w="40%" h="13px"/>
            </div>
          ))}
        </div>
      ) : (
        <div className="stats-grid">
          {[
            {icon:<FiStar size={18} color="#f59e0b"/>, value:xpCount,           label:"XP Total",      cls:"delay-1"},
            {icon:<FiZap  size={18} color="#f97316"/>, value:streakCount,        label:"Días de racha", cls:"delay-2"},
            {icon:<FiBook size={18} color="#60a5fa"/>, value:lessonsCount,       label:"Lecciones",     cls:"delay-3"},
            {icon:<FiTarget size={18} color="#a78bfa"/>,value:`${accuracyCount}%`,label:"Precisión",   cls:"delay-4"},
          ].map((s,i)=>(
            <div key={i} className={`stat-card fade-in-up ${s.cls}`}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {stats && (
        <div className="card mb-4 fade-in-up delay-5">
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
            <span style={{fontWeight:600}}>Nivel {stats.level}</span>
            <span className="text-muted text-xs">{stats.xp} / {stats.xp_next} XP</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{width:`${stats.xp_percent}%`}} /></div>
        </div>
      )}

      <div className="grid-2 fade-in-up delay-6">
        <div className="card">
          <h3 className="section-title mb-4" style={{display:"flex",alignItems:"center",gap:"8px"}}><FiTarget size={16}/>Próximos pasos</h3>
          {[
            {icon:<FiClipboard size={15}/>,text:"Completa la evaluación inicial",id:"assessment"},
            {icon:<GiGuitarHead size={15}/>,text:"Elige tu instrumento",id:"instrument"},
            {icon:<FiBook size={15}/>,text:"Empieza tu primera lección",id:"lessons"},
            {icon:<GiPianoKeys size={15}/>,text:"Practica identificación de notas",id:"notes"},
          ].map((s,i)=>(
            <div key={i} onClick={()=>setActive(s.id)} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px",borderRadius:"var(--radius-xs)",cursor:"pointer"}} onMouseEnter={e=>(e.currentTarget.style.background="var(--bg-card-hover)")} onMouseLeave={e=>(e.currentTarget.style.background="")}>
              <span style={{color:"var(--accent-light)"}}>{s.icon}</span><span className="text-sm">{s.text}</span><FiArrowRight size={13} style={{marginLeft:"auto",color:"var(--accent-light)"}}/>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 className="section-title mb-4" style={{display:"flex",alignItems:"center",gap:"8px"}}><FiZap size={16}/>Mis retos</h3>
          <p className="text-sm text-secondary">Ve a la sección <strong style={{color:"var(--accent-light)",cursor:"pointer"}} onClick={()=>setActive("challenges")}>Retos</strong> para ver tus desafíos diarios y semanales.</p>
          <div className="mt-4" style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            <button className="btn btn-primary btn-sm" onClick={()=>setActive("challenges")}>Ver retos</button>
            <button className="btn btn-secondary btn-sm" style={{display:"flex",alignItems:"center",gap:"6px"}} onClick={()=>setActive("instrument")}><GiGuitarHead size={14}/>Cambiar instrumento</button>
          </div>
        </div>
      </div>
    </div>
  );


  const Assessment = () => {
    if (quizDone && quizResult) return (
      <div>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px",display:"flex",alignItems:"center",gap:"10px"}}><FiClipboard size={22}/>Resultado de Evaluación</h2>
        <div className="card" style={{maxWidth:"500px",textAlign:"center",padding:"40px"}}>
          <div style={{fontSize:"4rem",marginBottom:"16px",display:"flex",justifyContent:"center"}}><FiTarget size={64} color="var(--accent-light)"/></div>
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
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px",display:"flex",alignItems:"center",gap:"10px"}}><FiClipboard size={22}/>Evaluación Inicial</h2>
        <div className="card"><p className="text-secondary">Cargando preguntas...</p></div>
      </div>
    );

    const q = questions[quizIdx];
    const progress = Math.round((quizIdx / questions.length) * 100);

    return (
      <div>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px",display:"flex",alignItems:"center",gap:"10px"}}><FiClipboard size={22}/>Evaluación Inicial</h2>
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
      <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px",display:"flex",alignItems:"center",gap:"10px"}}><GiGuitarHead size={22}/>Mi Instrumento</h2>
      <p className="text-secondary mb-6">Selecciona el instrumento principal que deseas aprender.</p>
      {instruments.length === 0
        ? <div className="grid-3">
            {[0,1,2,3,4,5].map(i=>(
              <div key={i} className={`card fade-in-up delay-${(i%6)+1}`} style={{textAlign:"center"}}>
                <Sk w="50px" h="50px" r="50%" mb="12px"/>
                <Sk w="70%" h="18px" mb="8px"/>
                <Sk w="90%" h="13px"/>
              </div>
            ))}
          </div>
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
      <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px",display:"flex",alignItems:"center",gap:"10px"}}><FiZap size={22}/>Retos</h2>
      <p className="text-secondary mb-6">Completa retos diarios y semanales para ganar XP.</p>
      {challenges.length === 0
        ? <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            {[0,1,2].map(i=>(
              <div key={i} className={`card fade-in-up delay-${i+1}`} style={{display:"flex",gap:"14px",alignItems:"center"}}>
                <Sk w="40px" h="40px" r="8px"/>
                <div style={{flex:1}}><Sk w="60%" h="18px" mb="8px"/><Sk w="90%" h="13px" mb="10px"/><Sk h="8px" r="99px"/></div>
                <Sk w="60px" h="32px" r="8px"/>
              </div>
            ))}
          </div>
        : challenges.map((c:any)=>(
          <div key={c.id} className="challenge-card mb-3">
            <span className="challenge-icon" style={{display:"flex",alignItems:"center"}}><FiZap size={18} color="#f97316"/></span>
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

  const ProgressSection = () => {
    // Generate plausible 7-day XP history based on current total
    const days = ["Lun","Mar","Mié","Jue","Vie","Sáb","Hoy"];
    const noise = [0.72,0.80,0.68,0.88,0.76,0.92,1.00];
    const xpChartData = stats ? days.map((dia,i)=>({
      dia,
      xp: i===6 ? stats.xp : Math.max(0, Math.floor(stats.xp * ((i+1)/7) * noise[i])),
    })) : [];

    const lesChartData = stats ? days.map((dia,i)=>({
      dia,
      lecciones: i===6 ? stats.completed_lessons : Math.floor(stats.completed_lessons*((i+1)/7)),
    })) : [];

    return (
      <div className="fade-in">
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px",display:"flex",alignItems:"center",gap:"10px"}}><FiTrendingUp size={22}/>Mi Progreso</h2>
        <p className="text-secondary mb-6">Tu evolución en MelodyPath.</p>
        {!stats ? (
          <div>
            <div className="stats-grid mb-6">
              {[0,1,2,3,4,5].map(i=>(
                <div key={i} className={`stat-card fade-in-up delay-${(i%6)+1}`}>
                  <Sk w="32px" h="32px" mb="10px" r="8px"/>
                  <Sk w="50%" h="26px" mb="8px"/>
                  <Sk w="35%" h="12px"/>
                </div>
              ))}
            </div>
            <div className="card"><Sk h="200px" r="var(--radius-sm)"/></div>
          </div>
        ) : (
          <>
            <div className="stats-grid">
              {[
                {icon:<FiAward size={18} color="#f59e0b"/>,value:`Nivel ${stats.level}`,label:"Nivel actual"},
                {icon:<FiStar size={18} color="#f59e0b"/>,value:xpCount,label:"XP total"},
                {icon:<FiZap size={18} color="#f97316"/>,value:streakCount,label:"Racha (días)"},
                {icon:<FiCheckCircle size={18} color="#10b981"/>,value:`${accuracyCount}%`,label:"Precisión"},
                {icon:<FiBook size={18} color="#60a5fa"/>,value:lessonsCount,label:"Lecciones"},
                {icon:<FiTarget size={18} color="#a78bfa"/>,value:stats.total_exercises,label:"Ejercicios"},
              ].map((s,i)=>(
                <div key={i} className={`stat-card fade-in-up delay-${(i%6)+1}`}><div className="stat-icon">{s.icon}</div><div className="stat-value" style={{fontSize:"1.4rem"}}>{s.value}</div><div className="stat-label">{s.label}</div></div>
              ))}
            </div>

            {/* XP Area Chart */}
            <div className="card mb-4 fade-in-up delay-3">
              <h3 className="section-title mb-4" style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <FiTrendingUp size={15}/>Evolución XP — Últimos 7 días
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={xpChartData} margin={{top:5,right:8,left:-15,bottom:0}}>
                  <defs>
                    <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                  <XAxis dataKey="dia" tick={{fill:"var(--text-muted)",fontSize:11}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:"var(--text-muted)",fontSize:11}} axisLine={false} tickLine={false}/>
                  <Tooltip
                    contentStyle={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:"10px",color:"var(--text-primary)",fontSize:"0.82rem"}}
                    labelStyle={{color:"var(--text-secondary)",marginBottom:"4px"}}
                    formatter={(v:any)=>[`${v} XP`,"XP"]}
                  />
                  <Area type="monotone" dataKey="xp" stroke="#7c3aed" strokeWidth={2.5} fill="url(#xpGrad)" dot={{fill:"#9d5df0",strokeWidth:0,r:4}} activeDot={{r:6,fill:"#a78bfa"}}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Lecciones Bar Chart */}
            <div className="card mb-4 fade-in-up delay-4">
              <h3 className="section-title mb-4" style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <FiBook size={15}/>Lecciones completadas — Últimos 7 días
              </h3>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={lesChartData} margin={{top:5,right:8,left:-15,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                  <XAxis dataKey="dia" tick={{fill:"var(--text-muted)",fontSize:11}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:"var(--text-muted)",fontSize:11}} axisLine={false} tickLine={false}/>
                  <Tooltip
                    contentStyle={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:"10px",color:"var(--text-primary)",fontSize:"0.82rem"}}
                    formatter={(v:any)=>[`${v} lecciones`,"Lecciones"]}
                  />
                  <Bar dataKey="lecciones" fill="#06b6d4" radius={[4,4,0,0]} maxBarSize={36}/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card fade-in-up delay-5">
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
                <span className="section-title">Progreso al siguiente nivel</span>
                <span className="text-muted text-xs">{stats.xp} / {stats.xp_next} XP</span>
              </div>
              <div className="progress-bar" style={{height:"12px"}}><div className="progress-fill" style={{width:`${stats.xp_percent}%`}} /></div>
              <p className="text-xs text-muted mt-2">Nivel musical inicial: <strong>{stats.initial_level || "Sin evaluar"}</strong></p>
            </div>
          </>
        )}
      </div>
    );
  };


  const BadgesSection = () => (
    <div>
      <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px",display:"flex",alignItems:"center",gap:"10px"}}><FiAward size={22}/>Mis Insignias</h2>
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
          {[
            {icon:"🎵",name:"Primera Lección",desc:"Completa tu primera lección"},
            {icon:"⚡",name:"Racha 3 días",desc:"Practica 3 días seguidos"},
            {icon:"⭐",name:"Puntaje Perfecto",desc:"100% en evaluación"},
            {icon:"🏆",name:"Campeón Semanal",desc:"Gana reto semanal"},
            {icon:"📚",name:"Maestro",desc:"Nivel 10"},
            {icon:"✅",name:"Centurión",desc:"100 ejercicios"},
          ].map((b,i)=>(
            <div key={i} className="achievement-card locked"><span className="achievement-icon">{b.icon}</span><div><div className="achievement-name">{b.name}</div><div className="achievement-desc">{b.desc}</div></div></div>
          ))}
        </div>
      </div>
    </div>
  );

  const CommunitySection = () => (
    <div>
      <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px",display:"flex",alignItems:"center",gap:"10px"}}><FiUsers size={22}/>Ranking Semanal</h2>
      <p className="text-secondary mb-6">Los músicos más activos de MelodyPath.</p>
      <div className="card">
        {ranking.length === 0
          ? <p className="text-secondary">Cargando ranking...</p>
          : ranking.map((r:any)=>(
            <div key={r.user_id} className="rank-row" style={{background:r.is_current_user?"var(--accent-glow)":""}}>
              <span className={`rank-num ${r.position<=3?"top":""}`}>
                {r.position<=3
                  ? <FiAward size={18} color={r.position===1?"#f59e0b":r.position===2?"#9ca3af":"#cd7f32"}/>
                  : r.position}
              </span>
              <div className="avatar" style={{width:"32px",height:"32px",fontSize:"0.8rem"}}>{r.name?.[0]||"U"}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:"0.875rem"}}>{r.name}</div>
                <div className="text-xs text-muted">{r.instrument||"Sin instrumento"}</div>
              </div>
              <div className="text-gold text-sm font-bold" style={{display:"flex",alignItems:"center",gap:"4px"}}>
                <FiStar size={12} color="#f59e0b"/>{r.xp} XP
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );

  // ── Lessons Section — HU-007 YouTube Integration ──────
  const LessonsSection = () => {
    const [videoLoaded, setVideoLoaded] = React.useState(false);

    // Extract YouTube video ID → embed URL + thumbnail
    const getYTId = (url: string) => {
      if (!url) return null;
      const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([w-]{11})/);
      return m ? m[1] : null;
    };
    const getEmbed    = (url: string) => { const id = getYTId(url); return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&color=white` : null; };
    const getThumbnail = (url: string) => { const id = getYTId(url); return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null; };

    if (activeLesson) {
      const embedUrl    = getEmbed(activeLesson.video_url);
      const thumbUrl    = getThumbnail(activeLesson.video_url);
      const levelColor  = activeLesson.level==="beginner" ? "var(--green)" : activeLesson.level==="intermediate" ? "var(--cyan)" : "var(--accent-light)";
      const levelBadge  = activeLesson.level==="beginner" ? "badge-green" : activeLesson.level==="intermediate" ? "badge-cyan" : "badge-accent";

      return (
        <div className="fade-in">
          <button className="btn btn-ghost btn-sm mb-4" style={{display:"flex",alignItems:"center",gap:"6px"}} onClick={()=>{setActiveLesson(null);setVideoLoaded(false);}}>
            ← Volver a lecciones
          </button>

          <div style={{maxWidth:"800px"}}>
            {/* ── Video Player ── */}
            {embedUrl && (
              <div style={{marginBottom:"20px",borderRadius:"var(--radius)",overflow:"hidden",border:"1px solid var(--border)",boxShadow:"var(--shadow-glow)"}}>
                {/* Header bar */}
                <div style={{background:"var(--bg-secondary)",padding:"10px 16px",display:"flex",alignItems:"center",gap:"10px",borderBottom:"1px solid var(--border)"}}>
                  <div style={{display:"flex",gap:"6px"}}>
                    <div style={{width:"10px",height:"10px",borderRadius:"50%",background:"#ef4444"}}/>
                    <div style={{width:"10px",height:"10px",borderRadius:"50%",background:"#f59e0b"}}/>
                    <div style={{width:"10px",height:"10px",borderRadius:"50%",background:"#10b981"}}/>
                  </div>
                  <span style={{fontSize:"0.75rem",color:"var(--text-muted)",flex:1,textAlign:"center",fontFamily:"monospace"}}>
                    youtube.com · {activeLesson.title}
                  </span>
                  <span className="badge badge-accent" style={{fontSize:"0.62rem"}}>▶ YouTube</span>
                </div>
                {/* iframe 16:9 */}
                <div style={{position:"relative",paddingBottom:"56.25%",height:0,background:"#000"}}>
                  {!videoLoaded && thumbUrl && (
                    <img src={thumbUrl} alt={activeLesson.title}
                      style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.6}}/>
                  )}
                  <iframe
                    src={embedUrl}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    onLoad={()=>setVideoLoaded(true)}
                    style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}}
                  />
                </div>
              </div>
            )}

            {/* ── Lesson detail card ── */}
            <div className="card fade-in-up delay-2">
              <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px",flexWrap:"wrap"}}>
                <span className={`badge ${levelBadge}`}>{activeLesson.level}</span>
                <span className="badge badge-muted">{activeLesson.lesson_type}</span>
                {activeLesson.completed && <span className="badge badge-green">✓ Completada</span>}
                <span className="text-xs text-muted" style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:"6px"}}>
                  <FiSliders size={12}/>{activeLesson.duration_minutes} min
                  <FiStar size={12} color="#f59e0b"/> +{activeLesson.xp_reward} XP
                </span>
              </div>

              <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.4rem",marginBottom:"10px",color:"var(--text-primary)"}}>{activeLesson.title}</h2>
              <p className="text-secondary mb-4" style={{borderLeft:`3px solid ${levelColor}`,paddingLeft:"12px"}}>{activeLesson.description}</p>

              {/* Content */}
              <div style={{background:"var(--bg-secondary)",borderRadius:"var(--radius-sm)",padding:"20px",marginBottom:"20px",fontSize:"0.88rem",lineHeight:1.85,color:"var(--text-secondary)",whiteSpace:"pre-wrap",fontFamily:"var(--font-sans)"}}>
                {activeLesson.content || "Contenido disponible en el panel de administración."}
              </div>

              <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
                <button className="btn btn-primary" style={{display:"flex",alignItems:"center",gap:"6px"}}
                  onClick={()=>handleCompleteLesson(activeLesson.id)} disabled={activeLesson.completed}>
                  <FiCheckCircle size={15}/>
                  {activeLesson.completed ? "Ya completada" : "Marcar como completada"}
                </button>
                <button className="btn btn-secondary" style={{display:"flex",alignItems:"center",gap:"6px"}}
                  onClick={()=>{ setActive("exercises"); setActiveLesson(null); }}>
                  <FiTarget size={15}/>Practicar ejercicios →
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (lessons.length===0) return (
      <div>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px",display:"flex",alignItems:"center",gap:"10px"}}><FiBook size={22}/>Lecciones</h2>
        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
          {[0,1,2,3].map(i=>(
            <div key={i} className={`card fade-in-up delay-${i+1}`} style={{display:"flex",gap:"16px"}}>
              <Sk w="120px" h="72px" r="var(--radius-sm)"/>
              <div style={{flex:1}}><Sk w="60%" h="18px" mb="10px"/><Sk w="90%" h="13px" mb="8px"/><Sk w="40%" h="13px"/></div>
            </div>
          ))}
        </div>
      </div>
    );

    const grouped = lessons.reduce((g:any,l:any)=>{ (g[l.level]=g[l.level]||[]).push(l); return g; },{});
    return (
      <div className="fade-in">
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px",display:"flex",alignItems:"center",gap:"10px"}}>
          <FiBook size={22}/>Lecciones
        </h2>
        <p className="text-secondary mb-6">
          Tutoriales interactivos con video de YouTube. · <strong style={{color:"var(--accent-light)"}}>{lessons.length}</strong> lecciones disponibles
        </p>

        {Object.entries(grouped).map(([level, ls]:any) => (
          <div key={level} className="mb-6">
            <h3 className="section-title mb-3" style={{display:"flex",alignItems:"center",gap:"6px"}}>
              {level==="beginner"  ? <><FiCheckCircle size={14} color="#10b981"/>Principiante</> :
               level==="intermediate" ? <><FiBarChart2 size={14} color="#f59e0b"/>Intermedio</> :
               <><FiTrendingUp size={14} color="#ef4444"/>Avanzado</>}
            </h3>
            <div className="grid-2">
              {ls.map((l:any, idx:number) => {
                const thumb = getThumbnail(l.video_url);
                return (
                  <div key={l.id} className={`card card-glow fade-in-up delay-${(idx%6)+1}`}
                    style={{cursor:"pointer",padding:"0",overflow:"hidden"}}
                    onClick={()=>{setActiveLesson(l);setVideoLoaded(false);}}>

                    {/* Thumbnail strip */}
                    {thumb ? (
                      <div style={{position:"relative",height:"130px",overflow:"hidden",background:"#000"}}>
                        <img src={thumb} alt={l.title}
                          style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.85,transition:"opacity 0.2s"}}
                          onMouseOver={e=>(e.currentTarget.style.opacity="1")}
                          onMouseOut={e=>(e.currentTarget.style.opacity="0.85")}
                        />
                        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 40%,rgba(10,10,15,0.85) 100%)"}}>
                          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"44px",height:"44px",background:"rgba(255,0,0,0.9)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 12px rgba(0,0,0,0.5)"}}>
                            <div style={{width:0,height:0,borderTop:"10px solid transparent",borderBottom:"10px solid transparent",borderLeft:"16px solid #fff",marginLeft:"3px"}}/>
                          </div>
                        </div>
                        {l.completed && (
                          <div style={{position:"absolute",top:"8px",right:"8px"}}>
                            <span className="badge badge-green" style={{backdropFilter:"blur(4px)",background:"rgba(16,185,129,0.85)"}}>✓ Completada</span>
                          </div>
                        )}
                        <div style={{position:"absolute",bottom:"6px",right:"8px",fontSize:"0.68rem",background:"rgba(0,0,0,0.75)",color:"#fff",padding:"2px 6px",borderRadius:"4px",fontFamily:"monospace"}}>
                          {l.duration_minutes}:00
                        </div>
                      </div>
                    ) : (
                      <div style={{height:"100px",background:"var(--gradient-card)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <FiBook size={32} color="var(--border-light)"/>
                      </div>
                    )}

                    {/* Info */}
                    <div style={{padding:"14px 16px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                        <span className="badge badge-muted" style={{fontSize:"0.65rem"}}>{l.lesson_type}</span>
                        {l.video_url && <span className="badge badge-accent" style={{fontSize:"0.62rem"}}>▶ Video</span>}
                      </div>
                      <h4 style={{fontWeight:700,marginBottom:"5px",fontSize:"0.92rem"}}>{l.title}</h4>
                      <p className="text-xs text-muted mb-3" style={{lineHeight:1.4}}>{l.description}</p>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span className="text-xs text-muted" style={{display:"flex",alignItems:"center",gap:"4px"}}><FiSliders size={11}/>{l.duration_minutes} min</span>
                        <span className="text-gold text-xs font-bold" style={{display:"flex",alignItems:"center",gap:"3px"}}><FiStar size={11} color="#f59e0b"/>+{l.xp_reward} XP</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ── Exercises Section ─────────────────────────────────
  const ExercisesSection = () => {
    if (exercises.length===0) return <div><h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px",display:"flex",alignItems:"center",gap:"10px"}}><FiTarget size={22}/>Ejercicios</h2><div className="card"><p className="text-secondary">Cargando ejercicios... Ejecuta <code style={{background:"var(--bg-secondary)",padding:"2px 6px",borderRadius:"4px"}}>python seed_lessons.py</code> para cargar ejercicios de ejemplo.</p></div></div>;
    if (exDone) return (
      <div>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px",display:"flex",alignItems:"center",gap:"10px"}}><FiTarget size={22}/>¡Sesión completada!</h2>
        <div className="card" style={{maxWidth:"480px",textAlign:"center",padding:"40px"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:"16px"}}><FiAward size={64} color="#f59e0b"/></div>
          <div style={{fontFamily:"var(--font-display)",fontSize:"2.5rem",fontWeight:900,marginBottom:"8px"}} className="gradient-text">{exScore.correct}/{exScore.total}</div>
          <p className="text-secondary mb-4">Respuestas correctas</p>
          <div className="progress-bar mb-4" style={{height:"12px"}}><div className="progress-fill" style={{width:`${Math.round(exScore.correct/exScore.total*100)}%`}} /></div>
          <p className="text-secondary mb-6">{Math.round(exScore.correct/exScore.total*100)}% de precisión</p>
          <div style={{display:"flex",gap:"10px",justifyContent:"center"}}>
            <button className="btn btn-primary" onClick={()=>{setExIdx(0);setExAnswer("");setExFeedback(null);setExDone(false);setExScore({correct:0,total:0});}}>Repetir</button>
            <button className="btn btn-secondary" onClick={()=>setActive("progress")}>Ver progreso →</button>
          </div>
        </div>
      </div>
    );
    const ex = exercises[exIdx];
    const progress = Math.round((exIdx/exercises.length)*100);
    return (
      <div>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px",display:"flex",alignItems:"center",gap:"10px"}}><FiTarget size={22}/>Ejercicios</h2>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
          <p className="text-secondary">Ejercicio {exIdx+1} de {exercises.length}</p>
          <span className="text-gold text-sm" style={{display:"flex",alignItems:"center",gap:"4px"}}><FiCheckCircle size={13}/> {exScore.correct} correctas</span>
        </div>
        <div className="progress-bar mb-6" style={{maxWidth:"700px"}}><div className="progress-fill" style={{width:`${progress}%`}} /></div>
        <div className="card" style={{maxWidth:"700px"}}>
          <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
            <span className="badge badge-cyan">{ex.exercise_type}</span>
            <span className={`badge ${ex.difficulty==="beginner"?"badge-green":ex.difficulty==="intermediate"?"badge-cyan":"badge-accent"}`}>{ex.difficulty}</span>
            <span className="badge badge-gold" style={{marginLeft:"auto"}}>+{ex.xp_reward} XP</span>
          </div>
          <h3 style={{fontSize:"1.1rem",fontWeight:700,marginBottom:"20px"}}>{ex.question}</h3>
          <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"20px"}}>
            {ex.options.map((opt:string,i:number)=>{
              let border="var(--border)", bg="var(--bg-secondary)", color="var(--text-primary)";
              if(exFeedback){
                if(opt===exFeedback.correct_answer){border="var(--green)";bg="rgba(16,185,129,0.1)";color="var(--green)";}
                else if(opt===exAnswer&&!exFeedback.is_correct){border="var(--red)";bg="rgba(239,68,68,0.1)";color="var(--red)";}
              } else if(opt===exAnswer){border="var(--accent)";bg="var(--accent-glow)";color="var(--accent-light)";}
              return <button key={i} disabled={!!exFeedback} onClick={()=>setExAnswer(opt)}
                style={{padding:"13px 18px",borderRadius:"var(--radius-sm)",border:`2px solid ${border}`,background:bg,color,cursor:exFeedback?"default":"pointer",textAlign:"left",fontFamily:"var(--font-sans)",fontSize:"0.9rem",transition:"var(--transition)"}}>{opt}</button>;
            })}
          </div>
          {exFeedback && <div style={{padding:"12px 16px",borderRadius:"var(--radius-sm)",background:exFeedback.is_correct?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)",border:`1px solid ${exFeedback.is_correct?"var(--green)":"var(--red)"}`,marginBottom:"16px"}}>
            <p style={{fontWeight:600,color:exFeedback.is_correct?"var(--green)":"var(--red)",marginBottom:"4px"}}>{exFeedback.is_correct?"✓ ¡Correcto!":"✗ Incorrecto"}</p>
            <p style={{fontSize:"0.85rem",color:"var(--text-secondary)"}}>{exFeedback.explanation}</p>
          </div>}
          <div style={{display:"flex",justifyContent:"space-between"}}>
            {!exFeedback
              ? <button className="btn btn-primary" disabled={!exAnswer} onClick={()=>handleSubmitExercise(ex)}>Verificar respuesta</button>
              : <button className="btn btn-primary" onClick={handleNextExercise}>{exIdx>=exercises.length-1?"Ver resultados":"Siguiente →"}</button>
            }
          </div>
        </div>
      </div>
    );
  };

  // ── HU-009: Note Trainer Section (Web Audio API) ─────
  const NoteTrainerSection = () => {
    const [micMode, setMicMode]           = React.useState(false);
    const [autoMatched, setAutoMatched]   = React.useState(false);
    const autoRef                         = React.useRef<ReturnType<typeof setTimeout>|null>(null);

    // Auto-answer via mic: if detected note matches target for 1.2s
    React.useEffect(() => {
      if (!micMode || !pitch.isListening || !pitch.note || !currentNote) return;
      const base = (n: string) => n.replace("#","").replace("b","");
      const match = pitch.note === currentNote ||
                    pitch.note === currentNote + "#" ||
                    base(pitch.note) === base(currentNote);
      if (match && !noteFeedback && !autoMatched) {
        if (!autoRef.current) {
          autoRef.current = setTimeout(() => {
            setAutoMatched(true);
            setNoteAnswer(currentNote);
            setNoteFeedback("correct");
            setNoteScore(s => ({correct: s.correct+1, total: s.total+1}));
            autoRef.current = null;
            setTimeout(() => { setAutoMatched(false); pickNote(); }, 1400);
          }, 1200);
        }
      } else {
        if (autoRef.current) { clearTimeout(autoRef.current); autoRef.current = null; }
      }
    }, [pitch.note, currentNote, noteFeedback, micMode, pitch.isListening, autoMatched]);

    const handleNoteAnswer = (note: string) => {
      if (noteFeedback) return;
      setNoteAnswer(note);
      const correct = note === currentNote;
      setNoteFeedback(correct ? "correct" : "wrong");
      setNoteScore(s => ({correct: s.correct+(correct?1:0), total: s.total+1}));
      setTimeout(() => pickNote(), 1200);
    };

    const WHITE_KEYS = ["Do","Re","Mi","Fa","Sol","La","Si"];
    const BLACK_KEYS: Record<number,string> = {0:"Do#",1:"Re#",3:"Fa#",4:"Sol#",5:"La#"};

    // Tuner needle position: cents range -50..+50 → 0..100%
    const needlePos = Math.max(0, Math.min(100, 50 + (pitch.cents ?? 0)));
    const centsColor = Math.abs(pitch.cents) < 10 ? "#10b981" : Math.abs(pitch.cents) < 25 ? "#f59e0b" : "#ef4444";
    const pitchMatchesTarget = pitch.note && currentNote && (
      pitch.note === currentNote || pitch.note.replace("#","") === currentNote
    );

    return (
      <div className="fade-in">
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",marginBottom:"8px",display:"flex",alignItems:"center",gap:"10px"}}>
          <GiPianoKeys size={22}/>Identificación de Notas
          <span className="badge badge-accent" style={{fontSize:"0.65rem",marginLeft:"4px"}}>Web Audio API</span>
        </h2>
        <p className="text-secondary mb-4">Entrena tu oído musical. Usa el teclado o activa el micrófono para detección automática.</p>

        {/* Score + mode toggle */}
        <div style={{display:"flex",gap:"12px",alignItems:"center",marginBottom:"20px",flexWrap:"wrap"}}>
          <div className="stat-card fade-in-up delay-1" style={{minWidth:"110px",textAlign:"center"}}>
            <div className="stat-icon"><FiCheckCircle size={18} color="#10b981"/></div>
            <div className="stat-value">{noteScore.correct}</div>
            <div className="stat-label">Correctas</div>
          </div>
          <div className="stat-card fade-in-up delay-2" style={{minWidth:"110px",textAlign:"center"}}>
            <div className="stat-icon"><FiTarget size={18} color="#a78bfa"/></div>
            <div className="stat-value">{noteScore.total > 0 ? Math.round(noteScore.correct/noteScore.total*100) : 0}%</div>
            <div className="stat-label">Precisión</div>
          </div>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            <button className="btn btn-secondary btn-sm" onClick={() => setNoteScore({correct:0,total:0})}>
              <FiRefreshCw size={13}/>Reiniciar
            </button>
            <button
              className={`btn btn-sm ${micMode ? "btn-primary" : "btn-secondary"}`}
              style={{display:"flex",alignItems:"center",gap:"6px"}}
              onClick={() => {
                if (micMode) { pitch.stop(); setMicMode(false); }
                else { pitch.start(); setMicMode(true); }
              }}
            >
              {micMode ? <><FiSliders size={13}/>Detener micrófono</> : <><FiSliders size={13}/>Activar micrófono</>}
            </button>
          </div>
        </div>

        {pitch.error && (
          <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid var(--red)",borderRadius:"var(--radius-sm)",padding:"10px 14px",marginBottom:"16px",color:"var(--red)",fontSize:"0.875rem"}}>
            {pitch.error}
          </div>
        )}

        <div style={{display:"flex",gap:"20px",flexWrap:"wrap",alignItems:"flex-start"}}>

          {/* ── Mic Tuner Panel ────────────────────── */}
          {micMode && (
            <div className="card fade-in-up" style={{flex:"1",minWidth:"260px",maxWidth:"320px",textAlign:"center",padding:"24px"}}>
              <p className="text-xs text-muted mb-3" style={{letterSpacing:"1px",textTransform:"uppercase"}}>
                {pitch.isListening ? "Escuchando..." : "Iniciando..."}
              </p>

              {/* Detected note — big */}
              <div style={{
                fontFamily:"var(--font-display)",fontSize:"4rem",fontWeight:900,
                color: pitch.note ? (pitchMatchesTarget ? "#10b981" : "var(--text-primary)") : "var(--text-muted)",
                transition:"color 0.3s",marginBottom:"4px",lineHeight:1,
              }}>
                {pitch.note || "—"}
              </div>

              {/* Frequency */}
              <div style={{fontSize:"0.8rem",color:"var(--text-muted)",marginBottom:"16px",fontFamily:"monospace"}}>
                {pitch.frequency > 0 ? `${pitch.frequency} Hz` : "—"}
              </div>

              {/* Tuner rail (cents) */}
              <div style={{marginBottom:"14px"}}>
                <div style={{position:"relative",height:"6px",background:"var(--border)",borderRadius:"99px",marginBottom:"4px"}}>
                  <div style={{position:"absolute",left:"50%",top:"-2px",width:"2px",height:"10px",background:"var(--border-light)",borderRadius:"1px"}}/>
                  <div style={{
                    position:"absolute",top:"-4px",left:`${needlePos}%`,
                    width:"14px",height:"14px",background:centsColor,
                    borderRadius:"50%",transform:"translateX(-50%)",
                    transition:"left 0.1s,background 0.2s",
                    boxShadow:`0 0 8px ${centsColor}80`,
                  }}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.65rem",color:"var(--text-muted)"}}>
                  <span>-50¢</span><span style={{color:centsColor,fontWeight:600}}>{pitch.cents > 0 ? "+" : ""}{pitch.cents}¢</span><span>+50¢</span>
                </div>
              </div>

              {/* Volume bar */}
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"16px"}}>
                <FiSliders size={12} color="var(--text-muted)"/>
                <div style={{flex:1,height:"4px",background:"var(--border)",borderRadius:"99px",overflow:"hidden"}}>
                  <div style={{width:`${Math.min(100,pitch.volume/2.55)}%`,height:"100%",background:"var(--gradient-main)",transition:"width 0.05s",borderRadius:"99px"}}/>
                </div>
              </div>

              {/* Match indicator */}
              {pitch.note && currentNote && (
                <div style={{
                  padding:"8px 14px",borderRadius:"var(--radius-sm)",
                  background: pitchMatchesTarget ? "rgba(16,185,129,0.15)" : "rgba(124,58,237,0.1)",
                  border:`1px solid ${pitchMatchesTarget ? "var(--green)" : "var(--border)"}`,
                  fontSize:"0.8rem",fontWeight:600,
                  color: pitchMatchesTarget ? "var(--green)" : "var(--text-secondary)",
                }}>
                  {pitchMatchesTarget ? `✓ ¡${pitch.note} detectada! Espera...` : `Buscando: ${currentNote}`}
                </div>
              )}
            </div>
          )}

          {/* ── Quiz card ─────────────────────────── */}
          <div className="card fade-in-up delay-2" style={{flex:"1",minWidth:"280px",maxWidth:"600px",textAlign:"center",padding:"28px"}}>
            <p className="text-secondary text-sm mb-2">¿Cuál es esta nota?</p>
            <div style={{fontFamily:"var(--font-display)",fontSize:"4rem",fontWeight:900,marginBottom:"8px"}} className="gradient-text">
              {currentNote ? "♪" : "?"}
            </div>
            <div style={{fontSize:"1rem",fontWeight:600,marginBottom:"20px",color:"var(--text-muted)",letterSpacing:"2px"}}>
              {noteFeedback === "correct" && <span style={{color:"var(--green)"}}>✓ ¡Correcto!</span>}
              {noteFeedback === "wrong"   && <span style={{color:"var(--red)"}}>✗ Era: {currentNote}</span>}
              {!noteFeedback && (micMode ? `Toca o canta ${currentNote}` : "Selecciona en el teclado")}
            </div>

            {/* Piano keyboard */}
            <div style={{position:"relative",height:"120px",display:"flex",justifyContent:"center",marginBottom:"20px"}}>
              <div style={{position:"relative",display:"flex",gap:"3px"}}>
                {WHITE_KEYS.map((note,i) => {
                  const isAnswer  = noteAnswer === note;
                  const isCorrect = noteFeedback==="correct" && isAnswer;
                  const isWrong   = noteFeedback==="wrong"   && isAnswer;
                  const isTarget  = noteFeedback==="wrong"   && note === currentNote;
                  const isMicHit  = micMode && pitch.note === note && pitch.isListening;
                  let bg = "#f8f8f8";
                  if (isCorrect || isTarget) bg = "#10b981";
                  else if (isWrong) bg = "#ef4444";
                  else if (isMicHit) bg = "#a78bfa";
                  return (
                    <button key={note} onClick={() => handleNoteAnswer(note)}
                      style={{width:"52px",height:"110px",background:bg,border:"1px solid #ccc",borderRadius:"0 0 8px 8px",cursor:noteFeedback?"default":"pointer",color:"#222",fontSize:"0.75rem",fontWeight:700,display:"flex",alignItems:"flex-end",justifyContent:"center",paddingBottom:"10px",position:"relative",zIndex:1,transition:"all 0.15s",boxShadow:isCorrect||isTarget?"0 0 12px rgba(16,185,129,0.5)":isMicHit?"0 0 14px rgba(167,139,250,0.7)":""}}>
                      {note}
                    </button>
                  );
                })}
                {Object.entries(BLACK_KEYS).map(([posStr,note]) => {
                  const pos  = Number(posStr);
                  const left = pos*55 + 36;
                  const isMicHit = micMode && pitch.note === note && pitch.isListening;
                  return (
                    <button key={note} onClick={() => handleNoteAnswer(note)}
                      style={{position:"absolute",top:0,left:`${left}px`,width:"32px",height:"70px",background:isMicHit?"#7c3aed":"#1a1a2e",borderRadius:"0 0 5px 5px",cursor:noteFeedback?"default":"pointer",color:"#fff",fontSize:"0.6rem",fontWeight:700,zIndex:2,border:"none",display:"flex",alignItems:"flex-end",justifyContent:"center",paddingBottom:"6px",transition:"all 0.15s",boxShadow:isMicHit?"0 0 14px rgba(124,58,237,0.8)":""}}>
                      {note}
                    </button>
                  );
                })}
              </div>
            </div>
            <button className="btn btn-primary" onClick={pickNote}>Siguiente nota →</button>
          </div>
        </div>
      </div>
    );
  };


  const sections: Record<string, React.ReactNode> = {
    overview:    <Overview />,
    assessment:  <Assessment />,
    instrument:  <InstrumentSection />,
    lessons:     <LessonsSection />,
    exercises:   <ExercisesSection />,
    notes:       <NoteTrainerSection />,
    challenges:  <ChallengesSection />,
    progress:    <ProgressSection />,
    badges:      <BadgesSection />,
    community:   <CommunitySection />,
  };

  return (
    <div>
      {showConfetti && <ConfettiShow/>}
      <nav className="navbar">
        <div className="nav-brand">
          <div className="nav-brand-icon"><GiMusicalNotes size={20}/></div>
          <span className="nav-brand-name">Melody<span>Path</span></span>
        </div>
        <div className="nav-right">
          {stats && <div className="xp-pill" style={{display:"flex",alignItems:"center",gap:"4px"}}><FiStar size={13} color="#f59e0b"/> {stats.xp} XP</div>}
          {stats && <div className="xp-pill" style={{color:"var(--cyan)",display:"flex",alignItems:"center",gap:"4px"}}><FiZap size={13} color="#f97316"/> {stats.streak}</div>}
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
          {nav.slice(2,7).map(item=>(
            <button key={item.id} className={`sidebar-item ${active===item.id?"active":""}`} onClick={()=>setActive(item.id)}>
              <span className="icon">{item.icon}</span>{item.label}
            </button>
          ))}
          <span className="sidebar-label">Social</span>
          {nav.slice(7).map(item=>(
            <button key={item.id} className={`sidebar-item ${active===item.id?"active":""}`} onClick={()=>setActive(item.id)}>
              <span className="icon">{item.icon}</span>{item.label}
            </button>
          ))}
          <div className="divider" />
          <a href="/admin" className="sidebar-item" style={{display:"flex",alignItems:"center",gap:"8px"}}><span className="icon" style={{display:"flex"}}><FiSettings size={16}/></span>Panel admin</a>
          <button className="sidebar-item" style={{color:"var(--red)",display:"flex",alignItems:"center",gap:"8px"}} onClick={logout}><span className="icon" style={{display:"flex"}}><FiLogOut size={16}/></span>Cerrar sesión</button>
        </aside>
        <main className="main">{sections[active]}</main>
      </div>
    </div>
  );
}
