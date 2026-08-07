"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  NavigationArrow,
  MagnifyingGlass,
  Buildings,
  AirplaneTakeoff,
  Train,
  MapTrifold,
  Sparkle,
  X,
  ArrowRight,
  Compass,
} from "@phosphor-icons/react";

interface Location {
  lat: number;
  lng: number;
  displayName: string;
}

interface NearbyPOI {
  id: number;
  lat: number;
  lng: number;
  name: string;
  type: "hotel" | "airport" | "station" | "attraction";
  tags?: Record<string, string>;
}

interface TravelMapProps {
  onGoalGenerated?: (goal: string, budget: number) => void;
  onOriginChange?: (cityName: string) => void;
  onDestinationChange?: (cityName: string, lat: number, lng: number) => void;
}

async function nominatimSearch(query: string): Promise<Location[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
    { headers: { "Accept-Language": "en" } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((item: any) => ({
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    displayName: item.display_name,
  }));
}

async function nominatimReverse(lat: number, lng: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    { headers: { "Accept-Language": "en" } }
  );
  if (!res.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  const data = await res.json();
  return data.display_name ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

async function overpassQuery(lat: number, lng: number, type: "hotel" | "airport" | "station" | "attraction"): Promise<NearbyPOI[]> {
  const queries: Record<string, string> = {
    hotel: `node["tourism"~"hotel|hostel|guest_house"](around:5000,${lat},${lng});`,
    airport: `node["aeroway"="aerodrome"](around:50000,${lat},${lng});`,
    station: `node["railway"="station"](around:10000,${lat},${lng});`,
    attraction: `node["tourism"~"museum|attraction|viewpoint"](around:5000,${lat},${lng});`,
  };

  const overpassQL = `[out:json][timeout:15];(${queries[type]});out;`;
  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(overpassQL)}`,
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.elements ?? []).slice(0, 8).map((el: any) => ({
      id: el.id,
      lat: el.lat,
      lng: el.lon,
      name: el.tags?.name ?? el.tags?.["name:en"] ?? "Unknown",
      type,
      tags: el.tags,
    }));
  } catch {
    return [];
  }
}

// LeafletMap is loaded dynamically to avoid SSR issues
function LeafletMapInner({
  pickup,
  drop,
  pois,
  onPickupSet,
  onDropSet,
}: {
  pickup: Location | null;
  drop: Location | null;
  pois: NearbyPOI[];
  onPickupSet: (loc: Location) => void;
  onDropSet: (loc: Location) => void;
}) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const pickupMarkerRef = useRef<any>(null);
  const dropMarkerRef = useRef<any>(null);
  const arcLayerRef = useRef<any>(null);
  const poiMarkersRef = useRef<any[]>([]);
  const [clickMode, setClickMode] = useState<"pickup" | "drop">("pickup");
  // Ref so the Leaflet click handler always reads the latest mode without stale closures
  const clickModeRef = useRef<"pickup" | "drop">("pickup");

  const isInitializingRef = useRef(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || isInitializingRef.current || (mapContainerRef.current as any)?._leaflet_id) return;
    isInitializingRef.current = true;

    import("leaflet").then((L) => {
      if (!mapContainerRef.current || mapRef.current || (mapContainerRef.current as any)?._leaflet_id) {
        isInitializingRef.current = false;
        return;
      }

      // Fix default icon paths for Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapContainerRef.current, {
        center: [20, 78], // Default: center of India
        zoom: 4,
        zoomControl: true,
      });

      // CartoDB Dark Matter tiles (dark, no API key required)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        const displayName = await nominatimReverse(lat, lng);
        const loc: Location = { lat, lng, displayName };
        // Always reads from ref — never stale
        if (clickModeRef.current === "pickup") {
          onPickupSet(loc);
        } else {
          onDropSet(loc);
        }
      });

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (mapContainerRef.current) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }
      isInitializingRef.current = false;
    };
  }, []);

  // Keep the ref in sync whenever state changes
  useEffect(() => {
    clickModeRef.current = clickMode;
  }, [clickMode]);


  // Pickup marker
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.remove();
        pickupMarkerRef.current = null;
      }
      if (pickup) {
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:28px;height:28px;background:#ff5228;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(255,82,40,0.5)"></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });
        const marker = L.marker([pickup.lat, pickup.lng], { icon, draggable: true })
          .addTo(mapRef.current)
          .bindPopup(`<b>📍 Origin</b><br/>${pickup.displayName.split(",").slice(0, 3).join(",")}`);
        marker.on("dragend", async (e: any) => {
          const { lat, lng } = e.target.getLatLng();
          const displayName = await nominatimReverse(lat, lng);
          onPickupSet({ lat, lng, displayName });
        });
        pickupMarkerRef.current = marker;
        mapRef.current.setView([pickup.lat, pickup.lng], 10);
      }
    });
  }, [pickup]);

  // Drop marker
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      if (dropMarkerRef.current) {
        dropMarkerRef.current.remove();
        dropMarkerRef.current = null;
      }
      if (drop) {
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:28px;height:28px;background:#22c55e;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(34,197,94,0.5)"></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });
        const marker = L.marker([drop.lat, drop.lng], { icon, draggable: true })
          .addTo(mapRef.current)
          .bindPopup(`<b>🏁 Destination</b><br/>${drop.displayName.split(",").slice(0, 3).join(",")}`);
        marker.on("dragend", async (e: any) => {
          const { lat, lng } = e.target.getLatLng();
          const displayName = await nominatimReverse(lat, lng);
          onDropSet({ lat, lng, displayName });
        });
        dropMarkerRef.current = marker;
      }
    });
  }, [drop]);

  // Flight arc between pickup and drop
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      if (arcLayerRef.current) {
        arcLayerRef.current.remove();
        arcLayerRef.current = null;
      }
      if (pickup && drop) {
        // Draw great circle arc approximation using intermediate points
        const points: [number, number][] = [];
        const steps = 40;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const lat = pickup.lat + (drop.lat - pickup.lat) * t;
          const lng = pickup.lng + (drop.lng - pickup.lng) * t;
          // Add slight curve (arc effect)
          const arcOffset = Math.sin(Math.PI * t) * 3;
          points.push([lat + arcOffset, lng]);
        }

        arcLayerRef.current = L.polyline(points, {
          color: "#ff5228",
          weight: 2,
          opacity: 0.7,
          dashArray: "8, 5",
        }).addTo(mapRef.current);

        // Fit map to show both markers
        const bounds = L.latLngBounds([pickup.lat, pickup.lng], [drop.lat, drop.lng]);
        mapRef.current.fitBounds(bounds, { padding: [40, 40] });
      }
    });
  }, [pickup, drop]);

  // POI markers
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      poiMarkersRef.current.forEach((m) => m.remove());
      poiMarkersRef.current = [];

      const colorMap: Record<string, string> = {
        hotel: "#f59e0b",
        airport: "#60a5fa",
        station: "#a78bfa",
        attraction: "#34d399",
      };
      const emojiMap: Record<string, string> = {
        hotel: "🏨",
        airport: "✈️",
        station: "🚉",
        attraction: "🏛️",
      };

      pois.forEach((poi) => {
        if (!poi.lat || !poi.lng || poi.name === "Unknown") return;
        const color = colorMap[poi.type] ?? "#888";
        const emoji = emojiMap[poi.type] ?? "📍";
        const icon = L.divIcon({
          className: "",
          html: `<div style="background:${color};color:black;border-radius:8px;padding:2px 6px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.4)">${emoji} ${poi.name.slice(0, 14)}</div>`,
          iconAnchor: [0, 0],
        });
        const marker = L.marker([poi.lat, poi.lng], { icon })
          .addTo(mapRef.current)
          .bindPopup(`<b>${emoji} ${poi.name}</b><br/>Type: ${poi.type}`);
        poiMarkersRef.current.push(marker);
      });
    });
  }, [pois]);

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Click mode toggle */}
      <div className="absolute top-3 left-3 z-[1000] flex gap-2 font-poppins text-[11px]">
        <button
          onClick={() => setClickMode("pickup")}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-semibold transition-all shadow-md ${
            clickMode === "pickup"
              ? "bg-[#ff5228] border-[#ff5228] text-white"
              : "border-white/20 bg-black/50 text-white/70 hover:text-white"
          }`}
        >
          <span>🔴</span> Set Origin
        </button>
        <button
          onClick={() => setClickMode("drop")}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-semibold transition-all shadow-md ${
            clickMode === "drop"
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-white/20 bg-black/50 text-white/70 hover:text-white"
          }`}
        >
          <span>🟢</span> Set Destination
        </button>
      </div>
      <div ref={mapContainerRef} className="w-full flex-1 rounded-2xl" />
    </div>
  );
}

export function TravelMapPlanner({ onGoalGenerated, onOriginChange, onDestinationChange }: TravelMapProps) {
  const [pickup, setPickup] = useState<Location | null>(null);
  const [drop, setDrop] = useState<Location | null>(null);
  const [pois, setPois] = useState<NearbyPOI[]>([]);
  const [loadingPois, setLoadingPois] = useState(false);
  const [searchOrigin, setSearchOrigin] = useState("");
  const [searchDest, setSearchDest] = useState("");
  const [originResults, setOriginResults] = useState<Location[]>([]);
  const [destResults, setDestResults] = useState<Location[]>([]);
  const [loadingGps, setLoadingGps] = useState(false);
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null);
  const [selectedPois, setSelectedPois] = useState<NearbyPOI[]>([]);
  const originDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dynamically load Leaflet CSS and Map component (no SSR)
  useEffect(() => {
    // Load Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    // Set map component
    setMapComponent(() => LeafletMapInner);
    return () => { document.head.removeChild(link); };
  }, []);

  // Fetch POIs when drop location changes + notify parent
  useEffect(() => {
    if (!drop) return;
    // Notify parent with destination info for weather panel
    onDestinationChange?.(drop.displayName, drop.lat, drop.lng);
    setLoadingPois(true);
    setPois([]);
    Promise.all([
      overpassQuery(drop.lat, drop.lng, "hotel"),
      overpassQuery(drop.lat, drop.lng, "airport"),
      overpassQuery(drop.lat, drop.lng, "attraction"),
    ]).then(([hotels, airports, attractions]) => {
      setPois([...hotels, ...airports, ...attractions]);
      setLoadingPois(false);
    });
  }, [drop]);

  // Origin search debounce
  useEffect(() => {
    if (!searchOrigin.trim() || searchOrigin.length < 3) { setOriginResults([]); return; }
    if (originDebounceRef.current) clearTimeout(originDebounceRef.current);
    originDebounceRef.current = setTimeout(async () => {
      const results = await nominatimSearch(searchOrigin);
      setOriginResults(results);
    }, 500);
  }, [searchOrigin]);

  // Destination search debounce
  useEffect(() => {
    if (!searchDest.trim() || searchDest.length < 3) { setDestResults([]); return; }
    if (destDebounceRef.current) clearTimeout(destDebounceRef.current);
    destDebounceRef.current = setTimeout(async () => {
      const results = await nominatimSearch(searchDest);
      setDestResults(results);
    }, 500);
  }, [searchDest]);

  function handleUseLocation() {
    if (!navigator.geolocation) return;
    setLoadingGps(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const displayName = await nominatimReverse(coords.latitude, coords.longitude);
      setPickup({ lat: coords.latitude, lng: coords.longitude, displayName });
      setSearchOrigin(displayName.split(",").slice(0, 2).join(","));
      onOriginChange?.(displayName);
      setLoadingGps(false);
    }, () => setLoadingGps(false));
  }

  function handleGenerateGoal() {
    if (!pickup || !drop) return;
    const hotelPoi = selectedPois.find((p) => p.type === "hotel");
    const attrPoi = selectedPois.find((p) => p.type === "attraction");
    const airportPoi = selectedPois.find((p) => p.type === "airport");

    const originCity = pickup.displayName.split(",").slice(0, 2).join(",").trim();
    const destCity = drop.displayName.split(",").slice(0, 2).join(",").trim();

    let goal = `Book a trip from ${originCity} to ${destCity}. Include roundtrip flights`;
    if (airportPoi) goal += ` (nearest airport: ${airportPoi.name})`;
    if (hotelPoi) goal += `, 5-night stay at ${hotelPoi.name}`;
    else goal += `, hotel accommodation`;
    if (attrPoi) goal += `, entry to ${attrPoi.name}`;
    goal += `. Include parametric flight delay insurance and Algorand smart escrow payment.`;

    onGoalGenerated?.(goal, 1.2);
  }

  const poiGroups = {
    hotel: pois.filter((p) => p.type === "hotel").slice(0, 4),
    airport: pois.filter((p) => p.type === "airport").slice(0, 2),
    attraction: pois.filter((p) => p.type === "attraction").slice(0, 4),
  };

  const typeColors: Record<string, string> = {
    hotel: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    airport: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    attraction: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  };
  const typeEmoji: Record<string, string> = {
    hotel: "🏨",
    airport: "✈️",
    attraction: "🏛️",
  };

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--color-cta)]/10 text-[var(--color-cta)] border border-[var(--color-cta)]/20">
            <MapTrifold size={20} weight="fill" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-[var(--color-headline)]">
              Interactive Travel Planner
            </h3>
            <p className="font-poppins text-[11px] text-[var(--color-muted)]">
              Set origin & destination on map · Discover hotels, airports &amp; attractions
            </p>
          </div>
        </div>
        <span className="font-inter rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
          OpenStreetMap · Free · No API Key
        </span>
      </div>

      {/* Search Controls */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr]">
        {/* Origin */}
        <div className="relative">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-black/20 px-3 py-2.5">
            <span className="text-base">🔴</span>
            <input
              value={searchOrigin}
              onChange={(e) => setSearchOrigin(e.target.value)}
              placeholder="Origin city or address..."
              className="font-poppins min-w-0 flex-1 bg-transparent text-xs text-[var(--color-headline)] placeholder:text-[var(--color-muted)] focus:outline-none"
            />
            <button
              onClick={handleUseLocation}
              title="Use my location"
              className="shrink-0 rounded-lg bg-[var(--color-cta)]/10 p-1.5 text-[var(--color-cta)] transition-colors hover:bg-[var(--color-cta)]/20"
            >
              {loadingGps ? (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-[var(--color-cta)] border-t-transparent animate-spin block" />
              ) : (
                <NavigationArrow size={14} weight="fill" />
              )}
            </button>
          </div>
          {originResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-[2000] mt-1 rounded-xl border border-[var(--color-border)] bg-[#0d0b09] shadow-xl overflow-hidden">
              {originResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPickup(r);
                    setSearchOrigin(r.displayName.split(",").slice(0, 2).join(","));
                    setOriginResults([]);
                  }}
                  className="font-poppins flex w-full items-start gap-2 px-3 py-2.5 text-left text-xs text-[var(--color-body)] hover:bg-white/[0.05] transition-colors"
                >
                  <MapPin size={12} className="mt-0.5 shrink-0 text-[var(--color-cta)]" />
                  <span className="truncate">{r.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center text-[var(--color-muted)]">
          <ArrowRight size={18} />
        </div>

        {/* Destination */}
        <div className="relative">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-black/20 px-3 py-2.5">
            <span className="text-base">🟢</span>
            <input
              value={searchDest}
              onChange={(e) => setSearchDest(e.target.value)}
              placeholder="Destination city or address..."
              className="font-poppins min-w-0 flex-1 bg-transparent text-xs text-[var(--color-headline)] placeholder:text-[var(--color-muted)] focus:outline-none"
            />
            <MagnifyingGlass size={14} className="shrink-0 text-[var(--color-muted)]" />
          </div>
          {destResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-[2000] mt-1 rounded-xl border border-[var(--color-border)] bg-[#0d0b09] shadow-xl overflow-hidden">
              {destResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDrop(r);
                    setSearchDest(r.displayName.split(",").slice(0, 2).join(","));
                    setDestResults([]);
                  }}
                  className="font-poppins flex w-full items-start gap-2 px-3 py-2.5 text-left text-xs text-[var(--color-body)] hover:bg-white/[0.05] transition-colors"
                >
                  <MapPin size={12} className="mt-0.5 shrink-0 text-emerald-400" />
                  <span className="truncate">{r.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[380px] overflow-hidden rounded-2xl border border-[var(--color-border)]">
        {MapComponent ? (
          <MapComponent
            pickup={pickup}
            drop={drop}
            pois={pois}
            onPickupSet={setPickup}
            onDropSet={setDrop}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-black/30 text-[var(--color-muted)] text-sm font-poppins">
            <span className="h-5 w-5 rounded-full border-2 border-[var(--color-cta)] border-t-transparent animate-spin mr-2" />
            Loading map...
          </div>
        )}
      </div>

      {/* Status strip */}
      {(pickup || drop) && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-border)]/60 bg-black/20 px-4 py-2.5 font-poppins text-[11px]">
          {pickup && (
            <span className="flex items-center gap-1.5 text-[var(--color-muted)]">
              🔴 <span className="font-semibold text-[var(--color-headline)]">{pickup.displayName.split(",").slice(0, 2).join(",")}</span>
            </span>
          )}
          {pickup && drop && <span className="text-[var(--color-muted)]">────────</span>}
          {drop && (
            <span className="flex items-center gap-1.5 text-[var(--color-muted)]">
              🟢 <span className="font-semibold text-[var(--color-headline)]">{drop.displayName.split(",").slice(0, 2).join(",")}</span>
            </span>
          )}
          {loadingPois && (
            <span className="ml-auto flex items-center gap-1.5 text-[var(--color-muted)]">
              <span className="h-3 w-3 rounded-full border-2 border-[var(--color-cta)] border-t-transparent animate-spin" />
              Discovering nearby places...
            </span>
          )}
        </div>
      )}

      {/* Nearby POI Discovery Panels */}
      {pois.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="font-poppins text-xs font-semibold text-[var(--color-headline)]">
            Nearby Places at Destination <span className="text-[var(--color-muted)] font-normal">— click to add to goal</span>
          </p>
          {Object.entries(poiGroups).map(([type, items]) =>
            items.length === 0 ? null : (
              <div key={type} className="flex flex-col gap-2">
                <p className="font-inter text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">
                  {typeEmoji[type]} {type}s ({items.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {items.map((poi) => {
                    const isSelected = selectedPois.some((s) => s.id === poi.id);
                    return (
                      <button
                        key={poi.id}
                        onClick={() =>
                          setSelectedPois((prev) =>
                            isSelected ? prev.filter((s) => s.id !== poi.id) : [...prev, poi]
                          )
                        }
                        className={`font-poppins flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all ${
                          isSelected
                            ? typeColors[type] + " shadow-sm"
                            : "border-[var(--color-border)] bg-white/[0.02] text-[var(--color-body)] hover:border-white/20 hover:bg-white/[0.04]"
                        }`}
                      >
                        {typeEmoji[type]} {poi.name.slice(0, 22)}
                        {isSelected && <X size={11} className="opacity-70" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Generate Goal CTA */}
      {pickup && drop && (
        <button
          onClick={handleGenerateGoal}
          className="btn-spectacular font-poppins flex items-center justify-center gap-2 py-3 text-sm font-semibold w-full rounded-full shadow-lg"
        >
          <Sparkle size={18} weight="fill" />
          <span>Generate AI Travel Goal from Map Selections</span>
          <ArrowRight size={16} weight="bold" />
        </button>
      )}
    </div>
  );
}
