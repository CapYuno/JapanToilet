export type Amenity = 'washlet' | 'accessible' | 'baby' | 'open24h' | 'ostomate' | 'dryer'

export interface Toilet {
  id: string
  name: string
  nameJp: string
  district: string
  districtJp: string
  address: string
  lat: number
  lng: number
  amenities: Amenity[]
  rating: number
  reviews: number
  isVerified: boolean
  isUserSubmitted: boolean
  lastUpdated: string
  description?: string
}

export const AMENITY_META: Record<Amenity, { label: string; labelJp: string; icon: string; color: string }> = {
  washlet:    { label: 'Washlet',     labelJp: 'ウォシュレット', icon: '🚿', color: '#1a9e8f' },
  accessible: { label: 'Accessible', labelJp: '車椅子対応',     icon: '♿', color: '#1a7fce' },
  baby:       { label: 'Baby Room',  labelJp: 'ベビールーム',   icon: '🍼', color: '#e8a020' },
  open24h:    { label: '24 Hours',   labelJp: '24時間',         icon: '🕐', color: '#7c5cbf' },
  ostomate:   { label: 'Ostomate',   labelJp: 'オストメイト',   icon: '♥', color: '#d94f3a' },
  dryer:      { label: 'Hand Dryer', labelJp: 'ハンドドライヤー',icon: '💨', color: '#555' },
}

export const DISTRICTS = ['All', 'Shibuya', 'Shinjuku', 'Harajuku', 'Akihabara', 'Ueno', 'Asakusa', 'Ginza', 'Roppongi', 'Ikebukuro']

