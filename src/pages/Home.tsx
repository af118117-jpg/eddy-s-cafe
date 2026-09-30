import {
  ClosingCTA,
  DrinksSplit,
  Feasts,
  Gallery,
  Hero,
  Intro,
  MenuPreview,
  Signatures,
  SpaceFeature,
  VisitSection,
} from '@/components/home'

/** Section ids used by the nav: #feasts, #coffee, #visit. */
export default function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <Signatures />
      <MenuPreview />
      <Feasts />
      <DrinksSplit />
      <SpaceFeature />
      <Gallery />
      <VisitSection />
      <ClosingCTA />
    </>
  )
}
