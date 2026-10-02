import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes'

// Declarative router on purpose: the data router (createBrowserRouter) adds
// about 20 KB gzipped, a fifth of the 90 KB JS budget.
export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
