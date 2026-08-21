import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  Bell, Bot, Check, ChevronDown, CloudSun, Command, Gauge, History,
  LocateFixed, Map, Menu, Search, Settings, ShieldCheck, SlidersHorizontal, X, Zap
} from "lucide-react";
import { getGetAlertsQueryKey, getHealthCheckQueryKey, useAskAssistant, useGetAlerts, useHealthCheck } from "@workspace/api-client-react";
import { useLocationContext, useLocationSearch, type AirLocation } from "@/location-context";

export const demoCity = "New Delhi";

export function BrandLogo({ className = "h-10 w-10", priority = false }: { className?: string; priority?: boolean }) {
  return <img src="/aerova-logo.jpg" alt="AEROVA" className={`rounded-xl object-cover object-center ${className}`} loading={priority ? "eager" : "lazy"} />;
}

const navigation = [
  { href: "/my-air", label: "My Air", icon: Gauge },
  { href: "/forecast", label: "Forecast", icon: CloudSun },
  { href: "/map", label: "Pollution map", icon: Map },
  { href: "/history", label: "History", icon: History },
];
const intelligence = [
  { href: "/alerts", label: "Alert center", icon: Bell },
  { href: "/command", label: "City command", icon: Command },
];

export function useDemoCity() {
  return useLocationContext().active?.name ?? demoCity;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const { active, setActive, requestBrowserLocation, removeContext, dataMode, setDataMode } = useLocationContext();
  const [locationOpen, setLocationOpen] = useState(false);
  const city = active?.name ?? demoCity;
  const health = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), staleTime: 60_000 } });
  const alerts = useGetAlerts({ city }, { query: { queryKey: getGetAlertsQueryKey({ city }), staleTime: 60_000 } });
  const ask = useAskAssistant();

  const submitQuestion = () => {
    if (!question.trim() || ask.isPending) return;
    ask.mutate({ data: { question: question.trim(), city, mode: dataMode } });
    setQuestion("");
  };

  const navLink = (item: typeof navigation[number]) => {
    const Icon = item.icon;
    const active = location === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        data-testid={`link-${item.label.toLowerCase().replaceAll(" ", "-")}`}
        onClick={() => setMobileOpen(false)}
        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all ${active ? "bg-[hsl(var(--sidebar-accent))] text-white shadow-sm" : "text-[hsl(var(--sidebar-foreground)/.68)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-white"}`}
      >
        <Icon size={17} strokeWidth={active ? 2.3 : 1.8} />
        <span>{item.label}</span>
        {item.href === "/alerts" && Boolean(alerts.data?.unreadCount) && <span className="ml-auto rounded-full bg-[hsl(var(--accent))] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[hsl(var(--accent-foreground))]">{alerts.data?.unreadCount}</span>}
      </Link>
    );
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] px-4 py-5 transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-2">
          <Link href="/" data-testid="link-aerova-home" className="flex items-center gap-2.5">
            <BrandLogo className="h-10 w-10 border border-white/15" priority />
            <span className="text-[19px] font-extrabold tracking-[-.04em] text-white">AEROVA</span>
          </Link>
          <button className="text-white/50 lg:hidden" onClick={() => setMobileOpen(false)} data-testid="button-close-menu"><X size={18} /></button>
        </div>
        <div className="mt-10 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.4)]">Monitor</div>
        <nav className="mt-2 space-y-1">{navigation.map(navLink)}</nav>
        <div className="mt-7 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.4)]">Intelligence</div>
        <nav className="mt-2 space-y-1">{intelligence.map(navLink)}</nav>
        <div className="mt-auto space-y-1">
          <Link href="/sources" data-testid="link-data-sources" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-[hsl(var(--sidebar-foreground)/.68)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-white"><ShieldCheck size={17} /> Data & methods</Link>
          <Link href="/settings" data-testid="link-settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-[hsl(var(--sidebar-foreground)/.68)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-white"><Settings size={17} /> Settings</Link>
          <div className="mt-4 rounded-2xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent)/.55)] p-3">
            <div className="flex items-center gap-2 text-[11px] font-bold text-[hsl(var(--sidebar-foreground)/.75)]"><span className="size-2 rounded-full bg-[hsl(var(--sidebar-primary))] animate-pulse-soft" /> System status</div>
            <p className="mt-1.5 text-[11px] text-[hsl(var(--sidebar-foreground)/.45)]">{health.isError ? "API connection unavailable" : health.isLoading ? "Checking network…" : "All data services operational"}</p>
          </div>
        </div>
      </aside>
      {mobileOpen && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-[hsl(var(--foreground)/.35)] lg:hidden" onClick={() => setMobileOpen(false)} data-testid="button-overlay-menu" />}
      <div className="lg:pl-[250px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border/70 bg-background/90 px-5 backdrop-blur-xl lg:px-9">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 hover:bg-muted lg:hidden" onClick={() => setMobileOpen(true)} data-testid="button-open-menu"><Menu size={20} /></button>
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><span className="font-mono text-[10px] uppercase tracking-[.16em]">My Air</span><span className="text-border">/</span><span>{active?.name ?? "No location selected"}</span></div>
          </div>
          <div className="flex items-center gap-2.5">
             <button onClick={() => setLocationOpen(true)} className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-foreground md:flex" data-testid="button-city-selector"><Search size={14} /> {active?.name ?? "Choose location"}<ChevronDown size={13} /></button>
             <button onClick={() => setDataMode(dataMode === "live" ? "demo" : "live")} className={`flex items-center gap-1.5 rounded-xl border px-2 py-2 text-[10px] font-bold uppercase tracking-wider sm:px-3 ${dataMode === "live" ? "border-primary/30 bg-primary/5 text-primary" : "border-[hsl(var(--accent)/.35)] bg-[hsl(var(--accent)/.1)] text-[hsl(30 70% 35%)]"}`} data-testid="button-toggle-data-mode"><span className={`size-1.5 rounded-full ${dataMode === "live" ? "bg-primary animate-pulse-soft" : "bg-[hsl(var(--accent))]"}`} /><span className="hidden sm:inline">{dataMode === "live" ? "Live data" : "Demo mode"}</span><span className="sm:hidden">{dataMode === "live" ? "LIVE" : "DEMO"}</span></button>
            <button className="relative grid size-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-primary/40 hover:text-foreground" onClick={() => setAssistantOpen(true)} data-testid="button-open-assistant"><Bot size={17} /><span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[hsl(var(--accent))]" /></button>
            <Link href="/settings" data-testid="link-header-settings" className="grid size-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-primary/40 hover:text-foreground"><SlidersHorizontal size={16} /></Link>
          </div>
        </header>
        <main className="mx-auto max-w-[1536px] px-5 py-7 lg:px-9 lg:py-9">{children}</main>
      </div>
      <button onClick={() => setAssistantOpen(true)} data-testid="button-floating-assistant" className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-4 py-3 text-xs font-bold text-white shadow-lg shadow-[hsl(var(--primary)/.22)] transition hover:-translate-y-0.5 hover:bg-[hsl(var(--primary)/.9)]"><Bot size={16} /> Ask AEROVA</button>
      {assistantOpen && <div className="fixed inset-0 z-50 flex items-end justify-end bg-[hsl(var(--foreground)/.16)] p-4 sm:items-end sm:p-7" onClick={() => setAssistantOpen(false)}>
        <div className="w-full max-w-[390px] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl animate-rise-in" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-border bg-[hsl(var(--sidebar))] px-5 py-4 text-white">
            <div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]"><Bot size={17} /></span><div><p className="text-sm font-bold">AEROVA AI</p><p className="text-[10px] text-white/50">Explain the air around you</p></div></div>
            <button onClick={() => setAssistantOpen(false)} data-testid="button-close-assistant" className="text-white/60 hover:text-white"><X size={18} /></button>
          </div>
          <div className="min-h-[170px] space-y-3 p-5">
            {!ask.data && !ask.isPending && <><div className="rounded-2xl bg-secondary p-3.5 text-xs leading-relaxed text-secondary-foreground">Ask about today’s commute, a hotspot, or what this forecast means for your family.</div><div className="flex flex-wrap gap-2"><button onClick={() => setQuestion("Is it safe to exercise outside this evening?")} data-testid="button-suggest-exercise" className="rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary">Exercise tonight?</button><button onClick={() => setQuestion("What is driving today’s AQI?")} data-testid="button-suggest-drivers" className="rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary">What’s driving it?</button></div></>}
            {ask.isPending && <div className="space-y-2"><div className="h-3 w-4/5 animate-pulse rounded bg-muted" /><div className="h-3 w-3/5 animate-pulse rounded bg-muted" /><div className="h-3 w-2/5 animate-pulse rounded bg-muted" /></div>}
            {ask.data && <div className="rounded-2xl bg-secondary p-4 text-xs leading-relaxed text-secondary-foreground"><p>{ask.data.answer}</p><p className="mt-3 border-t border-border/70 pt-3 text-[10px] text-muted-foreground">{ask.data.context}</p></div>}
            {ask.isError && <p className="text-xs text-destructive">The assistant is temporarily unavailable. Try again in a moment.</p>}
          </div>
            <div className="border-t border-border p-4"><div className="flex items-center gap-2 rounded-xl border border-border bg-background p-1.5 focus-within:border-primary"><input value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); submitQuestion(); } }} placeholder="Ask anything about the air…" data-testid="input-assistant-question" className="min-w-0 flex-1 bg-transparent px-2 text-xs outline-none placeholder:text-muted-foreground" /><button onClick={submitQuestion} data-testid="button-send-assistant" className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40" disabled={!question.trim() || ask.isPending}><Zap size={14} /></button></div><p className="mt-2 px-1 text-[10px] text-muted-foreground">{city} · {dataMode === "live" ? "Live context when available" : "Demo context"} · Advisory, not medical guidance.</p></div>
      </div>
      {locationOpen && <LocationPicker onClose={() => setLocationOpen(false)} onSelect={(item) => { setActive(item); setLocationOpen(false); }} onUseCurrent={requestBrowserLocation} onRemove={() => { removeContext(); setLocationOpen(false); }} />}
      </div>}
    </div>
  );
}

function LocationPicker({ onClose, onSelect, onUseCurrent, onRemove }: { onClose: () => void; onSelect: (item: AirLocation) => void; onUseCurrent: () => Promise<boolean>; onRemove: () => void }) {
  const [query, setQuery] = useState("");
  const { active, status, error, saved } = useLocationContext();
  const results = useLocationSearch(query);
  return <div className="fixed inset-0 z-[60] flex items-start justify-center bg-[hsl(var(--foreground)/.28)] p-4 pt-[12vh]" onClick={onClose}><div className="w-full max-w-lg rounded-3xl border border-border bg-card p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
    <div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-primary">Personal context</p><h2 className="mt-1 text-xl font-extrabold">Where should we read the air?</h2></div><button onClick={onClose}><X size={18} /></button></div>
    <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-background px-3"><Search size={15} className="text-muted-foreground" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search city, area, or locality" className="w-full bg-transparent py-3 text-sm outline-none" data-testid="input-location-search" /></div>
    <button onClick={async () => { const success = await onUseCurrent(); if (success) onClose(); }} disabled={status === "loading"} className="mt-3 flex w-full items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-3 py-3 text-left text-xs font-bold text-primary disabled:cursor-wait disabled:opacity-60" data-testid="button-request-location"><LocateFixed size={15} /> {status === "loading" ? "Requesting location…" : "Use My Current Location"} <span className="ml-auto font-normal text-muted-foreground">{status === "loading" ? "Waiting for device…" : "Approximate · stays on this device"}</span></button>
    {status === "granted" && active?.source === "browser" && <p className="mt-2 rounded-lg bg-primary/10 px-3 py-2 text-[11px] text-foreground">Location detected. The dashboard will use this area’s coordinates for live air quality.</p>}
    {error && <p className="mt-2 rounded-lg bg-[hsl(var(--accent)/.12)] px-3 py-2 text-[11px] text-foreground">{error} <button onClick={async () => { await onUseCurrent(); }} className="ml-1 font-bold text-primary underline">Try again</button></p>}
    <div className="mt-4 space-y-1">{results.map((item) => <button key={item.id} onClick={() => onSelect(item)} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left hover:bg-muted" data-testid={`button-location-${item.id}`}><span><b className="block text-sm">{item.name}</b><small className="text-[11px] text-muted-foreground">{item.area} · demo location</small></span>{active?.id === item.id && <Check size={15} className="text-primary" />}</button>)}</div>
    {saved.length > 0 && <div className="mt-4 border-t border-border pt-4"><p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Saved places</p>{saved.map((item) => <button key={item.id} onClick={() => onSelect(item)} className="mr-2 rounded-full border border-border px-3 py-1.5 text-[11px] font-bold hover:border-primary/40">{item.label} · {item.name}</button>)}</div>}
    <div className="mt-5 flex items-center justify-between border-t border-border pt-4"><p className="max-w-[310px] text-[10px] leading-relaxed text-muted-foreground">AEROVA uses an approximate area only. Exact street addresses and public coordinates are never shown or stored.</p><button onClick={onRemove} className="text-[11px] font-bold text-destructive">Remove context</button></div>
  </div></div>;
}

export function SectionHeading({ eyebrow, title, detail, action }: { eyebrow?: string; title: string; detail?: string; action?: ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div>{eyebrow && <p className="mb-1.5 font-mono text-[10px] font-medium uppercase tracking-[.18em] text-primary">{eyebrow}</p>}<h2 className="text-xl font-extrabold tracking-[-.04em] text-foreground lg:text-2xl">{title}</h2>{detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}</div>{action}</div>;
}

export function DemoBadge({ label = "Demo data" }: { label?: string }) { return <span className="inline-flex items-center rounded-full border border-[hsl(var(--accent)/.35)] bg-[hsl(var(--accent)/.12)] px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-[.1em] text-[hsl(30 70% 35%)]">{label}</span>; }

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) { return <section className={`rounded-2xl border border-border bg-card shadow-sm ${className}`}>{children}</section>; }

export function LoadingCard({ className = "h-40" }: { className?: string }) { return <div className={`animate-pulse rounded-2xl border border-border bg-card p-5 ${className}`}><div className="h-3 w-24 rounded bg-muted" /><div className="mt-4 h-7 w-2/5 rounded bg-muted" /><div className="mt-5 h-2 w-full rounded bg-muted" /></div>; }

export function QueryNotice({ message = "Live data is taking longer than usual. Demo context is shown where available." }: { message?: string }) { return <div className="rounded-xl border border-[hsl(var(--accent)/.3)] bg-[hsl(var(--accent)/.08)] px-4 py-3 text-xs text-foreground"><span className="font-bold">Connection note · </span>{message}</div>; }
