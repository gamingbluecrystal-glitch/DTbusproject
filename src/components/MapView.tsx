import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSmartBus } from '../context/SmartBusContext';

// Fix Leaflet's default icon path issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export const MapView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  const {
    stops,
    routes,
    selectedStopId,
    setSelectedStopId,
    allActiveBusesLocations,
    activeRouteModal,
  } = useSmartBus();

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default to Nashik coordinates
      const defaultLat = stops.length > 0 ? stops[0].lat : 19.9975;
      const defaultLng = stops.length > 0 ? stops[0].lng : 73.7898;

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const layersGroup = L.layerGroup().addTo(map);
      layersGroupRef.current = layersGroup;
      mapInstanceRef.current = map;

      // Force size recalculation to prevent gray tiles
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
      setTimeout(() => {
        map.invalidateSize();
      }, 600);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Layers when data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layersGroup = layersGroupRef.current;
    if (!map || !layersGroup) return;

    layersGroup.clearLayers();

    // 1. Draw Routes
    routes.forEach((route) => {
      if (!route.isActive || !route.stops) return;
      const latlngs: [number, number][] = [];
      route.stops.forEach((rs) => {
        const stop = stops.find((s) => s.id === rs.stopId);
        if (stop && typeof stop.lat === 'number' && typeof stop.lng === 'number') {
          latlngs.push([stop.lat, stop.lng]);
        }
      });

      if (latlngs.length > 1) {
        L.polyline(latlngs, {
          color: '#b91c1c',
          weight: 4,
          opacity: 0.85,
        }).addTo(layersGroup);
      }
    });

    // 2. Draw Stops
    stops.forEach((stop) => {
      if (typeof stop.lat !== 'number' || typeof stop.lng !== 'number') return;
      const isSelected = stop.id === selectedStopId;
      const markerHtml = `
        <div style="
          width: ${isSelected ? '20px' : '14px'};
          height: ${isSelected ? '20px' : '14px'};
          border-radius: 50%;
          background-color: ${isSelected ? '#b91c1c' : '#ffffff'};
          border: 2px solid ${isSelected ? '#ffffff' : '#b91c1c'};
          box-shadow: 0 0 4px rgba(0,0,0,0.5);
          cursor: pointer;
        "></div>
      `;

      const icon = L.divIcon({
        className: 'custom-stop-pin',
        html: markerHtml,
        iconSize: [isSelected ? 20 : 14, isSelected ? 20 : 14],
        iconAnchor: [isSelected ? 10 : 7, isSelected ? 10 : 7],
      });

      const marker = L.marker([stop.lat, stop.lng], { icon });
      marker.on('click', () => setSelectedStopId(stop.id));
      marker.bindPopup(`<b>${stop.name}</b><br/>Code: ${stop.code}<br/>${isSelected ? '<b>(Selected Stop)</b>' : 'Click to select'}`);
      marker.addTo(layersGroup);
    });

    // 3. Draw Active Buses (Interpolated Position)
    allActiveBusesLocations.forEach(({ bus, route, location }) => {
      if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') return;
      const busHtml = `
        <div style="
          background-color: #b91c1c;
          color: #ffffff;
          padding: 3px 6px;
          border-radius: 4px;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 5px rgba(0,0,0,0.4);
          font-size: 10px;
          font-weight: bold;
          white-space: nowrap;
          text-align: center;
        ">
          🚌 ${bus.busNumber}
        </div>
      `;

      const busIcon = L.divIcon({
        className: 'custom-bus-pin',
        html: busHtml,
        iconSize: [60, 24],
        iconAnchor: [30, 12],
      });

      const marker = L.marker([location.lat, location.lng], { icon: busIcon, zIndexOffset: 200 });
      marker.bindPopup(`
        <b>${bus.busNumber}</b> (${bus.plateNumber})<br/>
        Route: ${route.name}<br/>
        <b>Segment:</b> ${location.currentSegmentDescription}<br/>
        <small style="color: #b91c1c;">* Estimated Position (Non-GPS)</small>
      `);
      marker.addTo(layersGroup);
    });

    // Center map
    if (activeRouteModal && typeof activeRouteModal.location.lat === 'number') {
      map.panTo([activeRouteModal.location.lat, activeRouteModal.location.lng]);
    } else {
      const selStop = stops.find((s) => s.id === selectedStopId);
      if (selStop && typeof selStop.lat === 'number') {
        map.panTo([selStop.lat, selStop.lng]);
      } else if (stops.length > 0 && typeof stops[0].lat === 'number') {
        map.panTo([stops[0].lat, stops[0].lng]);
      }
    }

    // Refresh size
    map.invalidateSize();
  }, [stops, routes, selectedStopId, allActiveBusesLocations, activeRouteModal, setSelectedStopId]);

  return (
    <div className="bg-white border border-gray-200 rounded p-2 shadow-sm">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 text-xs">
        <span className="font-bold text-gray-800">Route & Bus Tracking Map</span>
        <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200 text-[11px]">
          Estimated Location (Non-GPS)
        </span>
      </div>

      {/* Explicit height on div so Leaflet initializes accurately */}
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '420px', minHeight: '420px' }}
        className="w-full bg-gray-100 rounded"
      />

      <div className="flex flex-wrap items-center justify-between pt-2 text-[11px] text-gray-500 gap-2">
        <div>
          Legend: <span className="text-red-700 font-bold">●</span> Bus Stop &nbsp;|&nbsp;{' '}
          <span className="font-bold text-red-800">🚌</span> Estimated Bus Position
        </div>
        <div>
          {stops.length === 0 ? 'No stops added yet.' : `${stops.length} stops loaded.`}
        </div>
      </div>
    </div>
  );
};
