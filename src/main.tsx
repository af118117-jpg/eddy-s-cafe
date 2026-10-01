import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app'
import { watchMotionPreference } from '@/lib/motion'
import '@/styles/index.css'

// Before the first render: motion styles apply only when this runs and reduced motion is off.
watchMotionPreference()

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
