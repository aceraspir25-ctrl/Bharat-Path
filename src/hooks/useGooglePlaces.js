import { useState, useEffect } from 'react';
import { getDistanceInKm } from '../utils/distance';

function loadGoogleMapsScript(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps && window.google.maps.places) {
      resolve();
      return;
    }
    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId);
    
    if (script) {
      // Script tag exists, wait for API to be ready
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      return;
    }

    script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function formatPlace(place, lat, lng, defaultName) {
  if (!place) return null;
  const placeLat = place.geometry?.location?.lat();
  const placeLng = place.geometry?.location?.lng();
  let dist = '0.0';
  if (placeLat && placeLng) {
    dist = getDistanceInKm(lat, lng, placeLat, placeLng).toFixed(1);
  }
  return {
    name: place.name || defaultName,
    distance: `${dist} km`,
    lat: placeLat,
    lng: placeLng,
    place_id: place.place_id,
    type: defaultName
  };
}

export function useGooglePlaces(coords) {
  const [places, setPlaces] = useState({ safety: [], transit: [], lifestyle: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!coords) return;
    
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('Missing Google Maps API Key');
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchPlaces = async () => {
      try {
        await loadGoogleMapsScript(apiKey);
        if (!isMounted) return;

        const location = new window.google.maps.LatLng(coords.latitude, coords.longitude);
        const mapDiv = document.createElement('div');
        const service = new window.google.maps.places.PlacesService(mapDiv);

        const makeQuery = (type) => {
          return new Promise((resolve) => {
            service.nearbySearch({
              location,
              rankBy: window.google.maps.places.RankBy.DISTANCE,
              type
            }, (results, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                resolve(results);
              } else {
                resolve([]);
              }
            });
          });
        };

        // Note: RankBy.DISTANCE requires type, keyword or name. Can't use radius.
        const [police, hospital, train, bus, lodging, cafe, restaurant] = await Promise.all([
          makeQuery('police'),
          makeQuery('hospital'),
          makeQuery('train_station'),
          makeQuery('bus_station'),
          makeQuery('lodging'),
          makeQuery('cafe'),
          makeQuery('restaurant')
        ]);

        if (!isMounted) return;

        const safety = [];
        if (police[0]) safety.push(formatPlace(police[0], coords.latitude, coords.longitude, 'Police Station'));
        if (hospital[0]) safety.push(formatPlace(hospital[0], coords.latitude, coords.longitude, 'Hospital'));

        const transit = [];
        if (train[0]) transit.push(formatPlace(train[0], coords.latitude, coords.longitude, 'Railway Station'));
        if (bus[0]) transit.push(formatPlace(bus[0], coords.latitude, coords.longitude, 'Bus Stand'));

        const lifestyle = [];
        if (lodging[0]) lifestyle.push(formatPlace(lodging[0], coords.latitude, coords.longitude, 'Hotel'));
        if (cafe[0]) lifestyle.push(formatPlace(cafe[0], coords.latitude, coords.longitude, 'Cafe'));
        if (restaurant[0]) lifestyle.push(formatPlace(restaurant[0], coords.latitude, coords.longitude, 'Restaurant'));
        if (restaurant[1]) lifestyle.push(formatPlace(restaurant[1], coords.latitude, coords.longitude, 'Restaurant'));

        setPlaces({ safety, transit, lifestyle });
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to fetch places');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPlaces();

    return () => {
      isMounted = false;
    };
  }, [coords]);

  return { places, loading, error };
}
