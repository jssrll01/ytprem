import { useState } from 'react'
import useInstallPrompt from '../hooks/useInstallPrompt.js'
import { DEFAULT_SETTINGS, useSettings } from '../context/SettingsContext.jsx'
import { useMyList } from '../context/MyListContext.jsx'
import './SettingsPanel.css'

const APP_VERSION = '1.0.0'

const ACCENTS = ['#E50914', '#FF6A00', '#1E90FF', '#1DB954', '#8E44AD', '#E91E63']
const QUALITIES = [
  ['auto', 'Auto'], ['tiny', '144p'], ['small', '240p'], ['medium', '360p'],
  ['large', '480p'], ['hd720', '720p'], ['hd1080', '1080p']
]
const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
const LANGUAGES = ['English', 'Español', 'Filipino', 'Français', 'Deutsch', '日本語']
const REGIONS = ['United States', 'Philippines', 'United Kingdom', 'Canada', 'Australia', 'India']

function Section({ id, title, children }) {
  return (
    <section className="sp-section" id={id} aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`}>{title}</h2>
      <div className="sp-card">{children}</div>
    </section>
  )
}

function Field({ label, hint, children }) {
  return (
    <div className="sp-field">
      <div className="sp-field__text">
        <span className="sp-field__label">{label}</span>
        {hint && <span className="sp-field__hint">{hint}</span>}
      </div>
      <div className="sp-field__control">{children}</div>
    </div>
  )
}

function Switch({ label, hint, checked, onChange }) {
  return (
    <Field label={label} hint={hint}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`sp-switch${checked ? ' is-on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </Field>
  )
}

function Segmented({ label, hint, value, options, onChange }) {
  return (
    <Field label={label} hint={hint}>
      <div className="sp-seg" role="radiogroup" aria-label={label}>
        {options.map(([v, text]) => (
          <button key={String(v)} type="button" role="radio" aria-checked={v === value} className={v === value ? 'is-on' : ''} onClick={() => onChange(v)}>
            {text}
          </button>
        ))}
      </div>
    </Field>
  )
}

function Select({ label, hint, value, options, onChange }) {
  return (
    <Field label={label} hint={hint}>
      <select className="sp-select" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, text]) => (
          <option key={String(v)} value={v}>{text}</option>
        ))}
      </select>
    </Field>
  )
}

