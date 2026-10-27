import { useMemo, useState } from 'react'
import { InputField } from '../components/form'
import { Button } from '../components/ui/Button'
import { DemoCard, PageHeader } from '../components/ui/Page'
import { Switch } from '../components/ui/Switch'
import { useDocumentTitle, useFavicon, useHeadSnapshot } from '../hooks/useDocumentHead'
import { APP_NAME, flashTitle, setAwayMessage, setBadge, type FaviconSpec } from '../lib/head'
import { toast } from '../lib/toast'

const EMOJIS = ['🧭', '🚀', '🔥', '💡', '🎯', '🦄', '🍕', '🛠️']
const COLORS = ['#4f46e5', '#0ea5e9', '#16a34a', '#ea580c', '#db2777', '#171a21']

export default function TabHeadPage() {
  const head = useHeadSnapshot()
  const [customTitle, setCustomTitle] = useState('')
  const [mode, setMode] = useState<'route' | 'emoji' | 'letter'>('route')
  const [emoji, setEmoji] = useState('🚀')
  const [letter, setLetter] = useState('A')
  const [color, setColor] = useState(COLORS[0]!)

  // Page-scoped overrides: both revert automatically when you leave this page.
  useDocumentTitle(customTitle.trim() || null)
  const favicon = useMemo<FaviconSpec | null>(
    () => (mode === 'emoji' ? { emoji } : mode === 'letter' ? { letter: letter || '?', color } : null),
    [mode, emoji, letter, color],
  )
  useFavicon(favicon)

  return (
    <>
      <PageHeader
        title="Tab title & favicon"
        description={
          <>
            Everything here is driven by <code>src/lib/head.ts</code>. Watch your browser tab while you play.
          </>
        }
      />

      {/* Live replica of the browser tab */}
      <div className="fake-tab card" aria-label="Preview of the browser tab">
        <div className="fake-tab__tab">
          <img src={head.faviconHref} alt="" width={16} height={16} />
          <span>{head.title}</span>
        </div>
        <div className="fake-tab__bar">localhost:5173/tab-head</div>
      </div>

      <div className="demo-grid">
        <DemoCard
          title="1 · Route titles (automatic)"
          description={
            <>
              Each route declares <code>handle: {'{ title, favicon }'}</code> in the router. <code>&lt;RouteHead /&gt;</code> picks the deepest
              one and formats it as <code>“Page · {APP_NAME}”</code>.
            </>
          }
        >
          <pre className="code-block">{`{
  path: 'tab-head',
  lazy: page(() => import('../pages/TabHeadPage')),
  handle: { title: 'Tab title & icon', favicon: { emoji: '🧭' } },
}`}</pre>
        </DemoCard>

        <DemoCard
          title="2 · Override from a page"
          description={
            <>
              <code>useDocumentTitle(text)</code> — e.g. “Editing: Invoice #42”. Clear it to fall back to the route title.
            </>
          }
        >
          <InputField label="Custom title" placeholder="Type to change the tab title…" clearable value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} />
        </DemoCard>

        <DemoCard title="3 · Dynamic favicon" description="Generated SVG data-URL — no image files. useFavicon() reverts on unmount.">
          <div className="form-stack">
            <div className="segmented" role="radiogroup" aria-label="Favicon source">
              {(['route', 'emoji', 'letter'] as const).map((m) => (
                <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)}>
                  {m === 'route' ? 'From route' : m === 'emoji' ? 'Emoji' : 'Letter'}
                </button>
              ))}
            </div>
            {mode === 'emoji' && (
              <div className="swatches">
                {EMOJIS.map((e) => (
                  <button key={e} type="button" className="swatch" aria-pressed={emoji === e} onClick={() => setEmoji(e)}>
                    {e}
                  </button>
                ))}
              </div>
            )}
            {mode === 'letter' && (
              <>
                <InputField label="Letter" maxLength={1} value={letter} onChange={(e) => setLetter(e.target.value)} />
                <div className="swatches">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="swatch swatch--color"
                      style={{ background: c }}
                      aria-label={`Colour ${c}`}
                      aria-pressed={color === c}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </DemoCard>

        <DemoCard
          title="4 · Unread badge"
          description="Like Gmail/Slack: “(3) Title” plus a red count on the icon. Shared with the bell in the top bar."
          value={head.badge}
        >
          <div className="row">
            <Button onClick={() => setBadge((n) => n - 1)} disabled={head.badge === 0}>
              −1
            </Button>
            <Button onClick={() => setBadge((n) => n + 1)}>+1</Button>
            <Button onClick={() => setBadge((n) => n + 10)}>+10</Button>
            <Button variant="ghost" onClick={() => setBadge(0)}>
              Reset
            </Button>
          </div>
        </DemoCard>

        <DemoCard title="5 · Away message" description="Switch to another tab and look at this one. Uses the visibilitychange event.">
          <Switch
            label="Show “Come back!” when hidden"
            description="Applies app-wide until turned off."
            checked={head.awayMessage !== null}
            onChange={(on) => setAwayMessage(on ? '👋 Come back! · ' + APP_NAME : null)}
          />
        </DemoCard>

        <DemoCard title="6 · Flash for attention" description="Blinks the title until you return — e.g. a new chat message. Only flashes when the tab is not focused.">
          <Button
            variant="primary"
            onClick={() => {
              toast('Switch to another tab now', { description: 'The title starts flashing in 3 seconds.', tone: 'info' })
              window.setTimeout(() => flashTitle('🔔 New message from Priya'), 3000)
            }}
          >
            Flash in 3 s
          </Button>
        </DemoCard>
      </div>
    </>
  )
}
