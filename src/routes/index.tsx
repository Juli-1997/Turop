import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Account, Cycle, SERVICES, daysLeft, dueSoon, load, nextRenewal, notifyDue, save } from "@/lib/accounts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Turop — Todas tus suscripciones en un solo pago" },
      { name: "description", content: "Vincula Netflix, Disney+, Prime Video y más, paga todo junto y recibe recordatorios antes del vencimiento." },
      { property: "og:title", content: "Turop — Tus suscripciones en un solo lugar" },
      { property: "og:description", content: "Vincula tus cuentas de entretenimiento y págalas juntas." },
    ],
  }),
  component: Index,
});

const empty = { service: "Netflix", email: "", password: "", plan: "", cycle: "mensual" as Cycle, price: "", renewal: "" };
const money = (n: number) => "$" + n.toLocaleString("es-CO");

function Index() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [form, setForm] = useState<typeof empty | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [paying, setPaying] = useState(false);
  const [msg, setMsg] = useState("");
  const [perm, setPerm] = useState("default");

  useEffect(() => {
    const a = load();
    setAccounts(a);
    if (typeof Notification !== "undefined") setPerm(Notification.permission);
    notifyDue(a);
    const t = setInterval(() => notifyDue(load()), 3600000);
    return () => clearInterval(t);
  }, []);

  const update = (a: Account[]) => { setAccounts(a); save(a); notifyDue(a); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    update([...accounts, { ...form, id: crypto.randomUUID(), price: Number(form.price) }]);
    setForm(null);
  };

  const toPay = accounts.filter((a) => selected.includes(a.id));
  const total = toPay.reduce((s, a) => s + a.price, 0);

  const pay = () => {
    setPaying(true);
    setTimeout(() => {
      update(accounts.map((a) => (selected.includes(a.id) ? { ...a, renewal: nextRenewal(a) } : a)));
      setMsg(`Pago de ${money(total)} realizado por ${toPay.length} cuenta(s).`);
      setSelected([]);
      setPaying(false);
    }, 1200);
  };

  const askPerm = async () => setPerm(await Notification.requestPermission());
  const due = dueSoon(accounts);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.3em] text-muted-foreground">Turop</p>
            <h1 className="font-display text-4xl sm:text-5xl">Tus suscripciones, un solo pago.</h1>
          </div>
          {perm !== "granted" && (
            <button onClick={askPerm} className="rounded-full border border-foreground/20 px-4 py-2 text-sm hover:bg-secondary">
              🔔 Activar recordatorios
            </button>
          )}
        </header>

        {due.length > 0 && (
          <div className="mt-6 rounded-2xl bg-accent p-4 text-sm">
            <strong>Próximos vencimientos:</strong>{" "}
            {due.map((a) => `${a.service} (${daysLeft(a.renewal) <= 0 ? "vencido/hoy" : daysLeft(a.renewal) + " días"})`).join(" · ")}
          </div>
        )}
        {msg && <div className="mt-4 rounded-2xl bg-primary p-4 text-sm text-primary-foreground" onClick={() => setMsg("")}>✓ {msg}</div>}

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => {
            const d = daysLeft(a.renewal);
            const on = selected.includes(a.id);
            return (
              <article key={a.id} className={`rounded-3xl bg-card p-5 shadow-sm ring-2 transition ${on ? "ring-primary" : "ring-transparent"}`}>
                <div className="flex items-start justify-between">
                  <h2 className="font-display text-2xl">{a.service}</h2>
                  <input type="checkbox" checked={on} aria-label={`Pagar ${a.service}`} className="size-5 accent-primary"
                    onChange={() => setSelected(on ? selected.filter((x) => x !== a.id) : [...selected, a.id])} />
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">{a.email}</p>
                <p className="text-sm text-muted-foreground">Contraseña: ••••••••</p>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-sm">{a.plan} · {a.cycle}</p>
                    <p className="font-display text-2xl">{money(a.price)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs ${d <= 7 ? "bg-destructive text-destructive-foreground" : "bg-secondary"}`}>
                    {d < 0 ? "Vencido" : d === 0 ? "Vence hoy" : `${d} días`}
                  </span>
                </div>
                <button onClick={() => update(accounts.filter((x) => x.id !== a.id))} className="mt-3 text-xs text-muted-foreground underline">Eliminar</button>
              </article>
            );
          })}
          <button onClick={() => setForm({ ...empty })}
            className="flex min-h-48 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-foreground/25 text-muted-foreground transition hover:bg-secondary">
            <span className="text-5xl">+</span>
            <span className="mt-2 text-sm">{accounts.length ? "Agregar otra cuenta" : "Agrega tu primera cuenta"}</span>
          </button>
        </section>

        {accounts.length > 0 && (
          <div className="sticky bottom-4 mt-8 flex flex-col gap-3 rounded-3xl bg-primary p-4 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelected(selected.length === accounts.length ? [] : accounts.map((a) => a.id))} className="text-sm underline">
                {selected.length === accounts.length ? "Quitar todas" : "Seleccionar todas"}
              </button>
              <span className="text-sm">{selected.length} seleccionada(s) · <strong className="font-display text-xl">{money(total)}</strong></span>
            </div>
            <button disabled={!selected.length || paying} onClick={pay}
              className="rounded-full bg-background px-6 py-3 font-medium text-foreground disabled:opacity-50">
              {paying ? "Procesando…" : "Pagar todo junto"}
            </button>
          </div>
        )}
      </div>

      {form && (
        <div className="fixed inset-0 z-10 flex items-end justify-center bg-foreground/40 sm:items-center" onClick={() => setForm(null)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full space-y-3 overflow-y-auto rounded-t-3xl bg-card p-6 sm:max-w-md sm:rounded-3xl">
            <h3 className="font-display text-2xl">Vincular cuenta</h3>
            <Field label="Servicio">
              <select className="inp" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
                {SERVICES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Correo"><input required type="email" className="inp" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Contraseña"><input required type="password" className="inp" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
            <Field label="Plan"><input required placeholder="Premium, Estándar…" className="inp" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Periodo">
                <select className="inp" value={form.cycle} onChange={(e) => setForm({ ...form, cycle: e.target.value as Cycle })}>
                  <option value="mensual">Mensual</option><option value="anual">Anual</option>
                </select>
              </Field>
              <Field label="Precio"><input required type="number" min="0" className="inp" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
            </div>
            <Field label="Próximo vencimiento"><input required type="date" className="inp" value={form.renewal} onChange={(e) => setForm({ ...form, renewal: e.target.value })} /></Field>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setForm(null)} className="flex-1 rounded-full border border-foreground/20 py-3">Cancelar</button>
              <button className="flex-1 rounded-full bg-primary py-3 text-primary-foreground">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm"><span className="mb-1 block text-muted-foreground">{label}</span>{children}</label>;
}
