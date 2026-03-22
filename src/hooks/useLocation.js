import { useCallback, useEffect, useState } from 'react'

/**
 * useLocation — enhanced with reverse geocoding
 * Returns coords + human-readable cityName/district/state
 * Uses Nominatim (free, no API key required)
 */
export function useLocation() {
  const [coords, setCoords] = useState(null)
  const [cityInfo, setCityInfo] = useState(null)  // { city, district, state, country }
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  /* ── Reverse geocode via free Nominatim ── */
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'BharatPath/1.0' },
      })
      if (!res.ok) return
      const data = await res.json()
      const addr = data.address || {}
      setCityInfo({
        city: addr.city || addr.town || addr.village || addr.county || 'Unknown city',
        district: addr.state_district || addr.county || '',
        state: addr.state || '',
        country: addr.country || 'India',
        display: data.display_name || '',
      })
    } catch {
      // reverse geocode is best-effort — don't set error
    }
  }, [])

  /* ── Core location detector ── */
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setCoords({ latitude, longitude, accuracy })
        setLoading(false)
        reverseGeocode(latitude, longitude)
      },
      (geoError) => {
        /* Map browser error codes to friendly messages */
        const msgs = {
          1: 'Location permission denied. Please allow location access in your browser.',
          2: 'Location unavailable — check your internet / GPS.',
          3: 'Location request timed out. Try again.',
        }
        setError(msgs[geoError.code] || geoError.message || 'Location error.')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    )
  }, [reverseGeocode])

  /* ── Auto-detect on mount ── */
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported in this browser.')
      setLoading(false)
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setCoords({ latitude, longitude, accuracy })
        setError('')
        setLoading(false)
        reverseGeocode(latitude, longitude)
      },
      (geoError) => {
        const msgs = {
          1: 'Location permission denied.',
          2: 'Location unavailable.',
          3: 'Location timed out.',
        }
        setError(msgs[geoError.code] || geoError.message)
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [reverseGeocode])

  return { coords, cityInfo, error, loading, detectLocation }
}
