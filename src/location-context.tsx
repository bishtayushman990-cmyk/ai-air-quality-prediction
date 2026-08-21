import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type LocationSource = "demo" | "manual" | "browser";
export type LocationStatus = "idle" | "loading" | "granted" | "denied" | "unavailable";
export type AirDataMode = "live" | "demo";
export type AirLocation = { id: string; name: string; area?: string; lat: number; lng: number; source: LocationSource };
export type SavedLocation = AirLocation & { label: string };

export const demoLocations: AirLocation[] = [
  { id: "new-delhi", name: "New Delhi", area: "Central Delhi", lat: 28.6139, lng: 77.209, source: "demo" },
  { id: "noida", name: "Noida", area: "Sector 62", lat: 28.6139, lng: 77.391, source: "manual" },
  { id: "mumbai", name: "Mumbai", area: "Bandra", lat: 19.076, lng: 72.8777, source: "manual" },
  { id: "bengaluru", name: "Bengaluru", area: "Indiranagar", lat: 12.9716, lng: 77.5946, source: "manual" },
  { id: "kolkata", name: "Kolkata", area: "Salt Lake", lat: 22.5726, lng: 88.3639, source: "manual" },
  { id: "lucknow", name: "Lucknow", area: "Gomti Nagar", lat: 26.8467, lng: 80.9462, source: "manual" },
];

type LocationContextValue = {
  active: AirLocation | null;
  status: LocationStatus;
  error: string | null;
  saved: SavedLocation[];
  setActive: (location: AirLocation) => void;
  requestBrowserLocation: () => Promise<boolean>;
  removeContext: () => void;
  saveLocation: (label: string) => void;
  removeSaved: (id: string) => void;
  dataMode: AirDataMode;
  setDataMode: (mode: AirDataMode) => void;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [active, setActiveState] = useState<AirLocation | null>(() => {
    try {
      const stored = sessionStorage.getItem("aerova-active-location");
      return stored ? JSON.parse(stored) : demoLocations[0];
    } catch { return demoLocations[0]; }
  });
  const [saved, setSaved] = useState<SavedLocation[]>(() => {
    try { return JSON.parse(sessionStorage.getItem("aerova-saved-locations") || "[]"); } catch { return []; }
  });
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [dataMode, setDataMode] = useState<AirDataMode>(() => (sessionStorage.getItem("aerova-data-mode") as AirDataMode) || "live");

  useEffect(() => {
    if (!active) { sessionStorage.removeItem("aerova-active-location"); return; }
    const persisted = active.source === "browser" ? { ...active, lat: Math.round(active.lat * 100) / 100, lng: Math.round(active.lng * 100) / 100 } : active;
    sessionStorage.setItem("aerova-active-location", JSON.stringify(persisted));
  }, [active]);
  useEffect(() => { sessionStorage.setItem("aerova-saved-locations", JSON.stringify(saved)); }, [saved]);
  useEffect(() => { sessionStorage.setItem("aerova-data-mode", dataMode); }, [dataMode]);

  const setActive = (location: AirLocation) => { setError(null); setActiveState(location); };
  const requestBrowserLocation = () => new Promise<boolean>((resolve) => {
    setStatus("loading"); setError(null);
    if (!window.isSecureContext) { setStatus("unavailable"); setError("Location access requires a secure HTTPS connection. Choose a place below instead."); resolve(false); return; }
    if (!navigator.geolocation) { setStatus("unavailable"); setError("This browser cannot provide location services. Check device settings or choose a place below."); resolve(false); return; }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const lat = coords.latitude;
        const lng = coords.longitude;
        try {
          const response = await fetch(`/api/location/reverse-geocode?latitude=${encodeURIComponent(lat.toFixed(5))}&longitude=${encodeURIComponent(lng.toFixed(5))}`);
          if (!response.ok) throw new Error("reverse-geocode");
          const place = await response.json() as { name: string; area: string; state: string; country: string };
          setActiveState({ id: "current-location", name: place.name || "Current location", area: [place.area, place.state, place.country].filter(Boolean).join(", ") || "Approximate location", lat, lng, source: "browser" });
        } catch {
          setActiveState({ id: "current-location", name: "Current location", area: "Approximate location · place name unavailable", lat, lng, source: "browser" });
          setError("Location detected, but the place name could not be resolved. AQI will still use your coordinates.");
        }
        setStatus("granted");
        resolve(true);
      },
      (reason) => {
        const denied = reason.code === 1;
        setStatus(denied ? "denied" : "unavailable");
        setError(denied ? "Location access denied. Allow location access in your browser or device settings, then try again." : reason.code === 3 ? "Location request timed out. Check that device location services are enabled and try again." : "Unable to determine your location. Check that location services are enabled and try again.");
        resolve(false);
      },
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 15_000 },
    );
  });
  const saveLocation = (label: string) => {
    if (!active || !label.trim()) return;
    setSaved((items) => [{ ...active, label: label.trim() }, ...items.filter((item) => item.id !== active.id)].slice(0, 6));
  };
  const removeSaved = (id: string) => setSaved((items) => items.filter((item) => item.id !== id));
  return <LocationContext.Provider value={{ active, status, error, saved, setActive, requestBrowserLocation, removeContext: () => { setActiveState(null); setStatus("idle"); }, saveLocation, removeSaved, dataMode, setDataMode }}>{children}</LocationContext.Provider>;
}

export function useLocationContext() {
  const value = useContext(LocationContext);
  if (!value) throw new Error("useLocationContext must be used within LocationProvider");
  return value;
}

export function useLocationSearch(query: string) {
  return useMemo(() => demoLocations.filter((item) => `${item.name} ${item.area}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6), [query]);
}

export function demoAqiFor(location: AirLocation) {
  const offsets: Record<string, number> = { "new-delhi": 0, noida: -8, mumbai: -42, bengaluru: -71, kolkata: -18, lucknow: 19 };
  return 178 + (offsets[location.id] ?? 0);
}