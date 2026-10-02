import { createContext } from 'react'

/**
 * True inside a Reveal that is about to come into view: its photos load now
 * instead of waiting for the browser's lazy loading, which can't see them
 * while the hidden state's clip-path covers them (see Reveal).
 */
export const RevealLoadContext = createContext(false)
