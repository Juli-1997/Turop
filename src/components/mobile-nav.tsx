import { Link } from "@tanstack/react-router";
import { Clapperboard, Banknote, CirclePlus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileNav({ onPay, onAdd, profile = false }: { onPay?: () => void; onAdd?: () => void; profile?: boolean }) {
  return <nav aria-label="Navegación principal" className="mobile-nav fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-border bg-card sm:hidden">
    <Button asChild variant="ghost" className={`h-16 flex-col gap-1 rounded-none text-[11px] ${!profile ? "text-primary" : "text-muted-foreground"}`}><Link to="/"><Clapperboard />Cuentas</Link></Button>
    <Button variant="ghost" className="h-16 flex-col gap-1 rounded-none text-[11px] text-muted-foreground" asChild={!onPay} onClick={onPay}>{onPay ? <><Banknote />Pagar todo</> : <Link to="/" search={{ action: "pay" }}><Banknote />Pagar todo</Link>}</Button>
    <Button variant="ghost" className="h-16 flex-col gap-1 rounded-none text-[11px] text-muted-foreground" asChild={!onAdd} onClick={onAdd}>{onAdd ? <><CirclePlus />Vincular</> : <Link to="/" search={{ action: "add" }}><CirclePlus />Vincular</Link>}</Button>
    <Button asChild variant="ghost" className={`h-16 flex-col gap-1 rounded-none text-[11px] ${profile ? "text-primary" : "text-muted-foreground"}`}><Link to="/perfil"><UserRound />Perfil</Link></Button>
  </nav>;
}