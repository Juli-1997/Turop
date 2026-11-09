import { COUNTRIES } from "@/lib/profile";

export type ProfileForm = { name: string; country: string; mobile: string; bank_account: string };
export const initialProfile: ProfileForm = { name: "", country: "CO", mobile: "", bank_account: "" };
export function ProfileFields({ value, onChange }: { value: ProfileForm; onChange: (v: ProfileForm) => void }) {
  const country = COUNTRIES.find(c => c.code === value.country) ?? COUNTRIES[0];
  return <>
    <label className="block text-sm">Nombre completo<input className="inp mt-1" autoComplete="name" required minLength={2} maxLength={100} value={value.name} onChange={e => onChange({ ...value, name: e.target.value })} /></label>
    <label className="block text-sm">País<select className="inp mt-1" value={value.country} onChange={e => onChange({ ...value, country: e.target.value })}>{COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}</select></label>
    <label className="block text-sm">Celular<div className="mt-1 grid grid-cols-[80px_minmax(0,1fr)] gap-2"><span className="inp flex items-center justify-center bg-accent font-semibold" aria-label="Indicativo del país">{country?.dial}</span><input className="inp min-w-0" type="tel" autoComplete="tel-national" inputMode="numeric" required maxLength={14} value={value.mobile} onChange={e => onChange({ ...value, mobile: e.target.value.replace(/\D/g, "") })} /></div></label>
    <label className="block text-sm">Número de cuenta bancaria<input className="inp mt-1" type="password" inputMode="numeric" autoComplete="off" required minLength={4} maxLength={34} value={value.bank_account} onChange={e => onChange({ ...value, bank_account: e.target.value.replace(/\D/g, "") })} /></label>
  </>;
}
export function profilePayload(form: ProfileForm) {
  return { name: form.name, country: form.country, phone: (COUNTRIES.find(c => c.code === form.country)?.dial ?? "") + form.mobile, bank_account: form.bank_account };
}