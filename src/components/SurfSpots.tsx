import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Compass, LocateFixed, MapPin, Search, Waves } from 'lucide-react'

type Spot = {
  id: string
  name: string
  country: string
  region: string
  lat: number
  lon: number
  level: 'Beginner' | 'Intermediate' | 'Advanced'
}

const spots: Spot[] = [
  { id: 'anchor-point', name: 'Anchor Point', country: 'Morocco', region: 'Taghazout', lat: 30.5468, lon: -9.7112, level: 'Advanced' },
  { id: 'hash-point', name: 'Hash Point', country: 'Morocco', region: 'Taghazout', lat: 30.5460, lon: -9.7140, level: 'Intermediate' },
  { id: 'panoramas', name: 'Panoramas', country: 'Morocco', region: 'Taghazout', lat: 30.5485, lon: -9.7190, level: 'Beginner' },
  { id: 'killers', name: 'Killer Point', country: 'Morocco', region: 'Taghazout', lat: 30.5030, lon: -9.6810, level: 'Advanced' },
  { id: 'boilers', name: 'Boilers', country: 'Morocco', region: 'Cap Ghir', lat: 30.6330, lon: -9.8660, level: 'Advanced' },
  { id: 'cap-ghir', name: 'Cap Ghir', country: 'Morocco', region: 'Agadir', lat: 30.5930, lon: -9.8780, level: 'Intermediate' },
  { id: 'anza', name: 'Anza', country: 'Morocco', region: 'Agadir', lat: 30.4280, lon: -9.6540, level: 'Intermediate' },
  { id: 'imsouane', name: 'Imsouane Bay', country: 'Morocco', region: 'Imsouane', lat: 30.8420, lon: -9.8200, level: 'Beginner' },
  { id: 'safi', name: 'Safi', country: 'Morocco', region: 'Safi', lat: 32.2990, lon: -9.2500, level: 'Advanced' },
  { id: 'essaouira', name: 'Essaouira', country: 'Morocco', region: 'Essaouira', lat: 31.5100, lon: -9.7700, level: 'Intermediate' },
  { id: 'dakhla', name: 'Oum Labouir', country: 'Morocco', region: 'Dakhla', lat: 23.7200, lon: -15.9500, level: 'Intermediate' },
  { id: 'hossegor', name: 'La Gravière', country: 'France', region: 'Hossegor', lat: 43.6600, lon: -1.4500, level: 'Advanced' },
  { id: 'nazare', name: 'Praia do Norte', country: 'Portugal', region: 'Nazaré', lat: 39.6020, lon: -9.0700, level: 'Advanced' },
  { id: 'uluwatu', name: 'Uluwatu', country: 'Indonesia', region: 'Bali', lat: -8.8290, lon: 115.0870, level: 'Advanced' },
  { id: 'jeffreys', name: 'Supertubes', country: 'South Africa', region: 'Jeffreys Bay', lat: -34.0500, lon: 24.9300, level: 'Advanced' },
  { id: 'pipeline', name: 'Banzai Pipeline', country: 'United States', region: 'Oahu, Hawaii', lat: 21.6650, lon: -158.0530, level: 'Advanced' },
  { id: 'teahupoo', name: 'Teahupo’o', country: 'French Polynesia', region: 'Tahiti', lat: -17.8400, lon: -149.2700, level: 'Advanced' },
  { id: 'gold-coast', name: 'Snapper Rocks', country: 'Australia', region: 'Gold Coast', lat: -28.1650, lon: 153.5450, level: 'Advanced' },
  { id: 'puerto', name: 'Zicatela', country: 'Mexico', region: 'Puerto Escondido', lat: 15.8600, lon: -97.0700, level: 'Advanced' },
]

