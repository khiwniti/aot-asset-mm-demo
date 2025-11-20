import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Property } from '../types';

interface LeafletMapProps {
  properties?: Property[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  showCluster?: boolean;
  onMarkerClick?: (property: Property) => void;
  theme?: 'light' | 'dark';
}

const markerIconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const markerIconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const markerShadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const getMarkerColor = (status: string): string => {
  switch (status) {
    case 'Active':
      return '#10b981';
    case 'Pending':
      return '#f59e0b';
    case 'Maintenance':
      return '#ef4444';
    default:
      return '#3b82f6';
  }
};

const createCustomMarker = (color: string) => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
    </svg>
  `;

  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export const LeafletMap = ({
  properties = [],
  center = [13.7563, 100.5018],
  zoom = 12,
  height = '100%',
  showCluster = false,
  onMarkerClick,
  theme = 'light',
}: LeafletMapProps) => {
  const mapRef = useRef(null);

  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIconRetinaUrl,
      iconUrl: markerIconUrl,
      shadowUrl: markerShadowUrl,
    });
  }, []);

  const isDark = theme === 'dark';

  return (
    <div className="w-full relative overflow-hidden rounded-lg" style={{ height }}>
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={
            isDark
              ? 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        />

        {properties.map((property) => {
          if (!property.latitude || !property.longitude) return null;

          const markerColor = getMarkerColor(property.status);
          const customMarker = createCustomMarker(markerColor);

          return (
            <div key={property.id}>
              <Marker
                position={[property.latitude, property.longitude]}
                icon={customMarker}
                eventHandlers={{
                  click: () => onMarkerClick?.(property),
                }}
              >
                <Popup
                  closeButton={true}
                  className="property-popup"
                  autoPan={true}
                >
                  <div className="min-w-[200px] text-sm">
                    <div className="font-bold text-slate-800 mb-1">{property.name}</div>
                    <div className="text-xs text-slate-600 mb-2">{property.address}</div>

                    <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-200 my-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Monthly Rent</span>
                        <span className="font-semibold text-slate-800">
                          ฿{property.monthlyRent.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Occupancy</span>
                        <span className="font-semibold text-slate-800">{property.occupancyRate}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Tenants</span>
                        <span className="font-semibold text-slate-800">{property.tenantCount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Type</span>
                        <span className="font-semibold text-slate-800 text-xs">{property.type}</span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold
                        ${
                          property.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : property.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }
                      `}
                      >
                        {property.status}
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-slate-600">
                      <div>Portfolio Value: ฿{(property.value / 1000000).toFixed(1)}M</div>
                    </div>
                  </div>
                </Popup>

                <Tooltip direction="top" offset={[0, -10]} permanent={false}>
                  <div className="font-semibold text-sm text-slate-800">{property.name}</div>
                </Tooltip>
              </Marker>

              {showCluster && (
                <Circle
                  center={[property.latitude, property.longitude]}
                  radius={300}
                  pathOptions={{
                    color: markerColor,
                    fillColor: markerColor,
                    fillOpacity: 0.1,
                    weight: 1,
                    dashArray: '5, 5',
                  }}
                />
              )}
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
