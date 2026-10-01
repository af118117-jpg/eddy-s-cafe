// Photos imported through the `photo` preset in vite.config.ts, e.g.
// `import hero from '../../assets-source/hero.jpg?aspect=4:5&photo'`.
declare module '*&photo' {
  const picture: import('./data/images').Picture
  export default picture
}
