# Leaflet Real Map Integration Guide

## Overview

This document describes the real map integration using Leaflet.js for the AOT Asset Management platform. The integration provides interactive, geospatial visualization of properties with rich property information popups.

## Architecture

### Components

#### 1. **LeafletMap Component** (`components/LeafletMap.tsx`)
A reusable React component that renders a Leaflet map with property markers.

**Props:**
```typescript
interface LeafletMapProps {
  properties?: Property[];           // Array of properties to display
  center?: [number, number];         // Initial map center [lat, lng]
  zoom?: number;                     // Initial zoom level
  height?: string;                   // Container height (default: "100%")
  showCluster?: boolean;             // Show area circles around markers
  onMarkerClick?: (property) => void; // Callback when marker is clicked
  theme?: 'light' | 'dark';          // Map theme
}
```

**Features:**
- OpenStreetMap tiles with light/dark theme support
- Custom colored markers based on property status
- Rich popup information with property details
- Hover tooltips showing property name
- Optional cluster circles for area visualization
- Responsive design

#### 2. **MapVisual Component** (`components/Visuals.tsx`)
Enhanced visualization component for displaying maps in AI-generated visualizations and dashboards.

**Features:**
- Real Leaflet map rendering
- Floating statistics overlays:
  - Average monthly rent
  - Active properties count
  - Portfolio health score
- Automatic calculations based on property data
- Theme support (light/dark)

#### 3. **PropertyListing Integration** (`pages/PropertyListing.tsx`)
The property listing page now uses LeafletMap for:
- **Map View**: Interactive map showing all filtered properties
- **Region Listing**: Geographic view of properties by district

## Data Model

### Property Type Extension
Properties now include geographic coordinates:

```typescript
interface Property {
  // ... existing fields
  latitude?: number;    // Property latitude
  longitude?: number;   // Property longitude
}
```

### Mock Data
All sample properties have been updated with realistic coordinates in Thailand:

```
P001 - Suvarnabhumi Residence: 13.6929, 100.7501 (Bangkok)
P002 - Airport Side Apartment: 13.6950, 100.7550 (Bangkok)
P003 - Park Villa: 8.0863, 98.9853 (Phuket)
P004 - Sriracha View: 12.9299, 100.9205 (Chonburi)
P005 - Urban Chiang Mai: 18.7883, 98.9853 (Chiang Mai)
P006 - Urban Bang Phli: 13.5951, 100.7544 (Samut Prakan)
```

## Usage Examples

### Basic Map Display

```typescript
import LeafletMap from '../components/LeafletMap';
import { Property } from '../types';

const properties: Property[] = [...];

<LeafletMap
  properties={properties}
  center={[13.7563, 100.5018]}  // Bangkok center
  zoom={11}
  height="600px"
  theme="light"
/>
```

### With Callbacks

```typescript
<LeafletMap
  properties={properties}
  center={[13.7563, 100.5018]}
  zoom={11}
  onMarkerClick={(property) => {
    console.log(`Clicked property: ${property.name}`);
    // Navigate to property detail page
    navigate(`/properties/${property.id}`);
  }}
/>
```

### With Clustering

```typescript
<LeafletMap
  properties={properties}
  center={[13.7563, 100.5018]}
  zoom={11}
  showCluster={true}  // Shows area circles
/>
```

### In Chat/AI Visualizations

```typescript
export const MapVisual = ({ data, theme = 'dark' }: VisualProps) => {
  return (
    <div className="h-full flex flex-col relative overflow-hidden rounded-xl">
      <LeafletMap
        properties={data?.properties || []}
        center={data?.center || [13.7563, 100.5018]}
        zoom={data?.zoom || 11}
        height="100%"
        theme={isDark ? 'dark' : 'light'}
      />
    </div>
  );
};
```

## Styling & Theming

### Marker Styling

Markers are color-coded by property status:
- **Active**: Green (#10b981)
- **Pending**: Amber (#f59e0b)
- **Maintenance**: Red (#ef4444)

### Popup Information

The popup displays:
- Property name
- Address
- Monthly rent
- Occupancy rate
- Number of tenants
- Property type
- Portfolio value

### Map Layers

- **Light Theme**: OpenStreetMap default tiles
- **Dark Theme**: CartoDB dark tiles (cartodbpositron_nolabels)

## Features & Capabilities

### Core Features
✅ Real OpenStreetMap rendering
✅ Custom marker styling by status
✅ Interactive popups with rich information
✅ Hover tooltips
✅ Click handlers for property navigation
✅ Light/dark theme support
✅ Responsive design
✅ Area clustering visualization

### Statistics & Analytics
✅ Average monthly rent calculation
✅ Active properties count
✅ Portfolio health scoring
✅ Demand score calculation

## Integration Points

### ChatInterface Integration
Maps can be generated as AI responses:
```typescript
if (msg.uiPayload?.type === 'map') {
  // Map is automatically displayed in left panel
  setActiveVisual({
    type: 'map',
    title: 'Property Distribution',
    data: { properties, center, zoom }
  });
}
```

### PropertyListing Integration
Two map views available:
1. **Property Listing Tab** - Map view of all filtered properties
2. **Region Listing Tab** - Geographic clustering by district

## Performance Optimizations

- Lazy loading of marker icons
- CDN-based Leaflet and tile layer sources
- Efficient property filtering
- Memoized calculations for statistics
- Responsive map sizing

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with touch gestures

## Future Enhancements

Potential improvements for future iterations:

1. **Marker Clustering**: Use Leaflet MarkerCluster plugin for large datasets
2. **Heat Maps**: Show property density/value heatmaps
3. **Geofencing**: Draw and save geographic areas
4. **Street View Integration**: Street view integration via OpenStreetMap
5. **Advanced Filters**: Filter markers by multiple criteria
6. **Export**: Export map as image or PDF
7. **Custom Base Maps**: Support for additional tile layers (satellite, terrain)
8. **Real-time Updates**: WebSocket-based live property updates on map
9. **Route Planning**: Distance calculations between properties
10. **Analytics Overlay**: Show metrics overlaid on map regions

## Dependencies

- **leaflet**: ^1.9.4 - Core mapping library
- **react-leaflet**: ^4.2.1 - React bindings for Leaflet
- **lucide-react**: ^0.554.0 - Icons

## CSS Requirements

The following CSS must be included in `index.html`:
```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
```

And custom styles for Leaflet container:
```css
.leaflet-container {
  width: 100%;
  height: 100%;
  z-index: 0;
}
```

## Troubleshooting

### Markers not showing
- Ensure properties have valid latitude/longitude coordinates
- Check browser console for coordinate validation errors
- Verify properties array is not empty

### Map not displaying
- Check if height CSS is properly set
- Verify Leaflet CSS is loaded in index.html
- Check network tab for CDN resource loading

### Theme not applying
- Ensure `theme` prop is passed correctly ('light' or 'dark')
- Check if CSS classes are properly formatted
- Verify tailwind CSS is configured

### Performance issues
- Reduce number of markers displayed
- Enable marker clustering with `showCluster={true}`
- Use viewport-based rendering for large datasets

## Related Files

- `/home/engine/project/components/LeafletMap.tsx` - Map component
- `/home/engine/project/components/Visuals.tsx` - Visualization components
- `/home/engine/project/pages/PropertyListing.tsx` - Property listing page
- `/home/engine/project/types.ts` - Type definitions
- `/home/engine/project/services/mockData.ts` - Sample data with coordinates
