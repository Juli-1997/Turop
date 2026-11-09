export type Cycle = "mensual" | "anual";
export type Account = {
  id: string;
  service: string;
  email: string;
  password: string;
  plan: string;
  cycle: Cycle;
  price: number;
  renewal: string; // YYYY-MM-DD
};

export const SERVICES = ["Netflix", "Disney+", "Prime Video", "Max", "Spotify", "Apple TV+", "YouTube Premium", "Paramount+", "Otro"];
const KEY = "streampay.accounts";
const NOTIFIED = "streampay.notified";

export const load = (): Account[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
};
export const save = (a: Account[]) => localStorage.setItem(KEY, JSON.stringify(a));

export const daysLeft = (renewal: string, now = new Date()) => {
  const r = new Date(renewal + "T00:00:00");
  const t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((r.getTime() - t.getTime()) / 86400000);
};

/** Advance renewal one period from the later of today or current renewal. */
export const nextRenewal = (a: Account, now = new Date()) => {
  const base = new Date(a.renewal + "T00:00:00");
  const start = base < now ? new Date(now.getFullYear(), now.getMonth(), now.getDate()) : base;
  if (a.cycle === "anual") start.setFullYear(start.getFullYear() + 1);
  else start.setMonth(start.getMonth() + 1);
  return start.toISOString().slice(0, 10);
};

export const dueSoon = (a: Account[]) => a.filter((x) => { const d = daysLeft(x.renewal); return d <= 7; });

export function notifyDue(accounts: Account[]) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const sent: string[] = JSON.parse(localStorage.getItem(NOTIFIED) || "[]");
  for (const a of dueSoon(accounts)) {
    const k = a.id + a.renewal;
    if (sent.includes(k)) continue;
    const d = daysLeft(a.renewal);
    new Notification(`${a.service} vence ${d <= 0 ? "hoy" : `en ${d} días`}`, {
      body: `Plan ${a.plan} (${a.cycle}) · $${a.price.toLocaleString()} — págalo desde StreamPay.`,
    });
    sent.push(k);
  }
  localStorage.setItem(NOTIFIED, JSON.stringify(sent));
}
