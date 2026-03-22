/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  BharatPath  ·  Dual-API Live News Service                  ║
 * ║  Sources : NewsAPI (newsapi.org) + GNews (gnews.io)         ║
 * ║  Strategy: Parallel fetch → normalize → deduplicate →       ║
 * ║            categorize → sort by date → fallback to mock     ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

/* ─── API credentials from Vite env ─── */
const NEWSAPI_KEY = import.meta.env.VITE_NEWSAPI_KEY
const GNEWS_KEY = import.meta.env.VITE_GNEWS_KEY

/* ─── Spiritual / Tourism query terms ─── */
const QUERIES = {
    Spiritual: 'temple OR mandir OR yatra OR aarti OR pilgrimage OR kedarnath OR varanasi OR haridwar OR tirtha OR puja OR darshan OR kashi OR ram OR shiv',
    Tourism: 'India tourism OR heritage corridor OR UNESCO India OR monument India OR ayodhya OR tirupati OR vrindavan',
    'Travel Alerts': 'India travel alert OR weather advisory Uttarakhand OR flood mountain OR highway closed India',
}

/* ─── Category keyword detector ─── */
const CATEGORY_KEYWORDS = {
    Spiritual: ['temple', 'mandir', 'yatra', 'aarti', 'pilgrimage', 'kedarnath', 'varanasi', 'haridwar', 'tirtha', 'puja', 'darshan', 'kashi', 'shiv', 'ram', 'krishna', 'ganesh', 'mahashivaratri', 'navratri', 'char dham', 'ganga', 'badrinath', 'dwarka', 'puri jagannath', 'tirupati', 'shirdi'],
    Tourism: ['tourism', 'corridor', 'heritage', 'monument', 'resort', 'hotel', 'ayodhya', 'vrindavan', 'ujjain', 'mathura', 'tourist', 'safari', 'museum', 'archaeological', 'site', 'destination'],
    'Travel Alerts': ['alert', 'advisory', 'warning', 'rain', 'flood', 'landslide', 'closed', 'blocked', 'traffic', 'disruption', 'cancelled', 'delay', 'rescue', 'stranded', 'imd', 'cyclone'],
}

/* ─── Emoji map per category ─── */
const CATEGORY_EMOJI = {
    Spiritual: ['🛕', '🕉️', '🪔', '🕌', '🙏', '🏔️', '🌊', '📿'],
    Tourism: ['🗺️', '🏛️', '🌄', '🏰', '🎭', '🚢', '🌺', '🏯'],
    'Travel Alerts': ['⚠️', '⛈️', '🚧', '🌧️', '🆘', '📢', '🔔', '🚨'],
}

/* ─── Color per category ─── */
const CATEGORY_COLOR = {
    Spiritual: '#F97316',
    Tourism: '#A78BFA',
    'Travel Alerts': '#60A5FA',
}

/* ─── Cooldown cache (avoid hammering APIs) ─── */
const CACHE = { data: null, ts: 0, TTL: 5 * 60 * 1000 } // 5 min TTL

/* ═══════════════════════════════════════════════════════
   1.  NEWSAPI.ORG  fetcher
   endpoint: /v2/everything  (works on localhost in dev)
   ═══════════════════════════════════════════════════════ */
async function fetchNewsAPI() {
    const q = encodeURIComponent(
        'temple OR yatra OR pilgrimage OR tourism India OR travel India OR kedarnath OR varanasi OR haridwar OR ayodhya'
    )
    const url =
        `https://newsapi.org/v2/everything?` +
        `q=${q}` +
        `&language=en` +
        `&sortBy=publishedAt` +
        `&pageSize=20` +
        `&apiKey=${NEWSAPI_KEY}`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`NewsAPI ${res.status}`)
    const json = await res.json()
    if (json.status !== 'ok') throw new Error(json.message || 'NewsAPI error')

    return (json.articles || []).map((a) => normalizeNewsAPI(a))
}

function normalizeNewsAPI(article) {
    return {
        id: `newsapi-${btoa(article.url || '').slice(0, 16)}`,
        source: 'NewsAPI · ' + (article.source?.name || 'Unknown'),
        rawSource: article.source?.name || '',
        title: article.title || '',
        desc: article.description || article.content?.slice(0, 160) || '',
        url: article.url || '#',
        image: article.urlToImage || null,
        publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
        apiSource: 'newsapi',
        category: detectCategory(article.title + ' ' + (article.description || '')),
    }
}

/* ═══════════════════════════════════════════════════════
   2.  GNEWS.IO  fetcher
   endpoint: /v4/search
   ═══════════════════════════════════════════════════════ */
async function fetchGNews() {
    const q = encodeURIComponent(
        'India pilgrimage temple tourism travel yatra varanasi kedarnath'
    )
    const url =
        `https://gnews.io/api/v4/search?` +
        `q=${q}` +
        `&lang=en` +
        `&country=in` +
        `&max=20` +
        `&sortby=publishedAt` +
        `&apikey=${GNEWS_KEY}`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`GNews ${res.status}`)
    const json = await res.json()
    if (!json.articles) throw new Error('GNews: no articles field')

    return json.articles.map((a) => normalizeGNews(a))
}

