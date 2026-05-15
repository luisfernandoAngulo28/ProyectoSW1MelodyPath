"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { authAPI } from "@/lib/api";
import Cookies from "js-cookie";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register" | "recovery">("login");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState("");

  // Register form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPw, setRegPw] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  // Recovery
  const [recEmail, setRecEmail] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPw) { toast.error("Completa todos los campos"); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.login(loginEmail, loginPw);
      Cookies.set("access_token", data.access, { expires: 1 });
      Cookies.set("refresh_token", data.refresh, { expires: 7 });
      toast.success(`¡Bienvenido, ${data.user.name.split(" ")[0]}! 🎵`);
      router.push(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch {
      toast.error("Credenciales incorrectas");
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPw || !regConfirm) { toast.error("Completa todos los campos"); return; }
    if (regPw.length < 6) { toast.error("La contraseña debe tener al menos 6 caracteres"); return; }
    if (regPw !== regConfirm) { toast.error("Las contraseñas no coinciden"); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.register({ name: regName, email: regEmail, password: regPw });
      Cookies.set("access_token", data.access, { expires: 1 });
      Cookies.set("refresh_token", data.refresh, { expires: 7 });
      toast.success("¡Cuenta creada! Bienvenido 🎉");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.email?.[0] || "Error al registrar");
    } finally { setLoading(false); }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recEmail) { toast.error("Ingresa tu correo"); return; }
    setLoading(true);
    try {
      await authAPI.recoverPassword(recEmail);
      toast.success(`Enlace enviado a ${recEmail} 📧`);
      setTab("login");
    } catch { toast.error("Error al enviar el correo"); }
    finally { setLoading(false); }
  };

  const NOTES = ["🎵", "🎶", "🎸", "🎹", "🥁", "🎺", "🎻"];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(145deg,#0d0d18,#1a0a3a,#0a1a2e)", padding: "60px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-150px", right: "-150px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.25),transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-100px", left: "-100px", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle,rgba(6,182,212,0.15),transparent 70%)" }} />
        {/* Floating notes */}
        {NOTES.map((n, i) => (
          <span key={i} style={{ position: "absolute", fontSize: `${Math.random() * 1 + 0.8}rem`, opacity: 0.1, left: `${(i * 14) + Math.random() * 8}%`, top: `${Math.random() * 80 + 10}%`, animation: `float ${15 + i * 2}s linear infinite`, animationDelay: `${i * 2}s` }}>{n}</span>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px", position: "relative", zIndex: 1 }}>
          <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg,#7c3aed,#06b6d4)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", boxShadow: "0 0 30px rgba(124,58,237,0.4)" }}>🎵</div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800 }}>Melody<span style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Path</span></span>
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "#9d5df0", marginBottom: "12px" }}>Plataforma Musical con IA</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,3.5vw,2.8rem)", fontWeight: 900, lineHeight: 1.15, marginBottom: "18px" }}>
            Tu viaje musical<br /><span style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>empieza aquí</span>
          </h1>
          <p style={{ color: "#9490b5", fontSize: "0.95rem", lineHeight: 1.7, maxWidth: "400px" }}>
            Aprende piano, guitarra, batería y canto con inteligencia artificial que se adapta a tu ritmo. Gamificación, retos y comunidad.
          </p>
          <div style={{ marginTop: "40px", display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { icon: "🤖", title: "IA Adaptativa", desc: "Análisis de desempeño y rutas personalizadas" },
              { icon: "🎮", title: "Gamificación", desc: "XP, insignias, niveles y retos diarios" },
              { icon: "🎸", title: "4 instrumentos", desc: "Piano, guitarra, batería y canto" },
              { icon: "👥", title: "Comunidad", desc: "Rankings y grupos de estudio" },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "34px", height: "34px", background: "rgba(255,255,255,0.06)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>{f.icon}</div>
                <span style={{ fontSize: "0.875rem", color: "#9490b5" }}><strong style={{ color: "#f1f0ff" }}>{f.title}</strong> — {f.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px" }}>
        <div style={{ width: "100%", maxWidth: "380px" }}>
          {tab !== "recovery" && (
            <div className="tabs" style={{ marginBottom: "28px" }}>
              <button className={`tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>Iniciar sesión</button>
              <button className={`tab ${tab === "register" ? "active" : ""}`} onClick={() => setTab("register")}>Registrarse</button>
            </div>
          )}

          {/* LOGIN */}
          {tab === "login" && (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, marginBottom: "4px" }}>Bienvenido 👋</h2>
                <p className="text-secondary text-sm">Continúa tu práctica musical</p>
              </div>
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input className="form-input" type="email" placeholder="tu@correo.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} autoComplete="email" />
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <div style={{ position: "relative" }}>
                  <input className="form-input" type={showPw ? "text" : "password"} placeholder="••••••••" value={loginPw} onChange={e => setLoginPw(e.target.value)} style={{ paddingRight: "42px" }} autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1rem" }}>{showPw ? "🙈" : "👁"}</button>
                </div>
                <button type="button" className="btn-ghost btn-sm" style={{ alignSelf: "flex-end", color: "var(--accent-light)", padding: "2px 0", fontSize: "0.8rem" }} onClick={() => setTab("recovery")}>¿Olvidaste tu contraseña?</button>
              </div>
              <button className="btn btn-primary btn-full btn-lg" disabled={loading}>{loading ? "Iniciando..." : "Iniciar sesión"}</button>
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "12px 14px" }}>
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600, marginBottom: "8px" }}>Cuentas demo</p>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {[{ label: "🎸 Usuario", e: "user@demo.com", p: "demo1234" }, { label: "⚙️ Admin", e: "admin@demo.com", p: "admin1234" }, { label: "⭐ Premium", e: "premium@demo.com", p: "demo1234" }].map(d => (
                    <button key={d.e} type="button" onClick={() => { setLoginEmail(d.e); setLoginPw(d.p); }} style={{ padding: "4px 10px", borderRadius: "var(--radius-xs)", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: "0.75rem", cursor: "pointer", fontFamily: "var(--font-sans)", transition: "var(--transition)" }}>{d.label}</button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* REGISTER */}
          {tab === "register" && (
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, marginBottom: "4px" }}>Crea tu cuenta 🎵</h2>
                <p className="text-secondary text-sm">Únete a miles de músicos</p>
              </div>
              <div className="form-group">
                <label className="form-label">Nombre completo</label>
                <input className="form-input" type="text" placeholder="Tu nombre" value={regName} onChange={e => setRegName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input className="form-input" type="email" placeholder="tu@correo.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input className="form-input" type="password" placeholder="Mínimo 6 caracteres" value={regPw} onChange={e => setRegPw(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirmar contraseña</label>
                <input className="form-input" type="password" placeholder="Repite tu contraseña" value={regConfirm} onChange={e => setRegConfirm(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-full btn-lg" disabled={loading}>{loading ? "Creando..." : "Crear cuenta gratis"}</button>
              <p className="text-xs text-muted" style={{ textAlign: "center" }}>Al registrarte aceptas los términos y política de privacidad.</p>
            </form>
          )}

          {/* RECOVERY */}
          {tab === "recovery" && (
            <form onSubmit={handleRecovery} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start", padding: "4px 0", color: "var(--text-muted)" }} onClick={() => setTab("login")}>← Volver</button>
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, marginBottom: "4px" }}>Recuperar contraseña 🔑</h2>
                <p className="text-secondary text-sm">Te enviaremos un enlace de acceso</p>
              </div>
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input className="form-input" type="email" placeholder="tu@correo.com" value={recEmail} onChange={e => setRecEmail(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-full" disabled={loading}>{loading ? "Enviando..." : "Enviar enlace"}</button>
            </form>
          )}
        </div>
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`}</style>
    </div>
  );
}
