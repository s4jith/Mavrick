/**
 * MAVRICK background scene — the fixed pixel-art world behind every screen.
 *
 * The backdrop is the reference pixel-city artwork (coral-pink → teal sky,
 * crescent moon, clouds, stars, PLAN/FOCUS skyline and the cat on the ledge),
 * loaded as a single image in CSS (`.mvk-bg` → /bg-city.png). It is IDENTICAL on
 * every screen — never vary it per page. All the scene detail lives in the
 * artwork itself, so this component only mounts the fixed background layer.
 */
export function PixelScene() {
  return <div className="mvk-bg" aria-hidden="true" />
}