function normalizeGNews(article) {
    return {
        id: `gnews-${btoa(article.url || '').slice(0, 16)}`,
        source: 'GNews · ' + (article.source?.name || 'Unknown'),
        rawSource: article.source?.name || '',
        title: article.title || '',
        desc: article.description || '',
        url: article.url || '#',
        image: article.image || null,
        publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
        apiSource: 'gnews',
        category: detectCategory(article.title + ' ' + (article.description || '')),
    }
}

/* ═══════════════════════════════════════════════════════
   3.  Category detector
   ═══════════════════════════════════════════════════════ */
function detectCategory(text) {
    const lower = text.toLowerCase()
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some((kw) => lower.includes(kw))) return cat
    }
    return 'Tourism' // default
}

/* ═══════════════════════════════════════════════════════
   4.  Deduplicator  (Jaccard title similarity)
   ═══════════════════════════════════════════════════════ */
function tokenize(str) {
    return new Set(str.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean))
}

function jaccard(a, b) {
    const setA = tokenize(a)
    const setB = tokenize(b)
    const inter = new Set([...setA].filter((x) => setB.has(x)))
    const union = new Set([...setA, ...setB])
    return union.size ? inter.size / union.size : 0
}

function deduplicate(articles) {
    const kept = []
    for (const article of articles) {
        const isDuplicate = kept.some((k) => jaccard(k.title, article.title) > 0.55)
        if (!isDuplicate) kept.push(article)
    }
    return kept
}

/* ═══════════════════════════════════════════════════════
   5.  Enrich: add emoji + color
   ═══════════════════════════════════════════════════════ */
function enrich(articles) {
    const emojiCounters = { Spiritual: 0, Tourism: 0, 'Travel Alerts': 0 }
    return articles.map((a) => {
        const cat = a.category
        const emojiArr = CATEGORY_EMOJI[cat] || CATEGORY_EMOJI['Tourism']
        const idx = emojiCounters[cat] % emojiArr.length
        emojiCounters[cat]++
        return {
            ...a,
            emoji: emojiArr[idx],
            color: CATEGORY_COLOR[cat] || '#A78BFA',
            time: timeAgo(a.publishedAt),
        }
    })
}

/* ═══════════════════════════════════════════════════════
   6.  Time formatter
   ═══════════════════════════════════════════════════════ */
function timeAgo(date) {
    const secs = Math.floor((Date.now() - date.getTime()) / 1000)
    if (secs < 60) return `${secs}s ago`
    if (secs < 3600) return `${Math.floor(secs / 60)} min ago`
    if (secs < 86400) return `${Math.floor(secs / 3600)} hr ago`
    if (secs < 604800) return `${Math.floor(secs / 86400)} days ago`
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

/* ═══════════════════════════════════════════════════════
   7.  MAIN EXPORT  ·  fetchSpiritualNews()
   ═══════════════════════════════════════════════════════ */
export async function fetchSpiritualNews() {
    /* cache hit */
    if (CACHE.data && Date.now() - CACHE.ts < CACHE.TTL) {
        console.log('[NewsService] cache hit')
        return CACHE.data
    }

    /* parallel fetch with individual try/catch */
    const [newsAPIResult, gnewsResult] = await Promise.allSettled([
        fetchNewsAPI(),
        fetchGNews(),
    ])

    const newsAPIArticles = newsAPIResult.status === 'fulfilled' ? newsAPIResult.value : []
    const gnewsArticles = gnewsResult.status === 'fulfilled' ? gnewsResult.value : []

    /* log which API(s) succeeded */
    console.log(
        `[NewsService] NewsAPI: ${newsAPIArticles.length} articles | GNews: ${gnewsArticles.length} articles`
    )
    if (newsAPIResult.status === 'rejected')
        console.warn('[NewsService] NewsAPI failed:', newsAPIResult.reason?.message)
    if (gnewsResult.status === 'rejected')
        console.warn('[NewsService] GNews failed:', gnewsResult.reason?.message)

    /* both failed → signal to caller so it can fall back to mock */
    if (!newsAPIArticles.length && !gnewsArticles.length) {
        throw new Error('Both APIs failed — using mock data')
    }

    /* merge → sort by publishedAt desc → deduplicate → enrich */
    const merged = [...newsAPIArticles, ...gnewsArticles]
        .sort((a, b) => b.publishedAt - a.publishedAt)

    const unique = deduplicate(merged)
    const enriched = enrich(unique)

    /* cache for TTL */
    CACHE.data = enriched
    CACHE.ts = Date.now()

    return enriched
}

/* ═══════════════════════════════════════════════════════
   8.  STATUS helper  (for UI indicator)
   ═══════════════════════════════════════════════════════ */
export function getApiStatus(articles) {
    const hasNewsAPI = articles.some((a) => a.apiSource === 'newsapi')
    const hasGNews = articles.some((a) => a.apiSource === 'gnews')
    if (hasNewsAPI && hasGNews) return { label: 'NewsAPI + GNews', color: '#34D399' }
    if (hasNewsAPI) return { label: 'NewsAPI only', color: '#F7C948' }
    if (hasGNews) return { label: 'GNews only', color: '#F7C948' }
    return { label: 'Mock Data', color: '#94A3B8' }
}