export default function SettingsPanel() {
  const { settings, update, reset } = useSettings()
  const { clearList, clearHistory, list, progress } = useMyList()
  const { canInstall, installed, ios, promptInstall } = useInstallPrompt()
  const [notice, setNotice] = useState('')

  const confirmThen = (message, action, done) => {
    if (window.confirm(message)) {
      action()
      setNotice(done)
    }
  }

  const historyCount = Object.keys(progress).length

  return (
    <div className="sp">
      <Section id="appearance" title="Appearance">
        <Segmented
          label="Theme"
          value={settings.theme}
          options={[['dark', 'Dark'], ['light', 'Light'], ['amoled', 'AMOLED']]}
          onChange={(v) => update('theme', v)}
        />
        <Field label="Accent color">
          <div className="sp-accents">
            {ACCENTS.map((c) => (
              <button
                key={c}
                type="button"
                className={`sp-swatch${settings.accent.toLowerCase() === c.toLowerCase() ? ' is-on' : ''}`}
                style={{ background: c }}
                aria-label={`Accent ${c}`}
                aria-pressed={settings.accent.toLowerCase() === c.toLowerCase()}
                onClick={() => update('accent', c)}
              />
            ))}
            <input type="color" aria-label="Custom accent color" value={settings.accent} onChange={(e) => update('accent', e.target.value)} />
          </div>
        </Field>
      </Section>

      <Section id="interface" title="Interface">
        <Segmented label="Card size" value={settings.cardSize} options={[['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']]} onChange={(v) => update('cardSize', v)} />
        <Segmented label="Row density" value={settings.density} options={[['compact', 'Compact'], ['comfortable', 'Comfortable'], ['spacious', 'Spacious']]} onChange={(v) => update('density', v)} />
        <Segmented label="Font size" value={settings.fontSize} options={[['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']]} onChange={(v) => update('fontSize', v)} />
        <Switch label="Reduce animations" checked={settings.reduceMotion} onChange={(v) => update('reduceMotion', v)} />
        <Switch label="Hover previews" hint="Desktop only" checked={settings.hoverPreviews} onChange={(v) => update('hoverPreviews', v)} />
        <Switch label="Autoplay hero video" hint="Muted trailer-style background on larger screens" checked={settings.heroAutoplay} onChange={(v) => update('heroAutoplay', v)} />
        <Switch label="Show Top 10 row" checked={settings.showTop10} onChange={(v) => update('showTop10', v)} />
      </Section>

      <Section id="video" title="Video">
        <Select
          label="Default quality"
          hint="YouTube treats this as a hint and may ignore it"
          value={settings.quality}
          options={QUALITIES}
          onChange={(v) => update('quality', v)}
        />
        <Select label="Default speed" value={String(settings.speed)} options={SPEEDS.map((s) => [String(s), s === 1 ? 'Normal' : `${s}x`])} onChange={(v) => update('speed', Number(v))} />
        <Field label="Default volume" hint={`${settings.volume}%`}>
          <input className="sp-range" type="range" min="0" max="100" aria-label="Default volume" value={settings.volume} onChange={(e) => update('volume', Number(e.target.value))} />
        </Field>
        <Switch label="Autoplay next" hint="Plays the next title in the category" checked={settings.autoplayNext} onChange={(v) => update('autoplayNext', v)} />
        <Switch label="Resume playback" checked={settings.resume} onChange={(v) => update('resume', v)} />
        <Switch label="Captions on by default" hint="Best effort: depends on the video" checked={settings.captions} onChange={(v) => update('captions', v)} />
        <Segmented label="Caption size" value={settings.captionSize} options={[['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']]} onChange={(v) => update('captionSize', v)} />
        <Segmented label="Skip length" value={settings.skipSeconds} options={[[5, '5s'], [10, '10s'], [15, '15s'], [30, '30s']]} onChange={(v) => update('skipSeconds', v)} />
        <Switch label="Fullscreen on play" hint="Your browser may need one tap first" checked={settings.fullscreenOnPlay} onChange={(v) => update('fullscreenOnPlay', v)} />
        <Switch label="Force landscape on play" hint="Android Chrome only, works in fullscreen" checked={settings.landscapeOnPlay} onChange={(v) => update('landscapeOnPlay', v)} />
        <Switch label="Data saver" hint="Lower quality video and smaller thumbnails" checked={settings.dataSaver} onChange={(v) => update('dataSaver', v)} />
      </Section>

      <Section id="language" title="Language & region">
        <Select label="Language" hint="Label only: the interface stays in English" value={settings.language} options={LANGUAGES.map((l) => [l, l])} onChange={(v) => update('language', v)} />
        <Select label="Region" hint="Label only" value={settings.region} options={REGIONS.map((r) => [r, r])} onChange={(v) => update('region', v)} />
      </Section>

      <Section id="storage" title="Storage">
        <Field label="Watch history" hint={`${historyCount} saved`}>
          <button type="button" className="btn btn-info sp-btn" onClick={() => confirmThen('Clear your watch history?', clearHistory, 'Watch history cleared.')}>Clear</button>
        </Field>
        <Field label="My List" hint={`${list.length} titles`}>
          <button type="button" className="btn btn-info sp-btn" onClick={() => confirmThen('Clear My List?', clearList, 'My List cleared.')}>Clear</button>
        </Field>
        <Field label="Reset all settings">
          <button type="button" className="btn btn-info sp-btn" onClick={() => confirmThen('Reset all settings to defaults?', reset, 'Settings reset.')}>Reset</button>
        </Field>
        <p className="sp-notice" role="status" aria-live="polite">{notice}</p>
      </Section>

      <Section id="about" title="About">
        <Field label="Version" hint={`YT PREMIUM ${APP_VERSION}`}>
          <span className="sp-field__hint">{APP_VERSION}</span>
        </Field>
        <Field
          label="Install app"
          hint={
            installed
              ? 'Already installed'
              : ios
                ? 'Tap Share, then “Add to Home Screen”'
                : canInstall
                  ? 'Add YT PREMIUM to your device'
                  : 'Use your browser menu and choose “Install app”'
          }
        >
          {canInstall && !installed && (
            <button type="button" className="btn btn-accent sp-btn" onClick={promptInstall}>Install</button>
          )}
        </Field>
        <p className="sp-notice">Defaults: accent {DEFAULT_SETTINGS.accent}, dark theme.</p>
      </Section>
    </div>
  )
}
