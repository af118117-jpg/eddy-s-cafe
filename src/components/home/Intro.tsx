import { Photo } from '@/components/ui'
import { home } from '@/data'

/** Short story beside a 4:5 photo; stacks below 768px. */
export function Intro() {
  const { title, story, storyIsPlaceholder, image } = home.intro
  return (
    <section aria-labelledby="intro-title" className="py-section">
      <div className="container grid-layout items-center gap-y-12">
        <div className="col-span-4 flex flex-col gap-6 md:col-span-2 lg:col-span-6">
          <h2 id="intro-title" className="text-h2 text-balance">
            {title}
          </h2>
          {/* TODO(copy): placeholder story, see src/data/home.ts */}
          <p data-todo={storyIsPlaceholder || undefined} className="prose-width text-body-lg">
            {story.join(' ')}
          </p>
        </div>
        <Photo
          image={image}
          ratio="dish"
          sizes="(width >= 64em) 40vw, (width >= 48em) 50vw, 100vw"
          className="col-span-4 md:col-span-2 lg:col-span-5 lg:col-start-8"
        />
      </div>
    </section>
  )
}
