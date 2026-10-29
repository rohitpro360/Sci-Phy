import { useEffect, useState } from 'react'
import './QuoteCarousel.css'

const QUOTES_API = 'https://dummyjson.com/quotes/random/10' // a different random set on every call
const WIKI_API = 'https://en.wikipedia.org/w/api.php'
const TARGET_COUNT = 5 // how many quotes to rotate through
const MAX_ATTEMPTS = 4 // extra rounds if too few authors have portraits
const MIN_WEEKLY_VIEWS = 3000 // only well-known people (avoids wrong-person photos)

/* ---------------------------------------------------------------------------
   Looks up portraits for a list of author names in ONE Wikipedia request.
   Returns { "Author Name": "https://...jpg" } for the authors it could match.
--------------------------------------------------------------------------- */
async function fetchPortraits(authors, signal) {
  const names = [...new Set(authors)].filter((n) => n && !/^(unknown|anonymous)$/i.test(n))
  if (names.length === 0) return {}

  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    redirects: '1',
    prop: 'pageimages|pageviews',
    piprop: 'thumbnail',
    pithumbsize: '400',
    pvipdays: '7',
    titles: names.join('|'),
  })

  const res = await fetch(`${WIKI_API}?${params}`, { signal })
  if (!res.ok) throw new Error('Portrait request failed')
  const query = (await res.json()).query ?? {}

  const normalized = {}
  ;(query.normalized ?? []).forEach((n) => {
    normalized[n.from] = n.to
  })
  const redirects = {}
  ;(query.redirects ?? []).forEach((r) => {
    redirects[r.from] = r.to
  })

  // Keep only pages that have a photo and enough traffic to be a "famous" person.
  const imageByTitle = {}
  Object.values(query.pages ?? {}).forEach((page) => {
    if (!page.thumbnail?.source) return
    const views = page.pageviews
      ? Object.values(page.pageviews).reduce((sum, v) => sum + (v ?? 0), 0)
      : Infinity
    if (views >= MIN_WEEKLY_VIEWS) imageByTitle[page.title] = page.thumbnail.source
  })

  const result = {}
  names.forEach((name) => {
    const normalizedTitle = normalized[name] ?? name
    const finalTitle = redirects[normalizedTitle] ?? normalizedTitle
    if (imageByTitle[finalTitle]) result[name] = imageByTitle[finalTitle]
  })
  return result
}

/* ---------------------------------------------------------------------------
   Gets random quotes from the internet and pairs them with portraits.
--------------------------------------------------------------------------- */
async function loadLegendQuotes(signal) {
  const seen = new Set()
  const withPortrait = []
  const withoutPortrait = []

  for (let attempt = 0; attempt < MAX_ATTEMPTS && withPortrait.length < TARGET_COUNT; attempt += 1) {
    const res = await fetch(QUOTES_API, { signal, cache: 'no-store' })
    if (!res.ok) throw new Error('Quotes request failed')
    const payload = await res.json()

    const batch = (Array.isArray(payload) ? payload : payload.quotes ?? [payload]).filter(
      (q) => q?.quote && q?.author && !seen.has(q.id)
    )
    batch.forEach((q) => seen.add(q.id))

    let portraits = {}
    try {
      portraits = await fetchPortraits(
        batch.map((q) => q.author),
        signal
      )
    } catch (err) {
      if (err.name === 'AbortError') throw err
      // Portraits are optional: carry on and show monograms instead.
    }

    batch.forEach((q) => {
      const item = { id: q.id, text: q.quote, author: q.author, image: portraits[q.author] }
      if (item.image) withPortrait.push(item)
      else withoutPortrait.push(item)
    })
  }

  // Prefer legends with photos; pad with the rest only if we found very few.
  const chosen = withPortrait.length >= 3 ? withPortrait : [...withPortrait, ...withoutPortrait]
  if (chosen.length === 0) throw new Error('No quotes available')
  return chosen.slice(0, TARGET_COUNT)
}

/* --------------------------------------------------------------------------- */

function initials(name) {
  const words = name.split(' ').filter(Boolean)
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
}

// Shows the portrait, or a monogram if the image is missing or fails to load.
function Portrait({ src, author }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className="qc__portrait qc__portrait--fallback" aria-hidden="true">
        {initials(author)}
      </div>
    )
  }

  return (
    <img
      className="qc__portrait"
      src={src}
      alt={`Portrait of ${author}`}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  )
}

function QuoteCarousel({ autoplayMs = 8000 }) {
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [quotes, setQuotes] = useState([])
  const [index, setIndex] = useState(0)
  const [reloadKey, setReloadKey] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [reduceMotion] = useState(() => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)

  // Fetch fresh quotes every time the page loads (and when "Try again" is pressed).
  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')

    loadLegendQuotes(controller.signal)
      .then((items) => {
        setQuotes(items)
        setIndex(0)
        setStatus('ready')
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        console.error('Could not load quotes:', err)
        setStatus('error')
      })

    return () => controller.abort()
  }, [reloadKey])

  const count = quotes.length
  const running = status === 'ready' && count > 1 && !hovered && !reduceMotion

  // Change to the next quote automatically (pauses while the mouse is over it).
  useEffect(() => {
    if (!running) return undefined
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), autoplayMs)
    return () => clearInterval(timer)
  }, [running, autoplayMs, count])

  const quote = quotes[index]

  return (
    <section
      className="qc"
      aria-label="Inspirational quotes"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHovered(false)}
    >
      <span className="qc__mark" aria-hidden="true">
        “
      </span>

      {/* Loading */}
      {status === 'loading' && (
        <div className="qc__slide qc__skeleton" role="status" aria-label="Loading quotes">
          <span className="qc__portrait qc__sk" />
          <div className="qc__body">
            <span className="qc__sk qc__sk-line" />
            <span className="qc__sk qc__sk-line" />
            <span className="qc__sk qc__sk-line qc__sk-line--short" />
          </div>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="qc__state" role="alert">
          <p>We couldn’t load quotes right now. Check your internet connection and try again.</p>
          <button type="button" className="qc__pill" onClick={() => setReloadKey((k) => k + 1)}>
            Try again
          </button>
        </div>
      )}

      {/* Ready: just the quote, changing on its own */}
      {status === 'ready' && quote && (
        <>
          <figure className="qc__slide" key={quote.id}>
            <Portrait src={quote.image} author={quote.author} />
            <div className="qc__body">
              <blockquote className="qc__text">
                <p>{quote.text}</p>
              </blockquote>
              <figcaption className="qc__author">
                <span className="qc__name">{quote.author}</span>
              </figcaption>
            </div>
          </figure>

          <p className="qc__credit">Quotes from DummyJSON. Portraits from Wikipedia.</p>
        </>
      )}
    </section>
  )
}

export default QuoteCarousel