const copy = {
  en: { eyebrow: 'EXPLORE THE COAST', title: 'Global surf spots', subtitle: 'Discover well-known breaks and open each location on the map.', search: 'Search a spot, city or country…', all: 'All countries', gps: 'Use my location', loading: 'Finding your location…', denied: 'Location access was denied. You can still explore spots manually.', map: 'Selected spot map', level: 'Level', beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', spots: 'spots', note: 'Spot coordinates are approximate. Always verify local access, hazards and conditions before surfing.' },
  ar: { eyebrow: 'اكتشف السواحل', title: 'مواقع ركوب الأمواج حول العالم', subtitle: 'اكتشف أشهر المواقع وافتح كل موقع على الخريطة.', search: 'ابحث عن موقع أو مدينة أو دولة…', all: 'كل الدول', gps: 'استخدم موقعي', loading: 'جارٍ تحديد موقعك…', denied: 'تم رفض الوصول إلى الموقع. يمكنك مواصلة استكشاف المواقع يدوياً.', map: 'خريطة الموقع المختار', level: 'المستوى', beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم', spots: 'مواقع', note: 'إحداثيات المواقع تقريبية. تحقق دائماً من الوصول المحلي والمخاطر والظروف قبل ركوب الأمواج.' },
  fr: { eyebrow: 'EXPLORER LA CÔTE', title: 'Spots de surf mondiaux', subtitle: 'Découvrez des spots connus et ouvrez chaque lieu sur la carte.', search: 'Rechercher un spot, une ville ou un pays…', all: 'Tous les pays', gps: 'Utiliser ma position', loading: 'Localisation en cours…', denied: 'Accès à la position refusé. Vous pouvez explorer les spots manuellement.', map: 'Carte du spot sélectionné', level: 'Niveau', beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé', spots: 'spots', note: 'Les coordonnées sont approximatives. Vérifiez toujours les accès, dangers et conditions locales.' },
  es: { eyebrow: 'EXPLORA LA COSTA', title: 'Spots de surf del mundo', subtitle: 'Descubre spots conocidos y abre cada lugar en el mapa.', search: 'Buscar spot, ciudad o país…', all: 'Todos los países', gps: 'Usar mi ubicación', loading: 'Buscando tu ubicación…', denied: 'Se denegó el acceso a la ubicación. Puedes explorar los spots manualmente.', map: 'Mapa del spot seleccionado', level: 'Nivel', beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado', spots: 'spots', note: 'Las coordenadas son aproximadas. Comprueba siempre el acceso, los peligros y las condiciones locales.' },
  pt: { eyebrow: 'EXPLORAR A COSTA', title: 'Picos de surf pelo mundo', subtitle: 'Descubra picos conhecidos e abra cada local no mapa.', search: 'Pesquisar pico, cidade ou país…', all: 'Todos os países', gps: 'Usar a minha localização', loading: 'A localizar…', denied: 'O acesso à localização foi recusado. Pode explorar os picos manualmente.', map: 'Mapa do pico selecionado', level: 'Nível', beginner: 'Iniciante', intermediate: 'Intermédio', advanced: 'Avançado', spots: 'picos', note: 'As coordenadas são aproximadas. Confirme sempre o acesso, os perigos e as condições locais.' },
}

export default function SurfSpots() {
  const { i18n } = useTranslation()
  const lang = (i18n.resolvedLanguage || i18n.language || 'en').slice(0, 2) as keyof typeof copy
  const t = copy[lang] || copy.en
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('all')
  const [selectedId, setSelectedId] = useState('anchor-point')
  const [gpsMessage, setGpsMessage] = useState('')
  const [locating, setLocating] = useState(false)
  const selected = spots.find(spot => spot.id === selectedId) || spots[0]
  const countries = useMemo(() => Array.from(new Set(spots.map(spot => spot.country))).sort(), [])
  const filtered = useMemo(() => spots.filter(spot => {
    const matchesCountry = country === 'all' || spot.country === country
    const text = (spot.name + ' ' + spot.region + ' ' + spot.country).toLowerCase()
    return matchesCountry && text.includes(query.trim().toLowerCase())
  }), [country, query])
  const delta = 0.018
  const mapUrl = 'https://www.openstreetmap.org/export/embed.html?bbox=' +
    [selected.lon - delta, selected.lat - delta, selected.lon + delta, selected.lat + delta].join('%2C') +
    '&layer=mapnik&marker=' + selected.lat + '%2C' + selected.lon

  const useGps = () => {
    if (!navigator.geolocation) {
      setGpsMessage(t.denied)
      return
    }
    setLocating(true)
    setGpsMessage('')
    navigator.geolocation.getCurrentPosition(
      position => {
        const nearest = [...spots].sort((a, b) =>
          Math.hypot(a.lat - position.coords.latitude, a.lon - position.coords.longitude) -
          Math.hypot(b.lat - position.coords.latitude, b.lon - position.coords.longitude)
        )[0]
        setSelectedId(nearest.id)
        setCountry('all')
        setQuery('')
        setGpsMessage(nearest.name + ' — ' + nearest.region + ', ' + nearest.country)
        setLocating(false)
      },
      () => {
        setGpsMessage(t.denied)
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  const levelLabel = selected.level === 'Beginner' ? t.beginner : selected.level === 'Intermediate' ? t.intermediate : t.advanced

  return (
    <section className="panel spots-panel" id="global-surf-spots">
      <div className="section-heading spots-heading">
        <div><p className="eyebrow">{t.eyebrow}</p><h2>{t.title}</h2><p className="spots-subtitle">{t.subtitle}</p></div>
        <span className="heading-icon"><Compass size={22} /></span>
      </div>
      <div className="spots-toolbar">
        <label className="spots-search"><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={t.search} /></label>
        <select className="spots-country" value={country} onChange={event => setCountry(event.target.value)}>
          <option value="all">{t.all}</option>
          {countries.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
        <button className="button button-primary spots-gps" type="button" onClick={useGps} disabled={locating}>
          <LocateFixed size={17} /> {locating ? t.loading : t.gps}
        </button>
      </div>
      {gpsMessage && <p className="spots-message">{gpsMessage}</p>}
      <div className="spots-layout">
        <div className="spots-results">
          <div className="spots-count">{filtered.length} {t.spots}</div>
          {filtered.length === 0 ? <p className="spots-empty">No spots match this search.</p> : filtered.map(spot => (
            <button className={'spot-result' + (spot.id === selectedId ? ' is-selected' : '')} type="button" key={spot.id} onClick={() => setSelectedId(spot.id)}>
              <span className="spot-result-icon"><Waves size={17} /></span>
              <span className="spot-result-copy"><strong>{spot.name}</strong><small>{spot.region}, {spot.country}</small></span>
              <span className="spot-level">{spot.level === 'Beginner' ? t.beginner : spot.level === 'Intermediate' ? t.intermediate : t.advanced}</span>
            </button>
          ))}
        </div>
        <div className="spots-map-wrap">
          <div className="spots-map-title"><MapPin size={16} /> <strong>{t.map}</strong></div>
          <iframe title={t.map + ': ' + selected.name} src={mapUrl} loading="lazy" />
          <div className="spots-selected"><strong>{selected.name}</strong><span>{selected.region}, {selected.country} · {t.level}: {levelLabel}</span></div>
          <p className="spots-note">{t.note}</p>
          <a className="spots-open-map" href={'https://www.openstreetmap.org/?mlat=' + selected.lat + '&mlon=' + selected.lon + '#map=13/' + selected.lat + '/' + selected.lon} target="_blank" rel="noreferrer">Open full map ↗</a>
        </div>
      </div>
    </section>
  )
}
