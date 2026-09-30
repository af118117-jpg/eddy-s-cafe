import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll } from 'vitest'

// jsdom doesn't implement scrolling; React Router and ScrollToHash call these.
beforeAll(() => {
  window.scrollTo = () => undefined
  Element.prototype.scrollIntoView = () => undefined
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})
