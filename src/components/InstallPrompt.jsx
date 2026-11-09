import { useState } from 'react'
import Icon from './Icon.jsx'
import useInstallPrompt from '../hooks/useInstallPrompt.js'
import './InstallPrompt.css'

export default function InstallPrompt() {
  const { canInstall, installed, ios, dismissed, dismiss, promptInstall } = useInstallPrompt()
  const [showSteps, setShowSteps] = useState(false)

  if (installed || dismissed || !(canInstall || ios)) return null

  return (
    <aside className="install" role="complementary" aria-label="Install app">
      <div className="install__text">
        <strong>Install YT PREMIUM</strong>
        {ios && showSteps ? (
          <span>Tap the Share button, then “Add to Home Screen”.</span>
        ) : (
          <span>Quick access and fullscreen, right from your home screen.</span>
        )}
      </div>
      {canInstall ? (
        <button type="button" className="btn btn-accent install__btn" onClick={promptInstall}>Install</button>
      ) : (
        <button type="button" className="btn btn-accent install__btn" onClick={() => setShowSteps(true)}>How</button>
      )}
      <button type="button" className="install__close" aria-label="Dismiss" onClick={dismiss}>
        <Icon name="close" size={18} />
      </button>
    </aside>
  )
}
