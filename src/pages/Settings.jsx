import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import SettingsPanel from '../components/SettingsPanel.jsx'
import './Settings.css'

export default function Settings() {
  const { hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  return (
    <div className="settings">
      <h1>Settings</h1>
      <p className="settings__sub">Changes apply instantly and are saved on this device.</p>
      <SettingsPanel />
    </div>
  )
}