// Simulated map pins (x/y as % of a 800x600 canvas)
export const TOILETS: Toilet[] = [
  {
    id: 't1', name: 'Shibuya Station Restroom (East Exit)', nameJp: '渋谷駅東口トイレ',
    district: 'Shibuya', districtJp: '渋谷',
    address: '2-1 Dogenzaka, Shibuya City', lat: 35.6580, lng: 139.7016,
    amenities: ['washlet', 'accessible', 'baby', 'dryer'], rating: 4.2, reviews: 318,
    isVerified: true, isUserSubmitted: false, lastUpdated: '2025-12-01',
    description: 'Well-maintained JR station restroom. Multiple stalls, usually clean during off-peak hours.',
  },
  {
    id: 't2', name: 'Yoyogi Park Toilet Block A', nameJp: '代々木公園トイレA棟',
    district: 'Harajuku', districtJp: '原宿',
    address: 'Yoyogi-kamizonocho, Shibuya City', lat: 35.6715, lng: 139.6943,
    amenities: ['washlet', 'accessible', 'open24h', 'ostomate'], rating: 4.7, reviews: 512,
    isVerified: true, isUserSubmitted: false, lastUpdated: '2026-01-15',
    description: 'The famous Nigo-designed toilet in Yoyogi Park. Gorgeous cedar wood exterior. Open 24 hours.',
  },
  {
    id: 't3', name: 'Harajuku Station Public Toilet', nameJp: '原宿駅公衆トイレ',
    district: 'Harajuku', districtJp: '原宿',
    address: '1-18-13 Jingumae, Shibuya City', lat: 35.6703, lng: 139.7027,
    amenities: ['washlet', 'baby'], rating: 3.8, reviews: 89,
    isVerified: true, isUserSubmitted: false, lastUpdated: '2025-11-20',
  },
  {
    id: 't4', name: 'Shinjuku Station South Exit', nameJp: '新宿駅南口トイレ',
    district: 'Shinjuku', districtJp: '新宿',
    address: '1-1-3 Nishishinjuku, Shinjuku City', lat: 35.6894, lng: 139.7006,
    amenities: ['washlet', 'accessible', 'baby', 'dryer', 'open24h'], rating: 4.0, reviews: 774,
    isVerified: true, isUserSubmitted: false, lastUpdated: '2026-02-10',
    description: 'Large clean facility near Takashimaya Times Square. Multiple accessible stalls.',
  },
  {
    id: 't5', name: 'Shinjuku Gyoen Garden Toilet', nameJp: '新宿御苑トイレ',
    district: 'Shinjuku', districtJp: '新宿',
    address: '11 Naitomachi, Shinjuku City', lat: 35.6851, lng: 139.7100,
    amenities: ['washlet', 'accessible', 'ostomate'], rating: 4.5, reviews: 201,
    isVerified: true, isUserSubmitted: false, lastUpdated: '2025-10-08',
  },
  {
    id: 't6', name: 'Ueno Park Toilet (Sakura Zone)', nameJp: '上野公園トイレ（桜エリア）',
    district: 'Ueno', districtJp: '上野',
    address: 'Uenokoen 5, Taito City', lat: 35.7148, lng: 139.7726,
    amenities: ['accessible', 'open24h'], rating: 3.5, reviews: 156,
    isVerified: true, isUserSubmitted: false, lastUpdated: '2025-09-14',
    description: 'Near the famous cherry blossom path. Can get crowded during hanami season.',
  },
  {
    id: 't7', name: 'Asakusa Nakamise Toilet', nameJp: '浅草仲見世トイレ',
    district: 'Asakusa', districtJp: '浅草',
    address: '2-3-1 Asakusa, Taito City', lat: 35.7147, lng: 139.7967,
    amenities: ['washlet', 'baby', 'accessible'], rating: 4.1, reviews: 428,
    isVerified: true, isUserSubmitted: false, lastUpdated: '2026-01-29',
  },
  {
    id: 't8', name: 'Ginza Six Basement Restroom', nameJp: 'GINZA SIX地下トイレ',
    district: 'Ginza', districtJp: '銀座',
    address: '6-10-1 Ginza, Chuo City', lat: 35.6695, lng: 139.7643,
    amenities: ['washlet', 'accessible', 'baby', 'dryer', 'ostomate'], rating: 4.9, reviews: 633,
    isVerified: true, isUserSubmitted: false, lastUpdated: '2026-03-01',
    description: 'Premium department store restrooms. Exceptionally clean, well-staffed, luxury amenities.',
  },
  {
    id: 't9', name: 'Roppongi Hills Public Toilet', nameJp: '六本木ヒルズ公衆トイレ',
    district: 'Roppongi', districtJp: '六本木',
    address: '6-10-1 Roppongi, Minato City', lat: 35.6604, lng: 139.7292,
    amenities: ['washlet', 'open24h', 'dryer'], rating: 4.3, reviews: 187,
    isVerified: false, isUserSubmitted: true, lastUpdated: '2026-04-05',
    description: 'Added by community member. Open late for the Roppongi nightlife crowd.',
  },
  {
    id: 't10', name: 'Ikebukuro West Gate Park', nameJp: '池袋西口公園トイレ',
    district: 'Ikebukuro', districtJp: '池袋',
    address: '1-1 Nishiikebukuro, Toshima City', lat: 35.7297, lng: 139.7097,
    amenities: ['accessible', 'open24h'], rating: 3.2, reviews: 94,
    isVerified: true, isUserSubmitted: false, lastUpdated: '2025-08-22',
  },
  {
    id: 't11', name: 'Akihabara UDX Toilet', nameJp: '秋葉原UDXトイレ',
    district: 'Akihabara', districtJp: '秋葉原',
    address: '4-14-1 Sotokanda, Chiyoda City', lat: 35.6991, lng: 139.7729,
    amenities: ['washlet', 'accessible', 'baby', 'dryer'], rating: 4.4, reviews: 262,
    isVerified: true, isUserSubmitted: false, lastUpdated: '2026-02-28',
  },
]

// Approximate screen positions for the fake map (% of canvas)
export const MAP_POSITIONS: Record<string, { x: number; y: number }> = {
  t1:  { x: 22, y: 62 },
  t2:  { x: 18, y: 38 },
  t3:  { x: 24, y: 40 },
  t4:  { x: 20, y: 30 },
  t5:  { x: 26, y: 34 },
  t6:  { x: 65, y: 22 },
  t7:  { x: 78, y: 20 },
  t8:  { x: 52, y: 70 },
  t9:  { x: 30, y: 72 },
  t10: { x: 22, y: 14 },
  t11: { x: 68, y: 26 },
}
