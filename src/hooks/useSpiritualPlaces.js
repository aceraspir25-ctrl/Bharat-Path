import { useState, useEffect } from 'react'

function loadGoogleMapsScript(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps && window.google.maps.places) return resolve()
    const scriptId = 'google-maps-script'
    if (document.getElementById(scriptId)) {
      const wait = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(wait)
          resolve()
        }
      }, 100)
      return
    }
    const script = document.createElement('script')
    script.id = scriptId
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// Convert raw API results into standard objects
function formatSpiritualPlace(place, lat, lng, category) {
  return {
    id: place.place_id,
    name: place.name,
    city: place.vicinity || 'Local',
    lat: place.geometry?.location?.lat(),
    lng: place.geometry?.location?.lng(),
    type: category, // 'temple', 'ghat', 'heritage', 'gurudwara', 'mosque', 'church'
    rating: place.rating ? place.rating.toFixed(1) : 'New',
    icon: place.icon
  }
}

export function useSpiritualPlaces(coords) {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!coords) return
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setError('Missing Google Maps API Key')
      return
    }

    let isMounted = true
    setLoading(true)

    const fetchAll = async () => {
      try {
        await loadGoogleMapsScript(apiKey)
        if (!isMounted) return

        const loc = new window.google.maps.LatLng(coords.latitude, coords.longitude)
        const mapDiv = document.createElement('div')
        const service = new window.google.maps.places.PlacesService(mapDiv)

        const runQuery = (req, category) => new Promise((resolve) => {
          service.nearbySearch({ location: loc, radius: 15000, ...req }, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              resolve(results.map(r => formatSpiritualPlace(r, coords.latitude, coords.longitude, category)))
            } else {
              resolve([])
            }
          })
        })

        // Run batched parallel queries for types and keywords
        const allRes = await Promise.all([
          runQuery({ type: 'hindu_temple' }, 'temple'),
          runQuery({ keyword: 'temple' }, 'temple'),
          runQuery({ keyword: 'Ghat' }, 'ghat'),
          runQuery({ keyword: 'River' }, 'ghat'),
          runQuery({ keyword: 'Gurudwara' }, 'gurudwara'),
          runQuery({ keyword: 'Ashram' }, 'temple'),
          runQuery({ type: 'church' }, 'church'),
          runQuery({ type: 'mosque' }, 'mosque'),
          runQuery({ keyword: 'Dargah' }, 'mosque'),
          runQuery({ type: 'museum' }, 'heritage'),
          runQuery({ keyword: 'Fort' }, 'heritage'),
          runQuery({ keyword: 'Palace' }, 'heritage'),
          runQuery({ type: 'tourist_attraction' }, 'heritage'),
        ])

        if (!isMounted) return

        // Flatten and Deduplicate by place ID
        const merged = allRes.flat()
        const unique = {}
        merged.forEach(p => {
          if (!unique[p.id]) unique[p.id] = p
        })

        setPlaces(Object.values(unique))
      } catch (err) {
        if (isMounted) setError(err.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchAll()

    return () => { isMounted = false }
  }, [coords])

  return { places, loading, error }
}
