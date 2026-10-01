/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolveConfigs } from 'imagetools-core'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig, type Plugin, type PluginOption } from 'vite'
import { imagetools } from 'vite-imagetools'
import { heroImage } from './src/lib/heroImage.ts'

/** Every photo is generated at these widths, up to the width of its (cropped) source. */
const PHOTO_WIDTHS = [480, 800, 1200, 1600, 2400]

/**
 * Photos are imported from assets-source/ as `photo.jpg?aspect=4:5&photo`:
 * cropped to that ratio and encoded as AVIF, WebP and JPEG at each width in
 * PHOTO_WIDTHS, as a <picture> description ({ sources, img }; see
 * src/data/images.ts). Widths the source can't fill are left out instead of
 * being upscaled. `&avifQuality=40` lowers the quality of the AVIF files only
 * (sharp's default is 50), for the hero, which sits under dark scrims.
 */
const photoPreset = imagetools({
  defaultDirectives: async (url, metadata) => {
    const aspect = url.searchParams.get('aspect')
    if (!url.searchParams.has('photo') || !aspect) return new URLSearchParams()
    const [ratioWidth = 1, ratioHeight = 1] = aspect.split(':').map(Number)
    // Width and height as displayed, after any EXIF rotation.
    const { width, height } = (await metadata()).autoOrient
    const maxWidth = Math.floor(Math.min(width, (height * ratioWidth) / ratioHeight))
    const widths = PHOTO_WIDTHS.filter((w) => w <= maxWidth)
    return new URLSearchParams({
      w: (widths.length > 0 ? widths : [maxWidth]).join(';'),
      format: 'avif;webp;jpg',
      as: 'picture',
    })
  },
  resolveConfigs: (entries, outputFormats) =>
    resolveConfigs(entries, outputFormats).map((config) =>
      config.format === 'avif' && config.avifQuality
        ? { ...config, quality: config.avifQuality }
        : config,
    ),
})

/**
 * Page routes, each served from its own HTML file: `/menu` from menu.html,
 * which static hosts and `vite preview` do without configuration. Any other
 * path gets index.html. Keep in step with src/app/routes.tsx.
 */
const PAGES = [
  { file: 'index.html', module: 'src/pages/Home.tsx', title: null },
  { file: 'menu.html', module: 'src/pages/Menu.tsx', title: 'Menu | eddy’s Café' },
] as const

/**
 * Writes what each page needs first into its HTML, so it downloads alongside
 * the main script instead of after it:
 * - its lazy page chunk, as <link rel="modulepreload"> after the main script
 *   and stylesheet, which the first paint needs more;
 * - on the home page, the hero photo, before anything else (in place of the
 *   `<!-- hero-preload -->` comment): one <link rel="preload"> per crop, with
 *   the srcset, sizes and media of the Hero's <picture> (src/lib/heroImage.ts),
 *   so the browser uses the preloaded file instead of fetching another.
 * index.html is the home page. The other pages' files are copies of it with
 * their own preloads and title, so the menu doesn't download the hero.
 * Build only: in dev there are no final file names to point at.
 */
function pageHtml(): Plugin {
  const MARKER = '<!-- hero-preload -->'
  // AVIF srcset of each hero crop, by aspect ratio, still holding Vite's asset placeholders.
  const heroSrcsets = new Map<string, string>()
  // Each page's modulepreload links, by HTML file.
  const modulePreloads = new Map<string, string>()

  return {
    name: 'eddys:page-html',
    apply: 'build',
    transform(code, id) {
      const [path = '', query = ''] = id.split('?')
      const params = new URLSearchParams(query)
      const aspect = params.get('aspect')
      if (!/\/assets-source\/hero\.\w+$/.test(path) || !params.has('photo') || !aspect) return
      const srcset = /["']?avif["']?\s*:\s*"([^"]+)"/.exec(code)?.[1]
      if (!srcset) this.error(`No AVIF srcset in the hero image module ${id}`)
      heroSrcsets.set(aspect, srcset)
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, { bundle, chunk: entry }) {
        if (!bundle || !entry) return html
        if (!html.includes(MARKER)) throw new Error(`index.html has no ${MARKER} comment`)
        const loaded = new Set([entry.fileName, ...entry.imports])
        for (const page of PAGES) {
          const chunk = Object.values(bundle).find(
            (output) => output.type === 'chunk' && output.facadeModuleId?.endsWith(page.module),
          )
          if (chunk?.type !== 'chunk') throw new Error(`No chunk for ${page.module}`)
          const files = [chunk.fileName, ...chunk.imports].filter((file) => !loaded.has(file))
          modulePreloads.set(
            page.file,
            files
              .map((file) => `<link rel="modulepreload" crossorigin href="/${file}">`)
              .join('\n    '),
          )
        }
        const hero = [
          { ratio: '4:5', media: heroImage.narrowMedia, sizes: heroImage.narrowSizes },
          { ratio: '16:9', media: heroImage.wideMedia, sizes: heroImage.wideSizes },
        ].map(({ ratio, media, sizes }) => {
          const srcset = heroSrcsets.get(ratio)
          if (!srcset) throw new Error(`The hero has no ${ratio} crop to preload`)
          // Vite swaps the __VITE_ASSET__ placeholders in the srcset for the final URLs.
          return `<link rel="preload" as="image" type="image/avif" fetchpriority="high" media="${media}" imagesrcset="${srcset}" imagesizes="${sizes}">`
        })
        return html
          .replace(MARKER, hero.join('\n    '))
          .replace('</head>', `  ${modulePreloads.get('index.html') ?? ''}\n  </head>`)
      },
    },
    generateBundle: {
      // After Vite has written index.html.
      order: 'post',
      handler(_options, bundle) {
        const index = bundle['index.html']
        const homePreloads = modulePreloads.get('index.html')
        if (index?.type !== 'asset' || typeof index.source !== 'string' || !homePreloads) {
          throw new Error('index.html was not built')
        }
        const home = index.source
        for (const page of PAGES) {
          if (page.file === 'index.html') continue
          const html: string = home
            .replace(/\s*<link rel="preload" as="image"[^>]*>/g, '')
            .replace(homePreloads, modulePreloads.get(page.file) ?? '')
            .replace(/<title>[^<]*<\/title>/, `<title>${page.title}</title>`)
          if (html.includes(homePreloads))
            throw new Error(`Could not adapt index.html for ${page.file}`)
          this.emitFile({ type: 'asset', fileName: page.file, source: html })
        }
      },
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    photoPreset,
    pageHtml(),
    // `npm run analyze`: a treemap of every chunk with gzipped sizes.
    mode === 'analyze' &&
      (visualizer({
        filename: 'reports/bundle.html',
        template: 'treemap',
        gzipSize: true,
        title: 'eddy’s Café bundle',
      }) as PluginOption),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
}))
