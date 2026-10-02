import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App, preloadPage } from '@/app'
import { watchMotionPreference } from '@/lib/motion'
import '@/styles/index.css'

// Before the first render: motion styles apply only when this runs and reduced motion is off.
watchMotionPreference()

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found')

// On the home page, wait for its code (already downloading: the HTML preloads
// it) so the hero renders together with the site frame (see preloadPage).
void preloadPage(window.location.pathname)
  .catch(() => undefined)
  .then(() => {
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
