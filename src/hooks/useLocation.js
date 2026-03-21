import { useCallback, useEffect, useState } from 'react'

export function useLocation() {
  const [coords, setCoords] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

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
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setLoading(false)
      },
      (geoError) => {
        setError(geoError.message || 'Location permission denied.')
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      }
    )
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      const timer = window.setTimeout(() => {
        setError('Geolocation is not supported in this browser.')
        setLoading(false)
      }, 0)
      return () => window.clearTimeout(timer)
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setError('')
        setLoading(false)
      },
      (geoError) => {
        setError(geoError.message || 'Location permission denied.')
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return { coords, error, loading, detectLocation }
}
