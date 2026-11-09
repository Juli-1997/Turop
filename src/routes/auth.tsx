import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import "@lovable.dev/cloud-auth-js/styles.css";
import { Button } from "@/components/ui/button";
import { ProfileFields, initialProfile, profilePayload } from "@/components/profile-fields";
import { emailSchema, passwordSchema, profileSchema } from "@/lib/profile";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/auth")({ head: () => ({ meta: [{ title: "Crea tu cuenta — Turop" }, { name: "description", content: "Crea tu perfil personal para gestionar tus suscripciones en Turop." }, { property: "og:title", content: "Tu cuenta — Turop" }, { property: "og:description", content: "Regístrate o inicia sesión en Turop." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: Auth });
function Auth() {
  const [signup, setSignup] = useState(true);
  const [form, setForm] = useState(initialProfile);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  const { user } = useAuth(); const navigate = useNavigate();
  useEffect(() => { if (user) void navigate({ to: "/perfil", replace: true }); }, [user, navigate]);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMessage("");
    const mail = emailSchema.safeParse(email); const pass = passwordSchema.safeParse(password);
    const profile = profileSchema.safeParse(profilePayload(form));
    if (!mail.success || !pass.success || (signup && !profile.success)) { setMessage(!mail.success ? mail.error.issues[0]?.message ?? "Revisa el correo." : !pass.success ? pass.error.issues[0]?.message ?? "Revisa la contraseña." : !profile.success ? profile.error.issues[0]?.message ?? "Revisa los datos." : "Revisa los datos."); return; }
    setBusy(true);
    try {
      if (signup && profile.success) {
        const { data, error } = await supabase.auth.signUp({ email: mail.data, password: pass.data, options: { emailRedirectTo: window.location.origin + "/auth", data: { full_name: profile.data.name, country: profile.data.country, phone: profile.data.phone, bank_account: profile.data.bank_account } } });
        if (error) { setMessage("No se pudo crear la cuenta. Revisa tus datos o intenta iniciar sesión."); return; }
        if (!data.session) { setPassword(""); setForm(initialProfile); setMessage("Revisa tu correo y confirma tu cuenta para iniciar sesión."); setSignup(false); }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: mail.data, password: pass.data });
        if (error) setMessage("Correo o contraseña incorrectos, o correo pendiente de confirmar.");
      }
    } catch { setMessage("No se pudo conectar. Inténtalo de nuevo."); } finally { setBusy(false); }
  }
  async function social(provider: "google" | "lovable") { setBusy(true); setMessage(""); try { const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + "/auth" }); if (result.error) setMessage("No se pudo iniciar sesión."); } catch { setMessage("No se pudo iniciar sesión."); } finally { setBusy(false); } }
  return <main className="min-h-screen bg-background px-4 py-8 text-foreground"><div className="mx-auto max-w-md"><Button variant="ghost" asChild className="mb-6 font-display text-2xl text-destructive"><Link to="/">Turop</Link></Button><h1 className="font-display text-3xl">{signup ? "Crea tu cuenta" : "Qué bueno verte"}</h1><div className="my-6 grid grid-cols-2 border-b border-border"><Button variant="ghost" onClick={() => { setSignup(true); setMessage(""); }} className={signup ? "border-b-2 border-primary rounded-none" : ""}>Crear cuenta</Button><Button variant="ghost" onClick={() => { setSignup(false); setMessage(""); }} className={!signup ? "border-b-2 border-primary rounded-none" : ""}>Iniciar sesión</Button></div><form onSubmit={submit} className="space-y-4">{signup && <ProfileFields value={form} onChange={setForm} />}<label className="block text-sm">Correo<input required className="inp mt-1" type="email" autoComplete="email" maxLength={255} value={email} onChange={e => setEmail(e.target.value)} /></label><label className="block text-sm">Contraseña de Turop<input required className="inp mt-1" type="password" autoComplete={signup ? "new-password" : "current-password"} minLength={8} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} /></label>{message && <p className="text-sm" role="status">{message}</p>}<Button disabled={busy} className="h-12 w-full">{busy ? "Un momento…" : signup ? "Crear mi cuenta" : "Entrar"}</Button></form><div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />o continúa con<span className="h-px flex-1 bg-border" /></div><div className="space-y-3"><Button onClick={() => social("google")} disabled={busy} className="google-auth-button h-11 w-full"><svg aria-hidden="true" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>Continuar con Google</Button><Button onClick={() => social("lovable")} disabled={busy} className="lovable-auth-button w-full">Continue with Lovable</Button></div></div></main>;
}