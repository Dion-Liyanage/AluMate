"use client";

import { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Map,
  MapMarker,
  MarkerContent,
  MapControls,
} from "@/components/ui/map";
import { MapPin, Navigation, Check } from "lucide-react";
import type MapLibreGL from "maplibre-gl";

interface LocationPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (location: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number } | null;
}

export function LocationPickerModal({
  open,
  onOpenChange,
  onConfirm,
  initialLocation,
}: LocationPickerModalProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(initialLocation ?? null);
  const mapRef = useRef<MapLibreGL.Map | null>(null);

  const handleMapClick = useCallback((e: MapLibreGL.MapMouseEvent) => {
    const { lng, lat } = e.lngLat;
    setSelectedLocation({ lat, lng });
  }, []);

  const handleMapLoad = useCallback(
    (map: MapLibreGL.Map) => {
      mapRef.current = map;
      map.on("click", handleMapClick);
    },
    [handleMapClick]
  );

  const handleLocate = useCallback(
    (coords: { longitude: number; latitude: number }) => {
      setSelectedLocation({ lat: coords.latitude, lng: coords.longitude });
    },
    []
  );

  const handleConfirm = () => {
    if (selectedLocation) {
      onConfirm(selectedLocation);
      onOpenChange(false);
    }
  };

  const handleDragEnd = useCallback(
    (lngLat: { lng: number; lat: number }) => {
      setSelectedLocation({ lat: lngLat.lat, lng: lngLat.lng });
    },
    []
  );

  // Reset selected location when dialog opens with new initial location
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && initialLocation) {
      setSelectedLocation(initialLocation);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-zinc-950 border-zinc-800 p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-zinc-100 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-fuchsia-500/20 flex items-center justify-center border border-fuchsia-500/30">
              <MapPin className="h-4 w-4 text-fuchsia-300" />
            </div>
            Select Your Location
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Click on the map to place a marker, or use the locate button to find
            your current position.
          </DialogDescription>
        </DialogHeader>

        {/* Map Container */}
        <div className="relative h-[400px] w-full border-y border-zinc-800">
          <Map
            ref={(ref) => {
              if (ref && !mapRef.current) {
                handleMapLoad(ref);
              }
              mapRef.current = ref;
            }}
            center={
              initialLocation
                ? [initialLocation.lng, initialLocation.lat]
                : [79.8612, 6.9271]
            }
            zoom={12}
            className="h-full w-full"
            theme="dark"
          >
            {selectedLocation && (
              <MapMarker
                longitude={selectedLocation.lng}
                latitude={selectedLocation.lat}
                draggable
                onDragEnd={handleDragEnd}
              >
                <MarkerContent>
                  <div className="relative flex flex-col items-center">
                    <div className="rounded-full bg-fuchsia-500 p-1.5 shadow-lg shadow-fuchsia-500/40 border-2 border-white">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <div className="h-2 w-0.5 bg-fuchsia-500" />
                  </div>
                </MarkerContent>
              </MapMarker>
            )}
            <MapControls
              position="bottom-right"
              showZoom
              showLocate
              onLocate={handleLocate}
            />
          </Map>

          {/* Instruction overlay */}
          {!selectedLocation && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <div className="bg-zinc-900/90 backdrop-blur-sm border border-zinc-700/50 rounded-full px-4 py-2 text-xs text-zinc-300 shadow-lg flex items-center gap-2">
                <Navigation className="h-3 w-3 text-fuchsia-400" />
                Click anywhere on the map to select a location
              </div>
            </div>
          )}
        </div>

        {/* Coordinates & Actions */}
        <DialogFooter className="px-6 py-4 flex-row items-center justify-between sm:justify-between">
          <div className="text-sm text-zinc-400">
            {selectedLocation ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-fuchsia-500 animate-pulse" />
                <span className="text-zinc-300 font-mono text-xs">
                  {selectedLocation.lat.toFixed(6)},{" "}
                  {selectedLocation.lng.toFixed(6)}
                </span>
              </span>
            ) : (
              <span className="text-zinc-500 italic">No location selected</span>
            )}
          </div>
          <Button
            onClick={handleConfirm}
            disabled={!selectedLocation}
            className="bg-emerald-600 hover:bg-emerald-700 text-white border-0"
          >
            <Check className="h-4 w-4 mr-1.5" />
            Confirm Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
