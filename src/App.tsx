import { useState, useMemo } from 'react'
import { TOILETS, AMENITY_META, DISTRICTS, MAP_POSITIONS, type Toilet, type Amenity } from './data'

// ─── Design constants ─────────────────────────────────────────────────────────

const USER_LOCATION = { lat: 35.7295, lng: 139.7109 } // Mocked current location for prototype UI
const PRIORITY_AMENITIES: Amenity[] = ['accessible', 'baby', 'ostomate', 'open24h', 'washlet']
const WALKING_METERS_PER_MINUTE = 75

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toRad(value: number) {
  return (value * Math.PI) / 180
}

function distanceMeters(toilet: Toilet) {
  const earthRadius = 6371000
  const dLat = toRad(toilet.lat - USER_LOCATION.lat)
  const dLng = toRad(toilet.lng - USER_LOCATION.lng)
  const lat1 = toRad(USER_LOCATION.lat)
  const lat2 = toRad(toilet.lat)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return Math.round(earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

function formatDistance(meters: number) {
  if (meters < 950) return `${Math.max(60, Math.round(meters / 10) * 10)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

function walkMinutes(toilet: Toilet) {
  return Math.max(1, Math.round(distanceMeters(toilet) / WALKING_METERS_PER_MINUTE))
}

function getSortedToilets(toilets: Toilet[]) {
  return [...toilets].sort((a, b) => distanceMeters(a) - distanceMeters(b))
}

function getVisibleAmenities(toilet: Toilet) {
  const priority = PRIORITY_AMENITIES.filter(a => toilet.amenities.includes(a))
  const remaining = toilet.amenities.filter(a => !priority.includes(a))
  return [...priority, ...remaining]
}

function statusColor(toilet: Toilet) {
  if (toilet.isVerified) return '#1a9e8f'
  if (toilet.isUserSubmitted) return '#e8a020'
  return '#888884'
}

function statusLabel(toilet: Toilet) {
  if (toilet.isVerified) return 'Verified'
  if (toilet.isUserSubmitted) return 'Community'
  return 'Needs check'
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="10" height="10" viewBox="0 0 12 12" fill={i <= Math.round(rating) ? '#e8a020' : '#ddd'}>
          <polygon points="6,1 7.8,4.2 11.4,4.7 8.7,7.3 9.4,11 6,9.1 2.6,11 3.3,7.3 0.6,4.7 4.2,4.2" />
        </svg>
      ))}
    </span>
  )
}

function AmenityBadge({ amenity, compact = false }: { amenity: Amenity; compact?: boolean }) {
  const m = AMENITY_META[amenity]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: compact ? '3px' : '5px',
      background: m.color + '18', color: m.color,
      border: `1px solid ${m.color}30`,
      borderRadius: '999px',
      padding: compact ? '3px 7px' : '6px 10px',
      fontSize: compact ? '10px' : '11px', fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      <span aria-hidden="true">{m.icon}</span> {m.label}
    </span>
  )
}

function TravelPill({ toilet, compact = false }: { toilet: Toilet; compact?: boolean }) {
  const meters = distanceMeters(toilet)
  const minutes = walkMinutes(toilet)
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: compact ? 'flex-end' : 'flex-start',
      background: compact ? 'transparent' : '#e6f5f3',
      border: compact ? 'none' : '1px solid #cce9e5',
      borderRadius: compact ? 0 : '14px',
      padding: compact ? 0 : '10px 12px',
      minWidth: compact ? '64px' : 'auto',
    }}>
      <span style={{ fontSize: compact ? '15px' : '20px', fontWeight: 800, color: '#127a6e', letterSpacing: '-0.03em', lineHeight: 1 }}>{minutes} min</span>
      <span style={{ fontSize: compact ? '10px' : '12px', color: '#5d8f86', fontWeight: 700, marginTop: compact ? '3px' : '5px' }}>{formatDistance(meters)} walk</span>
    </div>
  )
}

function StatusBadge({ toilet }: { toilet: Toilet }) {
  const color = statusColor(toilet)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: color + '14', color,
      border: `1px solid ${color}28`,
      fontSize: '10px', fontWeight: 800, padding: '4px 8px',
      borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.04em',
    }}>
      {toilet.isVerified ? '✓' : toilet.isUserSubmitted ? '!' : '?'} {statusLabel(toilet)}
    </span>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const MapIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
  </svg>
)

const ListIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none" />
  </svg>
)

const PlusIcon = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const CloseIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const CheckIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

const NavigationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 11 22 2 13 21 11 13 3 11" />
  </svg>
)

// ─── Detail Sheet ─────────────────────────────────────────────────────────────

function DetailSheet({ toilet, onClose }: { toilet: Toilet; onClose: () => void }) {
  const amenities = getVisibleAmenities(toilet)

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.28)' }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: '#fff', borderRadius: '22px 22px 0 0',
        padding: '0 0 38px',
        boxShadow: '0 -6px 36px rgba(0,0,0,0.18)',
        maxHeight: '76%', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: '38px', height: '4px', background: '#e0e0da', borderRadius: '2px' }} />
        </div>

        <div style={{ overflowY: 'auto', padding: '16px 20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '7px' }}>
                <StatusBadge toilet={toilet} />
                <span style={{ background: toilet.amenities.includes('open24h') ? '#7c5cbf14' : '#f0f0ec', color: toilet.amenities.includes('open24h') ? '#7c5cbf' : '#777', border: toilet.amenities.includes('open24h') ? '1px solid #7c5cbf28' : '1px solid #e0e0da', fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {toilet.amenities.includes('open24h') ? 'Open 24h' : 'Hours unknown'}
                </span>
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#1a1a1a', lineHeight: '1.25', letterSpacing: '-0.02em' }}>{toilet.name}</div>
              <div style={{ fontFamily: 'var(--font-jp)', fontSize: '12px', color: '#999', marginTop: '3px' }}>{toilet.nameJp}</div>
            </div>
            <button onClick={onClose} style={{ background: '#f0f0ec', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, color: '#666' }}>
              <CloseIcon />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
            <TravelPill toilet={toilet} />
            <div style={{ background: '#f7f7f5', border: '1px solid #e8e8e4', borderRadius: '14px', padding: '10px 12px' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a1a', lineHeight: 1 }}>{toilet.rating > 0 ? toilet.rating.toFixed(1) : '—'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                <StarRating rating={toilet.rating} />
                <span style={{ fontSize: '11px', color: '#888', fontWeight: 700 }}>{toilet.reviews} reviews</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#999', letterSpacing: '0.07em', marginBottom: '8px', textTransform: 'uppercase' }}>Key amenities · 主要設備</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {amenities.slice(0, 6).map(a => <AmenityBadge key={a} amenity={a} />)}
              {amenities.length === 0 && <span style={{ fontSize: '12px', color: '#bbb' }}>No amenities listed yet</span>}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#f7f7f5', borderRadius: '12px', padding: '11px 12px', marginBottom: '14px' }}>
            <span style={{ fontSize: '14px', flexShrink: 0 }}>📍</span>
            <div>
              <div style={{ fontSize: '12px', color: '#555', lineHeight: '1.45', fontWeight: 600 }}>{toilet.address}</div>
              <div style={{ fontFamily: 'var(--font-jp)', fontSize: '11px', color: '#aaa', marginTop: '2px' }}>{toilet.districtJp} area</div>
            </div>
          </div>

          {toilet.description && (
            <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.65', marginBottom: '14px' }}>
              {toilet.description}
            </div>
          )}

          <button style={{ width: '100%', background: '#1a9e8f', color: '#fff', border: 'none', borderRadius: '14px', padding: '15px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', letterSpacing: '-0.01em', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <NavigationIcon /> Directions · 経路
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
            <button style={{ background: '#f7f7f5', color: '#555', border: '1.5px solid #e8e8e4', borderRadius: '12px', padding: '11px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Save</button>
            <button style={{ background: '#f7f7f5', color: '#555', border: '1.5px solid #e8e8e4', borderRadius: '12px', padding: '11px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Report issue</button>
          </div>
          <div style={{ textAlign: 'center', fontSize: '11px', color: '#bbb', paddingBottom: '4px' }}>Last verified {toilet.lastUpdated}</div>
        </div>
      </div>
    </div>
  )
}

// ─── Map Screen ───────────────────────────────────────────────────────────────

function MapScreen({ toilets, selected, onSelect }: { toilets: Toilet[]; selected: Toilet | null; onSelect: (t: Toilet | null) => void }) {
  const visibleIds = new Set(toilets.map(t => t.id))
  const nearest = getSortedToilets(toilets)[0]

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#e8ede8' }}>
      <img
        src="https://images.unsplash.com/photo-1573455494060-c5595004fb6c?w=800&h=900&fit=crop&auto=format"
        alt="Tokyo map"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.16, filter: 'saturate(0)' }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(170,185,170,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(170,185,170,0.5) 1px, transparent 1px)`,
        backgroundSize: '52px 52px',
      }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
        <rect x="0%" y="46%" width="100%" height="2.5%" fill="rgba(255,255,255,0.72)" />
        <rect x="0%" y="70%" width="100%" height="1.8%" fill="rgba(255,255,255,0.6)" />
        <rect x="28%" y="0%" width="2%" height="100%" fill="rgba(255,255,255,0.72)" />
        <rect x="54%" y="0%" width="1.8%" height="100%" fill="rgba(255,255,255,0.6)" />
        <rect x="70%" y="0%" width="1.4%" height="100%" fill="rgba(255,255,255,0.5)" />
        <rect x="14%" y="0%" width="1.4%" height="100%" fill="rgba(255,255,255,0.5)" />
        <rect x="0%" y="26%" width="100%" height="1.4%" fill="rgba(255,255,255,0.5)" />
        <rect x="0%" y="82%" width="60%" height="1.2%" fill="rgba(255,255,255,0.45)" />
      </svg>

      {[
        { label: 'Ikebukuro', x: '23%', y: '14%' },
        { label: 'Shinjuku', x: '21%', y: '28%' },
        { label: 'Shibuya', x: '18%', y: '62%' },
        { label: 'Harajuku', x: '18%', y: '43%' },
        { label: 'Ueno', x: '63%', y: '21%' },
        { label: 'Asakusa', x: '76%', y: '18%' },
        { label: 'Ginza', x: '51%', y: '73%' },
        { label: 'Roppongi', x: '27%', y: '76%' },
        { label: 'Akihabara', x: '66%', y: '30%' },
      ].map(d => (
        <div key={d.label} style={{ position: 'absolute', left: d.x, top: d.y, transform: 'translate(-50%,-50%)', fontSize: '9px', fontWeight: 700, color: '#9aaa9a', letterSpacing: '0.05em', pointerEvents: 'none', textTransform: 'uppercase' }}>{d.label}</div>
      ))}

      <div style={{ position: 'absolute', left: '22%', top: '16%', transform: 'translate(-50%, -50%)', width: '16px', height: '16px', borderRadius: '999px', background: '#1a9e8f', border: '3px solid #fff', boxShadow: '0 0 0 7px rgba(26,158,143,0.18)', zIndex: 4 }} />

      {TOILETS.filter(t => visibleIds.has(t.id)).map(toilet => {
        const pos = MAP_POSITIONS[toilet.id]
        if (!pos) return null
        const isSelected = selected?.id === toilet.id
        const color = statusColor(toilet)
        const hasAccessible = toilet.amenities.includes('accessible')
        return (
          <button key={toilet.id} onClick={() => onSelect(isSelected ? null : toilet)}
            style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, transform: `translate(-50%, -100%) scale(${isSelected ? 1.26 : 1})`, background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'transform 160ms', zIndex: isSelected ? 10 : 5 }}>
            <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
              <path d="M16 1.6C8.7 1.6 2.8 7.5 2.8 14.8C2.8 25.1 16 38.8 16 38.8S29.2 25.1 29.2 14.8C29.2 7.5 23.3 1.6 16 1.6z" fill={isSelected ? '#127a6e' : color} stroke="#fff" strokeWidth="2.4" />
              <text x="16" y="17.6" textAnchor="middle" dominantBaseline="middle" fontSize="13" fill="#fff">🚾</text>
            </svg>
            {hasAccessible && (
              <div style={{ position: 'absolute', right: '-3px', top: '1px', width: '15px', height: '15px', borderRadius: '50%', background: '#1a7fce', border: '2px solid #fff', color: '#fff', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>♿</div>
            )}
            {isSelected && (
              <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', background: '#1a1a1a', color: '#fff', fontSize: '10px', padding: '4px 8px', borderRadius: '999px', whiteSpace: 'nowrap', marginTop: '4px', fontWeight: 800 }}>
                {walkMinutes(toilet)} min walk
              </div>
            )}
          </button>
        )
      })}

      {nearest && (
        <button onClick={() => onSelect(nearest)} style={{ position: 'absolute', left: '16px', right: '16px', bottom: '18px', background: 'rgba(255,255,255,0.96)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '18px', padding: '12px 14px', boxShadow: '0 8px 28px rgba(0,0,0,0.15)', backdropFilter: 'blur(10px)', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#1a9e8f', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nearest usable toilet</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>{nearest.name}</div>
          </div>
          <TravelPill toilet={nearest} compact />
        </button>
      )}


      {selected && <DetailSheet toilet={selected} onClose={() => onSelect(null)} />}
    </div>
  )
}

// ─── List Screen ──────────────────────────────────────────────────────────────

function ListScreen({ toilets, onSelect }: { toilets: Toilet[]; onSelect: (t: Toilet) => void }) {
  const sorted = getSortedToilets(toilets)

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {sorted.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#aaa' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🚾</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#666', marginBottom: '4px' }}>No results</div>
          <div style={{ fontFamily: 'var(--font-jp)', fontSize: '12px' }}>見つかりませんでした</div>
        </div>
      )}
      {sorted.map(t => {
        const amenities = getVisibleAmenities(t)
        return (
          <button key={t.id} onClick={() => onSelect(t)} style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: '16px', padding: '14px 15px', textAlign: 'left', cursor: 'pointer', width: '100%', transition: 'border-color 120ms', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <StatusBadge toilet={t} />
                  {t.amenities.includes('open24h') && <span style={{ background: '#7c5cbf14', color: '#7c5cbf', border: '1px solid #7c5cbf28', fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Open 24h</span>}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a1a1a', lineHeight: '1.3', letterSpacing: '-0.01em' }}>{t.name}</div>
                <div style={{ fontFamily: 'var(--font-jp)', fontSize: '11px', color: '#aaa', marginTop: '2px' }}>{t.nameJp}</div>
              </div>
              <TravelPill toilet={t} compact />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
              {amenities.slice(0, 4).map(a => <AmenityBadge key={a} amenity={a} compact />)}
              {amenities.length > 4 && <span style={{ fontSize: '10px', color: '#aaa', alignSelf: 'center', fontWeight: 700 }}>+{amenities.length - 4}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#aaa' }}>
              <span style={{ fontFamily: 'var(--font-jp)', fontSize: '11px', color: '#888', fontWeight: 700 }}>{t.districtJp}</span>
              <span style={{ color: '#ddd' }}>·</span>
              <StarRating rating={t.rating} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#888' }}>{t.rating > 0 ? t.rating.toFixed(1) : '—'}</span>
              <span style={{ color: '#ddd' }}>·</span>
              <span style={{ fontSize: '11px', color: '#aaa' }}>Updated {t.lastUpdated}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ─── Add Screen ───────────────────────────────────────────────────────────────

function AddScreen({ onAdd, onBack }: { onAdd: (t: Toilet) => void; onBack: () => void }) {
  const [name, setName] = useState('')
  const [nameJp, setNameJp] = useState('')
  const [address, setAddress] = useState('')
  const [district, setDistrict] = useState('Ikebukuro')
  const [selected, setSelected] = useState<Set<Amenity>>(new Set())
  const [desc, setDesc] = useState('')
  const [done, setDone] = useState(false)

  const toggle = (a: Amenity) => setSelected(s => { const n = new Set(s); n.has(a) ? n.delete(a) : n.add(a); return n })

  const submit = () => {
    if (!name || !address) return
    const DIST_JP: Record<string, string> = { Shibuya: '渋谷', Shinjuku: '新宿', Harajuku: '原宿', Akihabara: '秋葉原', Ueno: '上野', Asakusa: '浅草', Ginza: '銀座', Roppongi: '六本木', Ikebukuro: '池袋' }
    onAdd({ id: `u${Date.now()}`, name, nameJp: nameJp || name, district, districtJp: DIST_JP[district] || district, address, lat: 35.729, lng: 139.711, amenities: Array.from(selected), rating: 0, reviews: 0, isVerified: false, isUserSubmitted: true, lastUpdated: new Date().toISOString().slice(0, 10), description: desc || undefined })
    setDone(true)
  }

  if (done) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center', gap: '16px', background: '#fff' }}>
      <div style={{ width: '72px', height: '72px', background: '#e6f5f3', color: '#1a9e8f', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CheckIcon />
      </div>
      <div>
        <div style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>Submitted for review</div>
        <div style={{ fontFamily: 'var(--font-jp)', fontSize: '13px', color: '#888', lineHeight: '1.7' }}>審査のために送信されました<br />Thanks for helping improve the map.</div>
      </div>
      <button onClick={onBack} style={{ background: '#1a9e8f', color: '#fff', border: 'none', borderRadius: '12px', padding: '13px 32px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', marginTop: '8px' }}>Back to Map</button>
    </div>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 32px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#fff' }}>
      <div style={{ fontSize: '13px', color: '#777', lineHeight: '1.6', background: '#f7f7f5', borderRadius: '12px', padding: '12px 14px', border: '1px solid #e8e8e4' }}>
        Add is kept as a secondary action so people can find a toilet fast first. Community submissions are reviewed before becoming verified.
      </div>

      {[
        { label: 'Name (English)', labelJp: '名称（英語）', val: name, set: setName, ph: 'Ikebukuro West Gate Toilet', required: true },
        { label: 'Name (Japanese)', labelJp: '名称（日本語）', val: nameJp, set: setNameJp, ph: '池袋西口公園トイレ', required: false },
        { label: 'Address', labelJp: '住所', val: address, set: setAddress, ph: '1-1 Nishiikebukuro, Toshima City', required: true },
      ].map(f => (
        <div key={f.label}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#333' }}>{f.label}</span>
            <span style={{ fontFamily: 'var(--font-jp)', fontSize: '11px', color: '#bbb' }}>{f.labelJp}</span>
            {f.required && <span style={{ color: '#d94f3a', fontSize: '11px' }}>*</span>}
          </div>
          <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} style={{ width: '100%', background: '#f7f7f5', border: '1.5px solid #e0e0da', borderRadius: '11px', padding: '12px 14px', fontSize: '14px', color: '#1a1a1a', outline: 'none', fontFamily: 'var(--font-jp)' }} />
        </div>
      ))}

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#333' }}>District</span>
          <span style={{ fontFamily: 'var(--font-jp)', fontSize: '11px', color: '#bbb' }}>地区</span>
          <span style={{ color: '#d94f3a', fontSize: '11px' }}>*</span>
        </div>
        <select value={district} onChange={e => setDistrict(e.target.value)} style={{ width: '100%', background: '#f7f7f5', border: '1.5px solid #e0e0da', borderRadius: '11px', padding: '12px 14px', fontSize: '14px', color: '#1a1a1a', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
          {DISTRICTS.slice(1).map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#333' }}>Amenities</span>
          <span style={{ fontFamily: 'var(--font-jp)', fontSize: '11px', color: '#bbb' }}>設備</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
          {(Object.keys(AMENITY_META) as Amenity[]).map(a => (
            <button key={a} onClick={() => toggle(a)} style={{
              background: selected.has(a) ? AMENITY_META[a].color + '18' : '#f7f7f5',
              border: `1.5px solid ${selected.has(a) ? AMENITY_META[a].color : '#e0e0da'}`,
              borderRadius: '11px', padding: '10px 12px', cursor: 'pointer',
              fontSize: '12px', fontWeight: 700, color: selected.has(a) ? AMENITY_META[a].color : '#666',
              transition: 'all 120ms', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <span>{AMENITY_META[a].icon}</span> {AMENITY_META[a].label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#333', marginBottom: '5px' }}>Notes <span style={{ fontFamily: 'var(--font-jp)', color: '#bbb', fontWeight: 400 }}>メモ</span></div>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Mention locked doors, poor access, broken facilities, or exact placement." style={{ width: '100%', background: '#f7f7f5', border: '1.5px solid #e0e0da', borderRadius: '11px', padding: '12px 14px', fontSize: '13px', color: '#1a1a1a', outline: 'none', resize: 'none', lineHeight: '1.6', fontFamily: 'var(--font-jp)' }} />
      </div>

      <button onClick={submit} disabled={!name || !address} style={{ width: '100%', background: !name || !address ? '#d0d0cc' : '#1a9e8f', color: '#fff', border: 'none', borderRadius: '14px', padding: '15px', fontSize: '15px', fontWeight: 800, cursor: !name || !address ? 'not-allowed' : 'pointer', transition: 'background 140ms', marginTop: '4px' }}>
        Submit Location · 送信
      </button>
    </div>
  )
}

// ─── Settings Screen ─────────────────────────────────────────────────────────

type SettingsPage = 'main' | 'how-to-use' | 'terms' | 'privacy' | 'contact' | 'language'

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ja', label: 'Japanese', native: '日本語' },
  { code: 'zh', label: 'Chinese', native: '中文' },
  { code: 'ko', label: 'Korean', native: '한국어' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'es', label: 'Spanish', native: 'Español' },
]

function SettingsScreen() {
  const [page, setPage] = useState<SettingsPage>('main')
  const [lang, setLang] = useState('en')
  const [notifications, setNotifications] = useState(true)
  const [distanceUnit, setDistanceUnit] = useState<'m' | 'ft'>('m')

  const ChevronRight = () => (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#ccc" strokeWidth={2.5}><polyline points="9 18 15 12 9 6" /></svg>
  )

  function SubPage({ title, titleJp, children }: { title: string; titleJp: string; children: React.ReactNode }) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ background: '#fff', padding: '10px 20px 14px', borderBottom: '1px solid #ebebeb', flexShrink: 0 }}>
          <button onClick={() => setPage('main')} style={{ background: 'none', border: 'none', padding: 0, color: '#1a9e8f', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><polyline points="15 18 9 12 15 6" /></svg> Back
          </button>
          <div style={{ fontSize: '19px', fontWeight: 800, letterSpacing: '-0.02em' }}>{title}</div>
          <div style={{ fontFamily: 'var(--font-jp)', fontSize: '12px', color: '#aaa', marginTop: '1px' }}>{titleJp}</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {children}
        </div>
      </div>
    )
  }

  if (page === 'language') return (
    <SubPage title="Language" titleJp="言語設定">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {LANGUAGES.map(l => (
          <button key={l.code} onClick={() => setLang(l.code)} style={{ background: '#fff', border: `1.5px solid ${lang === l.code ? '#1a9e8f' : '#e8e8e4'}`, borderRadius: '14px', padding: '14px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 120ms' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a' }}>{l.native}</div>
              <div style={{ fontSize: '11px', color: '#aaa', marginTop: '1px' }}>{l.label}</div>
            </div>
            {lang === l.code && <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#1a9e8f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg></div>}
          </button>
        ))}
      </div>
    </SubPage>
  )

  if (page === 'how-to-use') return (
    <SubPage title="How to Use" titleJp="使い方">
      {[
        { icon: '🗺', title: 'Find a restroom', body: 'Use the Map tab to see all nearby restrooms. Tap a pin to view details and get directions.' },
        { icon: '🔍', title: 'Search & filter', body: 'Use the search bar to find restrooms by name or area. Filter by district or amenity using the filter button.' },
        { icon: '♿', title: 'Accessibility', body: 'Look for the ♿ badge on map pins — these restrooms have accessible facilities including wider stalls and support rails.' },
        { icon: '🚿', title: 'Washlet (ウォシュレット)', body: 'Washlet-equipped restrooms have electronic bidet seats. Very common in Tokyo — look for the Washlet badge.' },
        { icon: '➕', title: 'Add a restroom', body: 'Know a restroom we\'re missing? Tap Add in the bottom nav and submit its location. Community submissions are reviewed before being verified.' },
        { icon: '⭐', title: 'Ratings', body: 'Ratings are crowdsourced from users. Verified locations have been checked by our team.' },
      ].map(s => (
        <div key={s.title} style={{ marginBottom: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{ width: '40px', height: '40px', background: '#e6f5f3', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{s.icon}</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a1a1a', marginBottom: '4px' }}>{s.title}</div>
            <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>{s.body}</div>
          </div>
        </div>
      ))}
    </SubPage>
  )

  if (page === 'terms') return (
    <SubPage title="Terms of Service" titleJp="利用規約">
      {[
        ['Acceptance', 'By using Tokyo Toilets, you agree to these terms. If you do not agree, please discontinue use of the app.'],
        ['Accuracy of Information', 'We strive to maintain accurate restroom data, but cannot guarantee that all locations are current, open, or accessible. Always verify before making decisions.'],
        ['User Submissions', 'When you submit a restroom location, you confirm the information is accurate to your knowledge. Submissions are reviewed before publishing. We reserve the right to remove inaccurate entries.'],
        ['Prohibited Use', 'You may not use this app to submit false information, spam the submission system, or scrape data for commercial purposes without permission.'],
        ['Limitation of Liability', 'Tokyo Toilets is provided as-is. We are not responsible for any inconvenience, loss, or harm arising from reliance on information in the app.'],
        ['Changes to Terms', 'We may update these terms at any time. Continued use of the app constitutes acceptance of revised terms.'],
        ['Contact', 'Questions about these terms? Email us at legal@tokyotoilets.app'],
      ].map(([title, body]) => (
        <div key={title as string} style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#1a1a1a', marginBottom: '5px' }}>{title}</div>
          <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.65' }}>{body}</div>
        </div>
      ))}
      <div style={{ fontSize: '11px', color: '#bbb', marginTop: '12px' }}>Last updated: January 2026</div>
    </SubPage>
  )

  if (page === 'privacy') return (
    <SubPage title="Privacy Policy" titleJp="プライバシーポリシー">
      {[
        ['Data We Collect', 'We collect your approximate location (with permission) to show nearby restrooms. If you submit a location, we store the submitted data and timestamp. We do not collect names or personal identifiers unless you contact us directly.'],
        ['Location Data', 'Location is used only to sort and display nearby restrooms. It is not stored on our servers or shared with third parties.'],
        ['Analytics', 'We use anonymised analytics to understand how features are used. No personally identifiable information is included in analytics data.'],
        ['Third Parties', 'We do not sell your data. Map imagery is sourced from licensed providers. Links to mapping apps (e.g. Google Maps) are governed by those apps\' own privacy policies.'],
        ['Data Retention', 'User-submitted restroom data is retained indefinitely to improve the map. Analytics data is retained for 12 months.'],
        ['Your Rights', 'You may request deletion of any data you submitted by contacting us at privacy@tokyotoilets.app'],
      ].map(([title, body]) => (
        <div key={title as string} style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#1a1a1a', marginBottom: '5px' }}>{title}</div>
          <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.65' }}>{body}</div>
        </div>
      ))}
      <div style={{ fontSize: '11px', color: '#bbb', marginTop: '12px' }}>Last updated: January 2026</div>
    </SubPage>
  )

  if (page === 'contact') return (
    <SubPage title="Contact Us" titleJp="お問い合わせ">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[
          { icon: '📧', label: 'General enquiries', value: 'hello@tokyotoilets.app', sub: 'We aim to respond within 2 business days' },
          { icon: '🐛', label: 'Report a bug', value: 'bugs@tokyotoilets.app', sub: 'Please include your device and OS version' },
          { icon: '🏛', label: 'Municipal partnerships', value: 'partnerships@tokyotoilets.app', sub: 'For local government or business collaboration' },
          { icon: '⚖️', label: 'Legal & privacy', value: 'legal@tokyotoilets.app', sub: 'Data requests and terms inquiries' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', border: '1.5px solid #e8e8e4', borderRadius: '14px', padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', background: '#e6f5f3', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{c.icon}</div>
            <div>
              <div style={{ fontSize: '11px', color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{c.label}</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#1a9e8f' }}>{c.value}</div>
              <div style={{ fontSize: '11px', color: '#aaa', marginTop: '3px' }}>{c.sub}</div>
            </div>
          </div>
        ))}
        <div style={{ background: '#f7f7f5', borderRadius: '14px', padding: '14px 16px', fontSize: '12px', color: '#888', lineHeight: '1.6', marginTop: '4px' }}>
          Tokyo Toilets is a community project. Response times may vary. For urgent accessibility concerns, please contact the relevant Tokyo ward office directly.
        </div>
      </div>
    </SubPage>
  )

  // Main settings page
  const currentLang = LANGUAGES.find(l => l.code === lang)

  function Row({ icon, label, sub, right, onClick }: { icon: string; label: string; sub?: string; right?: React.ReactNode; onClick?: () => void }) {
    return (
      <button onClick={onClick} disabled={!onClick} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: '13px 16px', cursor: onClick ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '13px' }}>
        <span style={{ fontSize: '18px', width: '24px', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>{label}</div>
          {sub && <div style={{ fontSize: '11px', color: '#aaa', marginTop: '1px' }}>{sub}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {right}
          {onClick && <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#ccc" strokeWidth={2.5}><polyline points="9 18 15 12 9 6" /></svg>}
        </div>
      </button>
    )
  }

  function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#aaa', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 16px', marginBottom: '4px' }}>{title}</div>
        <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #ebebeb' }}>
          {children}
        </div>
      </div>
    )
  }

  function Divider() {
    return <div style={{ height: '1px', background: '#f0f0ec', marginLeft: '53px' }} />
  }

  function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
      <div onClick={() => onChange(!value)} style={{ width: '42px', height: '24px', borderRadius: '12px', background: value ? '#1a9e8f' : '#ddd', position: 'relative', cursor: 'pointer', transition: 'background 180ms', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: '3px', left: value ? '21px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 180ms' }} />
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ background: '#fff', padding: '12px 20px 14px', borderBottom: '1px solid #ebebeb', flexShrink: 0 }}>
        <div style={{ fontSize: '19px', fontWeight: 800, letterSpacing: '-0.02em' }}>Settings</div>
        <div style={{ fontFamily: 'var(--font-jp)', fontSize: '12px', color: '#aaa', marginTop: '1px' }}>設定</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px' }}>

        <Section title="Preferences">
          <Row icon="🌐" label="Language" sub={currentLang?.native} onClick={() => setPage('language')} />
          <Divider />
          <Row icon="📏" label="Distance unit" right={
            <div style={{ display: 'flex', background: '#f0f0ec', borderRadius: '8px', padding: '2px' }}>
              {(['m', 'ft'] as const).map(u => (
                <button key={u} onClick={() => setDistanceUnit(u)} style={{ background: distanceUnit === u ? '#fff' : 'transparent', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: 700, color: distanceUnit === u ? '#1a1a1a' : '#aaa', cursor: 'pointer', boxShadow: distanceUnit === u ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>{u}</button>
              ))}
            </div>
          } />
          <Divider />
          <Row icon="🔔" label="Notifications" sub="Nearby restroom alerts" right={<Toggle value={notifications} onChange={setNotifications} />} />
        </Section>

        <Section title="Information">
          <Row icon="📖" label="How to use" sub="Guide to finding restrooms" onClick={() => setPage('how-to-use')} />
          <Divider />
          <Row icon="📋" label="Terms of Service" onClick={() => setPage('terms')} />
          <Divider />
          <Row icon="🔒" label="Privacy Policy" onClick={() => setPage('privacy')} />
          <Divider />
          <Row icon="✉️" label="Contact Us" sub="hello@tokyotoilets.app" onClick={() => setPage('contact')} />
        </Section>

        <Section title="About">
          <Row icon="🚾" label="Tokyo Toilets" sub="Version 1.0.0" />
          <Divider />
          <Row icon="🗾" label="Data coverage" sub="Tokyo 23 wards · 11,000+ locations" />
        </Section>

        <div style={{ textAlign: 'center', fontSize: '11px', color: '#ccc', padding: '8px 0 4px' }}>
          Made with 🙏 for visitors & locals in Tokyo
        </div>
      </div>
    </div>
  )
}

// ─── Auth Screens ─────────────────────────────────────────────────────────────

type AuthMode = 'field' | 'email' | 'phone'

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 6.294C4.672 4.167 6.656 3.58 9 3.58z"/>
  </svg>
)

const AppleLogo = () => (
  <svg width="17" height="20" viewBox="0 0 814 1000" fill="currentColor">
    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 484.8 0 340.9 0 202.1C0 90.4 50.9 22.1 140.5 22.1c57.8 0 102.5 38.5 138.4 38.5 34.1 0 87.5-41.5 150.6-41.5 24.3 0 108.2 1.9 162.4 78.9zm-220-131.4c-10.9-53.8 32.5-110.4 94.1-110.4 9.6 57.8-52.5 117.1-94.1 110.4z"/>
  </svg>
)

function SocialBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ width: '100%', background: '#fff', border: '1.5px solid #e0e0da', borderRadius: '14px', padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#1a1a1a', transition: 'background 120ms' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#f7f7f5')}
      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
      {icon}{label}
    </button>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ flex: 1, height: '1px', background: '#e8e8e4' }} />
      <span style={{ fontSize: '11px', color: '#bbb', fontWeight: 600 }}>{label}</span>
      <div style={{ flex: 1, height: '1px', background: '#e8e8e4' }} />
    </div>
  )
}

function InputField({ label, type, value, onChange, placeholder }: { label: string; type: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#555', marginBottom: '5px' }}>{label}</div>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', background: '#f7f7f5', border: '1.5px solid #e0e0da', borderRadius: '12px', padding: '12px 14px', fontSize: '14px', color: '#1a1a1a', outline: 'none', fontFamily: 'var(--font-ui)', transition: 'border-color 160ms' }}
        onFocus={e => (e.target.style.borderColor = '#1a9e8f')}
        onBlur={e => (e.target.style.borderColor = '#e0e0da')}
      />
    </div>
  )
}

function LoginScreen({ onLogin, onSignup }: { onLogin: () => void; onSignup: () => void }) {
  const [mode, setMode] = useState<AuthMode>('field')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  const isEmail = identifier.includes('@')
  const isPhone = /^\+?[\d\s-]{6,}$/.test(identifier)
  const canSubmit = (isEmail || isPhone) && password.length >= 6

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(160deg, #1a9e8f 0%, #127a6e 100%)', padding: '36px 28px 28px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🚾</div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Tokyo Toilets</div>
            <div style={{ fontFamily: 'var(--font-jp)', fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>東京のトイレマップ</div>
          </div>
        </div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', lineHeight: '1.2', letterSpacing: '-0.02em' }}>Welcome back</div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginTop: '5px' }}>Sign in to save favourites and contribute</div>
      </div>

      <div style={{ padding: '24px 24px 32px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        <SocialBtn icon={<GoogleLogo />} label="Continue with Google" onClick={onLogin} />
        <SocialBtn
          icon={<span style={{ color: '#1a1a1a' }}><AppleLogo /></span>}
          label="Continue with Apple"
          onClick={onLogin}
        />

        <Divider label="or sign in with" />

        {mode === 'field' && (
          <>
            <InputField label="Email or phone number" type="text" value={identifier} onChange={setIdentifier} placeholder="you@example.com or +81 90 0000 0000" />
            <div style={{ position: 'relative' }}>
              <InputField label="Password" type={showPass ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="••••••••" />
              <button onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: '12px', bottom: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#aaa', fontWeight: 600 }}>
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
            <div style={{ textAlign: 'right', marginTop: '-4px' }}>
              <button style={{ background: 'none', border: 'none', color: '#1a9e8f', fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Forgot password?</button>
            </div>
            <button onClick={onLogin} disabled={!canSubmit} style={{ width: '100%', background: canSubmit ? '#1a9e8f' : '#d0d0cc', color: '#fff', border: 'none', borderRadius: '14px', padding: '15px', fontSize: '15px', fontWeight: 800, cursor: canSubmit ? 'pointer' : 'not-allowed', transition: 'background 140ms', marginTop: '4px' }}>
              Sign In
            </button>
          </>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setMode('email')} style={{ flex: 1, background: mode === 'email' ? '#e6f5f3' : '#f7f7f5', border: `1.5px solid ${mode === 'email' ? '#1a9e8f' : '#e0e0da'}`, borderRadius: '12px', padding: '10px', fontSize: '12px', fontWeight: 700, color: mode === 'email' ? '#1a9e8f' : '#777', cursor: 'pointer' }}>
            📧 Email
          </button>
          <button onClick={() => setMode('phone')} style={{ flex: 1, background: mode === 'phone' ? '#e6f5f3' : '#f7f7f5', border: `1.5px solid ${mode === 'phone' ? '#1a9e8f' : '#e0e0da'}`, borderRadius: '12px', padding: '10px', fontSize: '12px', fontWeight: 700, color: mode === 'phone' ? '#1a9e8f' : '#777', cursor: 'pointer' }}>
            📱 Phone
          </button>
        </div>

        {mode === 'email' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <InputField label="Email" type="email" value={identifier} onChange={setIdentifier} placeholder="you@example.com" />
            <div style={{ position: 'relative' }}>
              <InputField label="Password" type={showPass ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="••••••••" />
              <button onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: '12px', bottom: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#aaa', fontWeight: 600 }}>{showPass ? 'Hide' : 'Show'}</button>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button style={{ background: 'none', border: 'none', color: '#1a9e8f', fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Forgot password?</button>
            </div>
            <button onClick={onLogin} style={{ width: '100%', background: '#1a9e8f', color: '#fff', border: 'none', borderRadius: '14px', padding: '14px', fontSize: '15px', fontWeight: 800, cursor: 'pointer' }}>Sign In</button>
          </div>
        )}

        {mode === 'phone' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <InputField label="Phone number" type="tel" value={identifier} onChange={setIdentifier} placeholder="+81 90 0000 0000" />
            <button onClick={onLogin} style={{ width: '100%', background: '#1a9e8f', color: '#fff', border: 'none', borderRadius: '14px', padding: '14px', fontSize: '15px', fontWeight: 800, cursor: 'pointer' }}>Send code</button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '12px' }}>
          <span style={{ fontSize: '13px', color: '#888' }}>Don't have an account? </span>
          <button onClick={onSignup} style={{ background: 'none', border: 'none', color: '#1a9e8f', fontSize: '13px', fontWeight: 800, cursor: 'pointer', padding: 0 }}>Create one</button>
        </div>

        <button onClick={onLogin} style={{ background: 'none', border: 'none', color: '#bbb', fontSize: '12px', cursor: 'pointer', textAlign: 'center', padding: '4px 0' }}>
          Continue as guest
        </button>
      </div>
    </div>
  )
}

function SignupScreen({ onSignup, onLogin }: { onSignup: () => void; onLogin: () => void }) {
  const [mode, setMode] = useState<AuthMode>('email')
  const [name, setName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const passwordMatch = password === confirm && password.length >= 8
  const canSubmit = name.length > 1 && identifier.length > 3 && passwordMatch && agreed

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(160deg, #1a9e8f 0%, #127a6e 100%)', padding: '36px 28px 28px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🚾</div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Tokyo Toilets</div>
            <div style={{ fontFamily: 'var(--font-jp)', fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>東京のトイレマップ</div>
          </div>
        </div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', lineHeight: '1.2', letterSpacing: '-0.02em' }}>Create account</div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginTop: '5px' }}>Join the community and help improve the map</div>
      </div>

      <div style={{ padding: '24px 24px 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <SocialBtn icon={<GoogleLogo />} label="Sign up with Google" onClick={onSignup} />
        <SocialBtn
          icon={<span style={{ color: '#1a1a1a' }}><AppleLogo /></span>}
          label="Sign up with Apple"
          onClick={onSignup}
        />

        <Divider label="or create with" />

        <div style={{ display: 'flex', gap: '8px' }}>
          {(['email', 'phone'] as AuthMode[]).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, background: mode === m ? '#e6f5f3' : '#f7f7f5', border: `1.5px solid ${mode === m ? '#1a9e8f' : '#e0e0da'}`, borderRadius: '12px', padding: '10px', fontSize: '12px', fontWeight: 700, color: mode === m ? '#1a9e8f' : '#777', cursor: 'pointer', textTransform: 'capitalize' }}>
              {m === 'email' ? '📧 Email' : '📱 Phone'}
            </button>
          ))}
        </div>

        <InputField label="Full name" type="text" value={name} onChange={setName} placeholder="Taro Yamamoto" />

        {mode === 'email' && (
          <>
            <InputField label="Email address" type="email" value={identifier} onChange={setIdentifier} placeholder="you@example.com" />
            <div style={{ position: 'relative' }}>
              <InputField label="Password" type={showPass ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="Min. 8 characters" />
              <button onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: '12px', bottom: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#aaa', fontWeight: 600 }}>{showPass ? 'Hide' : 'Show'}</button>
            </div>
            <InputField label="Confirm password" type={showPass ? 'text' : 'password'} value={confirm} onChange={setConfirm} placeholder="••••••••" />
            {confirm.length > 0 && !passwordMatch && (
              <div style={{ fontSize: '12px', color: '#d94f3a', marginTop: '-4px' }}>Passwords don't match or are too short (min. 8 chars)</div>
            )}
          </>
        )}

        {mode === 'phone' && (
          <>
            <InputField label="Phone number" type="tel" value={identifier} onChange={setIdentifier} placeholder="+81 90 0000 0000" />
            <div style={{ fontSize: '12px', color: '#888', background: '#f7f7f5', borderRadius: '10px', padding: '10px 12px', lineHeight: '1.5' }}>
              We'll send a verification code to this number. Standard SMS rates may apply.
            </div>
          </>
        )}

        {/* Terms checkbox */}
        <button onClick={() => setAgreed(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '10px', padding: 0, textAlign: 'left' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: `2px solid ${agreed ? '#1a9e8f' : '#d0d0cc'}`, background: agreed ? '#1a9e8f' : '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px', transition: 'all 140ms' }}>
            {agreed && <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg>}
          </div>
          <span style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>
            I agree to the <span style={{ color: '#1a9e8f', fontWeight: 700 }}>Terms of Service</span> and <span style={{ color: '#1a9e8f', fontWeight: 700 }}>Privacy Policy</span>
          </span>
        </button>

        <button onClick={onSignup} disabled={!canSubmit} style={{ width: '100%', background: canSubmit ? '#1a9e8f' : '#d0d0cc', color: '#fff', border: 'none', borderRadius: '14px', padding: '15px', fontSize: '15px', fontWeight: 800, cursor: canSubmit ? 'pointer' : 'not-allowed', transition: 'background 140ms', marginTop: '4px' }}>
          {mode === 'phone' ? 'Send Verification Code' : 'Create Account'}
        </button>

        <div style={{ textAlign: 'center', paddingTop: '4px' }}>
          <span style={{ fontSize: '13px', color: '#888' }}>Already have an account? </span>
          <button onClick={onLogin} style={{ background: 'none', border: 'none', color: '#1a9e8f', fontSize: '13px', fontWeight: 800, cursor: 'pointer', padding: 0 }}>Sign in</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

type Tab = 'map' | 'list' | 'add' | 'settings'

type AuthScreen = 'login' | 'signup' | 'app'

export default function App() {
  const [auth, setAuth] = useState<AuthScreen>('login')
  const [toilets, setToilets] = useState<Toilet[]>(TOILETS)
  const [tab, setTab] = useState<Tab>('map')
  const [selected, setSelected] = useState<Toilet | null>(null)
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('All')
  const [activeAmenities, setActiveAmenities] = useState<Set<Amenity>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const toggleAmenity = (a: Amenity) => setActiveAmenities(s => { const n = new Set(s); n.has(a) ? n.delete(a) : n.add(a); return n })

  const filtered = useMemo(() => {
    return toilets.filter(t => {
      const q = search.toLowerCase()
      if (q && !t.name.toLowerCase().includes(q) && !t.nameJp.includes(q) && !t.district.toLowerCase().includes(q)) return false
      if (district !== 'All' && t.district !== district) return false
      for (const a of activeAmenities) { if (!t.amenities.includes(a)) return false }
      return true
    })
  }, [toilets, search, district, activeAmenities])

  const sortedFiltered = useMemo(() => getSortedToilets(filtered), [filtered])
  const filterCount = (district !== 'All' ? 1 : 0) + activeAmenities.size

  const handleAdd = (t: Toilet) => {
    setToilets(prev => [...prev, t])
    setSelected(t)
  }

  const statusOnMap = !isAdding && tab === 'map'

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#1a1a22', padding: '20px 0' }}>
      <div style={{
        width: '390px', height: '844px',
        background: '#f7f7f5', borderRadius: '48px',
        boxShadow: '0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08), inset 0 0 0 2px #2a2a32',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative',
      }}>
        {auth === 'login' && (
          <LoginScreen onLogin={() => setAuth('app')} onSignup={() => setAuth('signup')} />
        )}
        {auth === 'signup' && (
          <SignupScreen onSignup={() => setAuth('app')} onLogin={() => setAuth('login')} />
        )}
        {auth !== 'app' ? null : <>
        <div style={{ height: '50px', background: statusOnMap ? 'transparent' : '#fff', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 28px 8px', flexShrink: 0, position: statusOnMap ? 'absolute' : 'relative', top: 0, left: 0, right: 0, zIndex: 40 }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: statusOnMap ? '#fff' : '#1a1a1a' }}>9:41</span>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            {[3, 3, 4, 4].map((h, i) => <div key={i} style={{ width: '3px', height: `${h + i * 1.5}px`, background: statusOnMap ? '#fff' : '#1a1a1a', borderRadius: '1px', opacity: i < 3 ? 1 : 0.4 }} />)}
            <svg width="16" height="12" viewBox="0 0 16 12" fill={statusOnMap ? '#fff' : '#1a1a1a'} style={{ marginLeft: '2px' }}>
              <path d="M8 2.4A8.5 8.5 0 0 0 .5 6.4l1.5 1.5A6.5 6.5 0 0 1 8 5.4a6.5 6.5 0 0 1 6 2.5l1.5-1.5A8.5 8.5 0 0 0 8 2.4z" opacity=".4" />
              <path d="M8 5.4a5 5 0 0 0-3.5 1.5l1.5 1.5A3 3 0 0 1 8 7.4a3 3 0 0 1 2 .9l1.5-1.5A5 5 0 0 0 8 5.4z" opacity=".7" />
              <circle cx="8" cy="10.4" r="1.5" />
            </svg>
            <div style={{ width: '22px', height: '11px', border: `1.5px solid ${statusOnMap ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.3)'}`, borderRadius: '3px', padding: '1.5px', marginLeft: '2px', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '14px', height: '6px', background: statusOnMap ? '#fff' : '#1a1a1a', borderRadius: '1.5px' }} />
            </div>
          </div>
        </div>

        {isAdding ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ background: '#fff', padding: '12px 20px 14px', borderBottom: '1px solid #ebebeb', flexShrink: 0 }}>
              <button onClick={() => setIsAdding(false)} style={{ background: 'none', border: 'none', padding: 0, color: '#1a9e8f', fontSize: '12px', fontWeight: 800, cursor: 'pointer', marginBottom: '8px' }}>← Back</button>
              <div style={{ fontSize: '19px', fontWeight: 800, letterSpacing: '-0.02em' }}>Add restroom</div>
              <div style={{ fontFamily: 'var(--font-jp)', fontSize: '12px', color: '#aaa', marginTop: '1px' }}>トイレを追加する</div>
            </div>
            <AddScreen onAdd={t => handleAdd(t)} onBack={() => { setIsAdding(false); setTab('map') }} />
          </div>
        ) : (
          <>
            {tab === 'map' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '58px', left: '16px', right: '16px', zIndex: 30 }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.96)', borderRadius: '16px', padding: '0 14px', gap: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.16)', backdropFilter: 'blur(8px)' }}>
                      <span style={{ fontSize: '14px', color: '#aaa' }}>🔍</span>
                      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search toilets… トイレを検索" style={{ background: 'none', border: 'none', outline: 'none', fontSize: '13px', padding: '12px 0', width: '100%', color: '#1a1a1a', fontFamily: 'var(--font-jp)' }} />
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)} style={{ background: filterCount > 0 ? '#1a9e8f' : 'rgba(255,255,255,0.96)', border: 'none', borderRadius: '16px', width: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.16)', backdropFilter: 'blur(8px)', color: filterCount > 0 ? '#fff' : '#555', flexShrink: 0, position: 'relative' }}>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                      {filterCount > 0 && <div style={{ position: 'absolute', top: '6px', right: '6px', width: '14px', height: '14px', background: '#fff', borderRadius: '50%', fontSize: '9px', fontWeight: 800, color: '#1a9e8f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{filterCount}</div>}
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
                    {(['accessible', 'open24h', 'baby'] as Amenity[]).map(a => (
                      <button key={a} onClick={() => toggleAmenity(a)} style={{ background: activeAmenities.has(a) ? AMENITY_META[a].color : 'rgba(255,255,255,0.92)', color: activeAmenities.has(a) ? '#fff' : AMENITY_META[a].color, border: 'none', borderRadius: '999px', padding: '7px 10px', fontSize: '11px', fontWeight: 800, boxShadow: '0 3px 12px rgba(0,0,0,0.12)', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                        {AMENITY_META[a].icon} {AMENITY_META[a].label}
                      </button>
                    ))}
                  </div>
                </div>

                {showFilters && (
                  <div style={{ position: 'absolute', top: '142px', left: '16px', right: '16px', zIndex: 40, background: 'rgba(255,255,255,0.98)', borderRadius: '18px', padding: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', backdropFilter: 'blur(12px)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#333' }}>Filters <span style={{ fontFamily: 'var(--font-jp)', color: '#aaa', fontWeight: 500 }}>絞り込み</span></div>
                      <button onClick={() => { setDistrict('All'); setActiveAmenities(new Set()) }} style={{ background: 'none', border: 'none', color: '#1a9e8f', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>Clear</button>
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#aaa', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '8px' }}>District</div>
                    <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '8px' }}>
                      {DISTRICTS.map(d => (
                        <button key={d} onClick={() => setDistrict(d)} style={{ background: district === d ? '#1a9e8f' : '#f0f0ec', border: 'none', borderRadius: '999px', padding: '6px 12px', fontSize: '11px', fontWeight: 800, color: district === d ? '#fff' : '#555', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>{d}</button>
                      ))}
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#aaa', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '8px' }}>All amenities</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(Object.keys(AMENITY_META) as Amenity[]).filter(a => a !== 'dryer').map(a => (
                        <button key={a} onClick={() => toggleAmenity(a)} style={{ background: activeAmenities.has(a) ? AMENITY_META[a].color + '20' : '#f0f0ec', border: `1.5px solid ${activeAmenities.has(a) ? AMENITY_META[a].color : 'transparent'}`, borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 700, color: activeAmenities.has(a) ? AMENITY_META[a].color : '#666', cursor: 'pointer' }}>
                          {AMENITY_META[a].icon} {AMENITY_META[a].label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <MapScreen toilets={sortedFiltered} selected={selected} onSelect={t => { setSelected(t); setShowFilters(false) }} />
              </div>
            )}

            {tab === 'settings' && <SettingsScreen />}

            {tab === 'list' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ background: '#fff', padding: '12px 16px', borderBottom: '1px solid #ebebeb', flexShrink: 0 }}>
                  <div style={{ fontSize: '19px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '2px' }}>Nearby toilets</div>
                  <div style={{ fontFamily: 'var(--font-jp)', fontSize: '12px', color: '#aaa', marginBottom: '12px' }}>徒歩時間順 · sorted by walking time</div>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#f7f7f5', border: '1.5px solid #e0e0da', borderRadius: '13px', padding: '0 14px', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '14px', color: '#aaa' }}>🔍</span>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search… トイレを検索" style={{ background: 'none', border: 'none', outline: 'none', fontSize: '13px', padding: '11px 0', width: '100%', color: '#1a1a1a', fontFamily: 'var(--font-jp)' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '2px' }}>
                    {DISTRICTS.map(d => (
                      <button key={d} onClick={() => setDistrict(d)} style={{ background: district === d ? '#1a9e8f' : '#f0f0ec', border: 'none', borderRadius: '999px', padding: '6px 12px', fontSize: '11px', fontWeight: 800, color: district === d ? '#fff' : '#555', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>{d}</button>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '9px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', color: '#888', fontWeight: 700 }}>{filtered.length} restrooms found</span>
                  <span style={{ fontFamily: 'var(--font-jp)', fontSize: '11px', color: '#bbb' }}>{filtered.length} か所</span>
                </div>
                <ListScreen toilets={filtered} onSelect={t => { setSelected(t); setTab('map') }} />
              </div>
            )}

            <div style={{ height: '84px', background: 'rgba(255,255,255,0.96)', borderTop: '1px solid #ebebeb', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around', paddingTop: '10px', flexShrink: 0, backdropFilter: 'blur(10px)' }}>
              {([
                { id: 'map' as Tab, icon: <MapIcon />, label: 'Map' },
                { id: 'list' as Tab, icon: <ListIcon />, label: 'List' },
                { id: 'add' as Tab, icon: <PlusIcon />, label: 'Add' },
                { id: 'settings' as Tab, icon: <SettingsIcon />, label: 'Settings' },
              ]).map(item => (
                <button key={item.id}
                  onClick={() => { setTab(item.id); setSelected(null); setShowFilters(false); if (item.id === 'add') setIsAdding(true) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flex: 1, color: (item.id === 'add' ? isAdding : tab === item.id) ? '#1a9e8f' : '#bbb', transition: 'color 140ms' }}>
                  {item.icon}
                  <span style={{ fontSize: '10px', fontWeight: (item.id === 'add' ? isAdding : tab === item.id) ? 800 : 600 }}>{item.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
        </>}
      </div>
    </div>
  )
}
