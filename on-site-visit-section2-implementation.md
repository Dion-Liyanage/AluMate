AluMate – On-Site Visit Location Service (Section 2 – MapLibre)
Project

AluMate – Aluminium Fabrication and Service Management System

This document describes the implementation of the Location Selection Feature using MapLibre for the On-Site Visit Request.

1. Objective

Enable users to:

select their exact location using an interactive map
place a marker on the map
optionally detect current location
store latitude & longitude in the request
integrate location data into the service request system
2. Technology Stack
Map Library
MapLibre GL JS
Tile Provider
OpenStreetMap (free tiles)
3. Integration with Section 1

This extends:

/dashboard/services/on-site-visit

Replaces:

Location Placeholder

With:

Interactive Map Picker
4. System Flow
User opens On-Site Visit page
        ↓
Clicks "Select Location"
        ↓
Map Modal Opens
        ↓
User clicks on map
        ↓
Marker placed
        ↓
User confirms location
        ↓
Coordinates saved
5. UI Design
Location Section (Updated)
Location

[ Select Location on Map ]

Selected Location:
Lat: 6.9271
Lng: 79.8612
6. Map Modal Layout
-------------------------------------------------
Select Your Location

-----------------------------------------------
|                                             |
|              MapLibre Map                   |
|                                             |
|               (Marker)                     |
|                                             |
-----------------------------------------------

[ Use Current Location ]   [ Confirm Location ]
-------------------------------------------------
7. Component Structure

Create:

components/location/

LocationPickerModal.tsx
MapLibreMap.tsx
LocationPreview.tsx
LocationButton.tsx
8. Installation
npm install maplibre-gl
9. Map Setup
Import CSS
import 'maplibre-gl/dist/maplibre-gl.css';
Initialize Map
import maplibregl from 'maplibre-gl';

useEffect(() => {
  const map = new maplibregl.Map({
    container: 'map',
    style: 'https://demotiles.maplibre.org/style.json',
    center: [79.8612, 6.9271], // Colombo
    zoom: 12,
  });

  return () => map.remove();
}, []);
10. Marker Placement
Logic
map.on('click', (e) => {
  const { lng, lat } = e.lngLat;

  setLocation({ lat, lng });

  if (marker) marker.remove();

  marker = new maplibregl.Marker()
    .setLngLat([lng, lat])
    .addTo(map);
});
11. State Management
const [location, setLocation] = useState({
  lat: null,
  lng: null
});

const [isMapOpen, setIsMapOpen] = useState(false);
12. Current Location Detection
navigator.geolocation.getCurrentPosition((position) => {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;

  setLocation({ lat, lng });

  map.flyTo({
    center: [lng, lat],
    zoom: 14
  });
});
13. Confirm Location
function handleConfirm() {
  setIsMapOpen(false);
}
14. Data Structure Update
{
  "userId": "...",
  "date": "...",
  "timeSlot": "...",
  "fullName": "...",
  "contactNumber": "...",
  "nearestTown": "...",
  "location": {
    "lat": 6.9271,
    "lng": 79.8612
  },
  "status": "Request Sent"
}
15. Backend Schema Update
location: {
  lat: Number,
  lng: Number
}
16. UI Enhancements
Display Selected Location
Location Selected ✅
Lat: 6.9271
Lng: 79.8612
Optional Enhancements
Show map preview
Convert coordinates to address
Add search bar
17. Validation

Before submitting request:

Location must be selected
18. Error Handling

Handle cases:

User denies location access
No location selected
Map fails to load
19. Performance Optimization
Load map only when modal opens
Use lazy loading
Remove map instance on close
20. Security Considerations
No API key required (MapLibre + OSM)
Safe for academic projects
21. Development Steps
Phase 1
Install MapLibre
Create modal UI
Phase 2
Initialize map
Add click-to-place marker
Phase 3
Add current location feature
Phase 4
Connect with form
Add validation
22. Final Outcome

User can:

Open map
Click to select location
See marker
Confirm location
Submit request with coordinates
23. Summary

This implementation:

provides a modern map experience
is fully free and open-source
integrates cleanly with your system
supports future features like routing and analytics
24. Future Enhancements
Reverse geocoding (lat/lng → address)
Admin map view for requests
Distance calculation
Route planning