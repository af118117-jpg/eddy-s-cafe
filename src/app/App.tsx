import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

// Dev only: the condition is replaced with `false` in production builds, so the
// styleguide chunk is never emitted.
const Styleguide = import.meta.env.DEV ? lazy(() => import('@/pages/_Styleguide')) : null

// Placeholder until the home page is built.
function HomePlaceholder() {
  return (
    <main>
      <h1>eddy's Café</h1>
    </main>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePlaceholder />} />
        {Styleguide && (
          <Route
            path="/styleguide"
            element={
              <Suspense fallback={null}>
                <Styleguide />
              </Suspense>
            }
          />
        )}
      </Routes>
    </BrowserRouter>
  )
}
