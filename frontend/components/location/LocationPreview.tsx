"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { MapPin, Pencil, CheckCircle2 } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";

const Map = dynamic(
  () => import("@/components/ui/map").then((m) => m.Map),
  { ssr: false },
);
const MapMarker = dynamic(
  () => import("@/components/ui/map").then((m) => m.MapMarker),
  { ssr: false },
);
const MarkerContent = dynamic(
  () => import("@/components/ui/map").then((m) => m.MarkerContent),
  { ssr: false },
);

interface LocationPreviewProps {
  location: { lat: number; lng: number };
  onChangeLocation: () => void;
}

export function LocationPreview({
  location,
  onChangeLocation,
}: LocationPreviewProps) {
  return (
    <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 overflow-hidden">
      {/* Mini map preview */}
      <div className="relative h-[180px] w-full">
        <Map
          center={[location.lng, location.lat]}
          zoom={14}
          className="h-full w-full"
          theme="dark"
          interactive={false}
        >
          <MapMarker longitude={location.lng} latitude={location.lat}>
            <MarkerContent>
              <div className="relative flex flex-col items-center">
                <div className="rounded-full bg-fuchsia-500 p-1.5 shadow-lg shadow-fuchsia-500/40 border-2 border-white">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div className="h-2 w-0.5 bg-fuchsia-500" />
              </div>
            </MarkerContent>
          </MapMarker>
        </Map>
      </div>

      {/* Info bar */}
      <div className="px-4 py-3 flex items-center justify-between bg-zinc-900/60 border-t border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">Location Selected</span>
          </div>
          <span className="text-zinc-500 text-xs font-mono">
            {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onChangeLocation}
          type="button"
          className="border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
        >
          <Pencil className="h-3 w-3 mr-1.5" />
          Change
        </Button>
      </div>
    </div>
  );
}
