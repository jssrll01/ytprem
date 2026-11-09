import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import { MyListProvider } from './context/MyListContext.jsx'
import './index.css'

document.title = import.meta.env.VITE_APP_NAME || 'YT PREMIUM'
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <MyListProvider>
          <App />
        </MyListProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>
)
