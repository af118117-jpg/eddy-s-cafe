import { lazy, type ComponentType } from 'react'

interface PageModule {
  default: ComponentType
}

/**
 * React.lazy for a page, with `preload()`. main.tsx waits for the first
 * page's code before rendering (the HTML has already started downloading it),
 * so the page renders in the same pass as the site frame instead of one
 * Suspense round later. Without that wait, the home page's hero photo, its
 * largest paint, comes a few hundred milliseconds later on a slow phone.
 */
export function lazyPage(load: () => Promise<PageModule>) {
  let loaded: PageModule | undefined
  const Page = lazy(() =>
    loaded
      ? // Already loaded: a thenable that resolves at once lets React render it without suspending.
        ({
          then: (resolve: (module: PageModule) => void) => {
            resolve(loaded as PageModule)
          },
        } as Promise<PageModule>)
      : load(),
  )
  const preload = async () => {
    loaded = await load()
  }
  return Object.assign(Page, { preload })
}
