import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Activity, Compass, LocateFixed, RefreshCw, Thermometer, Waves, Wind } from 'lucide-react'

export type SurfSpotSelection = {
  latitude: number
  longitude: number
  label: string
}

type Conditions = {
  location: { latitude: number; longitude: number }
  timezone: string
  updatedAt: string
  marine: {
    time?: string
    wave_height?: number | null
    wave_direction?: number | null
    wave_period?: number | null
    swell_wave_height?: number | null
    swell_wave_direction?: number | null
    swell_wave_period?: number | null
    sea_surface_temperature?: number | null
  } | null
  weather: {
    time?: string
    wind_speed_10m?: number | null
    wind_direction_10m?: number | null
    wind_gusts_10m?: number | null
    temperature_2m?: number | null
  } | null
}

const TAGHAZOUT: SurfSpotSelection = {
  latitude: 30.545,
  longitude: -9.711,
  label: 'Taghazout, Morocco',
}

function numberOrDash(value: number | null | undefined, digits = 1) {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(digits) : '—'
}

function compassDirection(degrees: number | null | undefined) {
  if (typeof degrees !== 'number' || !Number.isFinite(degrees)) return '—'
  return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(degrees / 45) % 8]
}

type SurfConditionsProps = {
  selectedSpot: SurfSpotSelection
}

export default function SurfConditions({ selectedSpot }: SurfConditionsProps) {
  const { t } = useTranslation()
  const [conditions, setConditions] = useState<Conditions | null>(null)
  const [place, setPlace] = useState(selectedSpot.label)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadConditions = useCallback(async (lat: number, lon: number, label: string) => {
    setLoading(true)
    setError('')
    setPlace(label)
    try {
      const response = await fetch(`/api/surf-conditions?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t('forecastError'))
      setConditions(data as Conditions)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('forecastError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    setPlace(selectedSpot.label)
    void loadConditions(selectedSpot.latitude, selectedSpot.longitude, selectedSpot.label)
  }, [loadConditions, selectedSpot])

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError(t('gpsUnsupported'))
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords
        void loadConditions(latitude, longitude, t('myLocation'))
      },
      () => {
        setLoading(false)
        setError(t('gpsDenied'))
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 },
    )
  }

  const marine = conditions?.marine
  const weather = conditions?.weather

  return (
    <section className="panel conditions-panel">
      <div className="section-heading conditions-heading">
        <div>
          <p className="eyebrow">{t('liveOcean')}</p>
          <h2>{t('surfConditions')}</h2>
          <p className="conditions-location"><Compass size={14} /> {place}</p>
        </div>
        <div className="conditions-tools">
          <button className="icon-button conditions-tool" type="button" onClick={() => void loadConditions(
            conditions?.location?.latitude ?? selectedSpot.latitude ?? TAGHAZOUT.latitude,
            conditions?.location?.longitude ?? selectedSpot.longitude ?? TAGHAZOUT.longitude,
            place,
          )} aria-label={t('refresh')} title={t('refresh')} disabled={loading}>
            <RefreshCw size={17} className={loading ? 'spin' : ''} />
          </button>
          <button className="button button-export" type="button" onClick={useMyLocation} disabled={loading}>
            <LocateFixed size={16} /> {t('useGPS')}
          </button>
        </div>
      </div>

      {error && <p className="conditions-error" role="alert">{error}</p>}
      {loading && !conditions ? (
        <div className="conditions-loading"><Activity size={20} /> {t('loadingForecast')}</div>
      ) : (
        <div className="conditions-grid">
          <article className="condition-card">
            <span className="condition-label"><Waves size={16} /> {t('waveHeight')}</span>
            <strong>{numberOrDash(marine?.wave_height)} <small>m</small></strong>
            <span className="condition-detail">{t('period')}: {numberOrDash(marine?.wave_period, 0)} s</span>
          </article>
          <article className="condition-card">
            <span className="condition-label"><Wind size={16} /> {t('windSpeed')}</span>
            <strong>{numberOrDash(weather?.wind_speed_10m, 0)} <small>km/h</small></strong>
            <span className="condition-detail">{compassDirection(weather?.wind_direction_10m)} · {numberOrDash(weather?.wind_direction_10m, 0)}°</span>
          </article>
          <article className="condition-card">
            <span className="condition-label"><Activity size={16} /> {t('swell')}</span>
            <strong>{numberOrDash(marine?.swell_wave_height)} <small>m</small></strong>
            <span className="condition-detail">{compassDirection(marine?.swell_wave_direction)} · {numberOrDash(marine?.swell_wave_period, 0)} s</span>
          </article>
          <article className="condition-card">
            <span className="condition-label"><Thermometer size={16} /> {t('seaTemperature')}</span>
            <strong>{numberOrDash(marine?.sea_surface_temperature, 0)} <small>°C</small></strong>
            <span className="condition-detail">{t('windGusts')}: {numberOrDash(weather?.wind_gusts_10m, 0)} km/h</span>
          </article>
        </div>
      )}
      {conditions && (
        <div className="conditions-footer">
          <span>{t('updated')}: {new Date(conditions.updatedAt).toLocaleTimeString()}</span>
          <span>Open-Meteo</span>
        </div>
      )}
      <p className="conditions-disclaimer">{t('forecastDisclaimer')}</p>
    </section>
  )
}
