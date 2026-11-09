import { useCallback, useEffect, useState } from 'react'
import useLocalStorage from './useLocalStorage.js'

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true

const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export default function useInstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [installed, setInstalled] = useState(isStandalone)
  const [dismissed, setDismissed] = useLocalStorage('yt.install.dismissed', false)

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault()
      setDeferred(e)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferred) return false
    deferred.prompt()
    const { outcome } = await deferred.userChoice
    setDeferred(null)
    return outcome === 'accepted'
  }, [deferred])

  return {
    canInstall: Boolean(deferred),
    installed,
    ios: isIOS(),
    dismissed,
    dismiss: () => setDismissed(true),
    promptInstall
  }
}
