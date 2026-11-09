import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, LogOut, UserRound, ShieldCheck } from "lucide-react";
import { getProfile, updateProfile } from "@/lib/profile.functions";
import { COUNTRIES, profileSchema } from "@/lib/profile";
import { ProfileFields, profilePayload, type ProfileForm } from "@/components/profile-fields";
import { MobileNav } from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const options = queryOptions({ queryKey: ["profile"], queryFn: () => getProfile() });
export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({ meta: [{ title: "Mi perfil — Turop" }, { name: "description", content: "Tu información personal y cuenta bancaria en Turop." }, { property: "og:title", content: "Mi perfil — Turop" }, { property: "og:description", content: "Gestiona tu perfil personal de Turop." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(options),
  component: Profile,
});
function Profile() {
  const { data } = useSuspenseQuery(options);
  const dial = COUNTRIES.find(c => c.code === data.country)?.dial ?? "+57";
  const [form, setForm] = useState<ProfileForm>({ name: data.name, country: data.country, mobile: data.phone.slice(dial.length), bank_account: data.bank_account });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const save = useServerFn(updateProfile);
  const client = useQueryClient();
  const navigate = useNavigate();
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMessage("");
    const result = profileSchema.safeParse(profilePayload(form));
    if (!result.success) { setMessage(result.error.issues[0]?.message ?? "Revisa los datos."); return; }
    setBusy(true);
    try { await save({ data: result.data }); await client.invalidateQueries({ queryKey: ["profile"] }); setMessage("Tu perfil se guardó."); }
    catch { setMessage("No se pudo guardar. Inténtalo de nuevo."); }
    finally { setBusy(false); }
  }
  async function logout() { await client.cancelQueries(); client.clear(); await supabase.auth.signOut(); await navigate({ to: "/auth", replace: true }); }
  return <main className="min-h-screen bg-background px-4 pb-28 pt-6 text-foreground sm:py-10"><div className="mx-auto max-w-lg">
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border pb-5"><Button asChild variant="ghost" className="w-fit"><Link to="/"><ArrowLeft />Turop</Link></Button><Button onClick={logout} variant="ghost"><LogOut />Salir</Button></header>
    <div className="mb-8 mt-8 flex items-center gap-4"><div className="grid size-14 shrink-0 place-items-center rounded-full bg-secondary"><UserRound /></div><div className="min-w-0"><h1 className="font-display text-3xl">Mi perfil</h1><p className="truncate text-sm text-muted-foreground">{data.email}</p></div></div>
    <form onSubmit={submit} className="space-y-4"><ProfileFields value={form} onChange={setForm} /><label className="block text-sm">Correo<input className="inp mt-1" type="email" value={data.email} disabled /></label><p className="flex items-start gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4 shrink-0" />Registrar la cuenta bancaria no autoriza cobros.</p>{message && <p role="status" className="text-sm">{message}</p>}<Button className="h-12 w-full" disabled={busy}>{busy ? "Guardando…" : "Guardar cambios"}</Button></form>
  </div><MobileNav profile /></main>;
}