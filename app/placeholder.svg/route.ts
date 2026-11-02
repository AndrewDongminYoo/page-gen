// GET /placeholder.svg?width=640&height=360&text=Hero
// Neutral placeholder for images the client hasn't supplied yet.
// design-lint flags every reference at delivery time.

const BG = "#e5e5e5" // design-lint-ignore standalone SVG, no access to CSS tokens
const FG = "#737373" // design-lint-ignore standalone SVG, no access to CSS tokens

export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clamp = (v: string | null, d: number) =>
    Math.min(4000, Math.max(1, Number.parseInt(v ?? "", 10) || d))
  const w = clamp(searchParams.get("width"), 640)
  const h = clamp(searchParams.get("height"), 360)
  const label = (searchParams.get("text") ?? `${w}×${h}`)
    .slice(0, 60)
    .replace(/[<>&"']/g, "")
  const size = Math.max(12, Math.round(Math.min(w, h) / 10))

  // design-lint-ignore-next-line
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="${BG}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${size}" fill="${FG}">${label}</text></svg>`

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
