import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Activity, CalendarDays, Clock3, Download, Globe2, MapPin, Trash2, Waves, Wind, Plus, Pencil, Save, X } from 'lucide-react'

type Session = {
  id: string
  date: string
  location: string
  duration: string
  waveHeight: string
  windSpeed: string
  notes: string
}
type SessionForm = Omit<Session, 'id'>

const emptyForm: SessionForm = { date: '', location: '', duration: '', waveHeight: '', windSpeed: '', notes: '' }
const languageOptions = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'ar', label: 'العربية', flag: '🇲🇦' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'pt', label: 'Português', flag: '🇵🇹' },
]

function readSavedSessions(): Session[] {
  try {
    const saved = window.localStorage.getItem('surfSessions')
    if (!saved) return []
    const parsed: unknown = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed as Session[] : []
  } catch {
    return []
  }
}

function csvCell(value: string): string {
  let safeValue = String(value ?? '').replace(/\r?\n/g, ' ')
  if (/^[=+@\-]/.test(safeValue)) safeValue = "'" + safeValue
  return '"' + safeValue.replace(/"/g, '""') + '"'
}

export default function SurfSessionTracker() {
  const { t, i18n } = useTranslation()
  const [sessions, setSessions] = useState<Session[]>(readSavedSessions)
  const [formData, setFormData] = useState<SessionForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [lang, setLang] = useState(i18n.resolvedLanguage || i18n.language || 'en')
  const totalHours = sessions.reduce((total, session) => total + (Number(session.duration) || 0), 0)

  useEffect(() => {
    window.localStorage.setItem('surfSessions', JSON.stringify(sessions))
  }, [sessions])

  useEffect(() => {
    document.documentElement.dir = i18n.dir(lang)
    document.documentElement.lang = lang
  }, [i18n, lang])

  const changeLanguage = (nextLanguage: string) => {
    setLang(nextLanguage)
    void i18n.changeLanguage(nextLanguage)
    window.localStorage.setItem('appLanguage', nextLanguage)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData(previous => ({ ...previous, [name]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formData.date || !formData.location.trim()) return
    if (editingId) {
      setSessions(previous => previous.map(session => session.id === editingId
        ? { ...session, ...formData, location: formData.location.trim() }
        : session))
      setEditingId(null)
    } else {
      const newSession: Session = {
        ...formData, location: formData.location.trim(),
        id: Date.now().toString() + Math.random().toString(36).slice(2),
      }
      setSessions(previous => [newSession, ...previous])
    }
    setFormData(emptyForm)
  }

  const startEditing = (session: Session) => {
    setEditingId(session.id)
    setFormData({ date: session.date, location: session.location, duration: session.duration, waveHeight: session.waveHeight, windSpeed: session.windSpeed, notes: session.notes })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setFormData(emptyForm)
  }

  const deleteSession = (id: string) => {
    setSessions(previous => previous.filter(session => session.id !== id))
    if (editingId === id) cancelEditing()
  }

  const exportCSV = () => {
    if (sessions.length === 0) return
    const headers = [t('date'), t('spot'), t('duration'), t('waveHeight'), t('windSpeed'), t('notes')]
    const rows = sessions.map(session => [session.date, session.location, session.duration, session.waveHeight, session.windSpeed, session.notes])
    const csv = '\uFEFF' + [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const now = new Date()
    const dateStamp = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')
    link.href = objectUrl
    link.download = 'surf-sessions-' + dateStamp + '.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-top">
          <div className="brand-mark"><Waves size={27} strokeWidth={2.4} /></div>
          <div className="language-control">
            <Globe2 size={17} />
            <select aria-label={t('language')} value={lang} onChange={event => changeLanguage(event.target.value)}>
              {languageOptions.map(option => (
                <option key={option.value} value={option.value}>{option.flag} {option.label}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="eyebrow">{t('eyebrow')}</p>
        <h1>{t('title')}</h1>
        <p className="hero-description">{t('subtitle')}</p>
        <div className="hero-wave hero-wave-one" />
        <div className="hero-wave hero-wave-two" />
      </section>

      <section className="stats-grid" aria-label={t('summary')}>
        <article className="stat-card">
          <div className="stat-icon"><Activity size={19} /></div>
          <div><span>{t('totalSessions')}</span><strong>{sessions.length}</strong></div>
        </article>
        <article className="stat-card">
          <div className="stat-icon"><Clock3 size={19} /></div>
          <div><span>{t('totalHours')}</span><strong>{totalHours.toFixed(1)} <small>{t('hoursUnit')}</small></strong></div>
        </article>
      </section>

      <section className="panel form-panel">
        <div className="section-heading">
          <div><p className="eyebrow">{t('newEntry')}</p><h2>{editingId ? t('editSession') : t('addSession')}</h2></div>
          <span className="heading-icon"><Plus size={22} /></span>
        </div>
        <form onSubmit={handleSubmit} className="session-form">
          <div className="field-grid">
            <label className="field">
              <span><CalendarDays size={16} />{t('date')}</span>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </label>
            <label className="field">
              <span><MapPin size={16} />{t('spot')}</span>
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder={t('spotPlaceholder')} required />
            </label>
            <label className="field">
              <span><Clock3 size={16} />{t('duration')}</span>
              <input type="number" name="duration" min="0.5" step="0.5" value={formData.duration} onChange={handleChange} placeholder="2.0" />
            </label>
            <label className="field">
              <span><Waves size={16} />{t('waveHeight')}</span>
              <input type="number" name="waveHeight" min="0" step="0.1" value={formData.waveHeight} onChange={handleChange} placeholder="1.5" />
            </label>
            <label className="field">
              <span><Wind size={16} />{t('windSpeed')}</span>
              <input type="number" name="windSpeed" min="0" step="1" value={formData.windSpeed} onChange={handleChange} placeholder="12" />
            </label>
          </div>
          <label className="field">
            <span>{t('notes')}</span>
            <textarea name="notes" rows={3} value={formData.notes} onChange={handleChange} placeholder={t('notesPlaceholder')} />
          </label>
          <div className="form-actions">
            {editingId && <button className="button button-secondary" type="button" onClick={cancelEditing}><X size={18} /> {t('cancelEdit')}</button>}
            <button className="button button-primary" type="submit">{editingId ? <Save size={18} /> : <Plus size={18} />} {editingId ? t('updateSession') : t('saveSession')}</button>
          </div>
        </form>
      </section>

      <section className="panel sessions-panel">
        <div className="section-heading sessions-heading">
          <div><p className="eyebrow">{t('yourLog')}</p><h2>{t('sessions')}</h2></div>
          <button className="button button-export" type="button" onClick={exportCSV} disabled={sessions.length === 0}>
            <Download size={17} /> {t('exportCSV')}
          </button>
        </div>
        {sessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Waves size={28} /></div>
            <p>{t('emptyTitle')}</p><span>{t('emptySubtitle')}</span>
          </div>
        ) : (
          <div className="session-list">
            {sessions.map(session => (
              <article className="session-item" key={session.id}>
                <div className="session-main">
                  <div className="session-title-row"><h3>{session.location}</h3><span className="session-date">{session.date}</span></div>
                  <div className="session-metrics">
                    {session.duration && <span><Clock3 size={14} />{session.duration} {t('hoursUnit')}</span>}
                    {session.waveHeight && <span><Waves size={14} />{session.waveHeight} m</span>}
                    {session.windSpeed && <span><Wind size={14} />{session.windSpeed} km/h</span>}
                  </div>
                  {session.notes && <p className="session-notes">{session.notes}</p>}
                </div>
                <div className="session-actions">
                <button className="icon-button edit-button" type="button" onClick={() => startEditing(session)} aria-label={t('edit')} title={t('edit')}>
                  <Pencil size={17} />
                </button>
                <button className="icon-button delete-button" type="button" onClick={() => deleteSession(session.id)} aria-label={t('delete')} title={t('delete')}>
                  <Trash2 size={17} />
                </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <p className="privacy-note">{t('localStorageNote')}</p>
    </main>
  )
}
