import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { PORTS } from '@/data/ports';
import { ROUTES } from '@/data/routes';
import type { RouteData } from '@/data/types';

// Custom icons
const originIcon = new L.DivIcon({
  className: 'custom-leaflet-icon origin-icon',
  html: `<div style="width: 14px; height: 14px; background-color: #3b82f6; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(59,130,246,0.8);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const destIcon = new L.DivIcon({
  className: 'custom-leaflet-icon dest-icon',
  html: `<div style="width: 14px; height: 14px; background-color: #f97316; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(249,115,22,0.8);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

// A component to automatically fit bounds to the selected route
function MapBoundsManager({ selectedRoute }: { selectedRoute: RouteData | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedRoute) {
      const origin = PORTS.find(p => p.id === selectedRoute.originId);
      const dest = PORTS.find(p => p.id === selectedRoute.destinationId);
      if (origin?.coordinates && dest?.coordinates) {
        const bounds = L.latLngBounds([origin.coordinates, dest.coordinates]);
        map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1 });
      }
    } else {
      // Fit to all ports if no route is selected
      const validCoords = PORTS.filter(p => p.coordinates).map(p => p.coordinates as [number, number]);
      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { padding: [30, 30], animate: true, duration: 1 });
      }
    }
  }, [selectedRoute, map]);

  return null;
}

export function RouteMap({ 
  selectedRouteId,
  onRouteSelect
}: { 
  selectedRouteId: string | null;
  onRouteSelect: (routeId: string) => void;
}) {
  const selectedRoute = ROUTES.find(r => r.id === selectedRouteId) || null;

  const routeLines = ROUTES.map(route => {
    const origin = PORTS.find(p => p.id === route.originId);
    const dest = PORTS.find(p => p.id === route.destinationId);
    const isSelected = route.id === selectedRouteId;
    
    if (!origin?.coordinates || !dest?.coordinates) return null;

    return (
      <Polyline
        key={route.id}
        positions={[origin.coordinates, dest.coordinates]}
        color={isSelected ? '#10b981' : '#475569'}
        weight={isSelected ? 3 : 1.5}
        opacity={isSelected ? 1 : 0.4}
        dashArray={isSelected ? undefined : '5, 5'}
        eventHandlers={{
          click: () => onRouteSelect(route.id)
        }}
        pathOptions={{ className: 'cursor-pointer' }}
      />
    );
  }).filter(Boolean);

  const portMarkers = PORTS.filter(p => p.coordinates).map(port => {
    const isOrigin = ROUTES.some(r => r.originId === port.id);
    
    return (
      <Marker 
        key={port.id}
        position={port.coordinates!}
        icon={isOrigin ? originIcon : destIcon}
      >
        <Popup>
          <div className="font-bold text-sm text-foreground">{port.name}</div>
          <div className="text-xs text-muted-foreground">{port.country}</div>
          {port.maxDraft && <div className="text-xs mt-1">Max Draft: {port.maxDraft}m</div>}
          {port.maxLOA && <div className="text-xs">Max LOA: {port.maxLOA}m</div>}
        </Popup>
      </Marker>
    );
  });

  return (
    <div className="h-[600px] w-full rounded-md overflow-hidden border border-border relative z-0">
      <MapContainer 
        center={[0, 80]} 
        zoom={3} 
        className="h-full w-full bg-[#0f172a]" // Tailwind slate-900
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        <MapBoundsManager selectedRoute={selectedRoute} />
        {routeLines}
        {portMarkers}
      </MapContainer>
    </div>
  );
}
