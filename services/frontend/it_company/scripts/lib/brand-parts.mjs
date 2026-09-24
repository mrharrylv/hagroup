/**
 * Cuts the one logo file we have into the parts the icons are built from.
 *
 * The only artwork in existence is a white-on-transparent raster lockup: a
 * cloud outline above the wordmark "HA GROUP" (resources/hagroup/logo, no SVG).
 * The favicon wants the cloud alone, with "HA" set inside it, because the full
 * lockup squeezed into 16-48 px is unreadable. That is what the old favicon
 * was, and why it rendered as a smudge.
 *
 * The split is found from the pixels rather than hardcoded: the widest band of
 * empty rows separates cloud from wordmark, and the widest band of empty
 * columns in the wordmark is the space between "HA" and "GROUP".
 */
import sharp from 'sharp'

const EMPTY_ALPHA = 20

/** @returns {Promise<{ lockup: Part, cloud: Part, wordmark: Part, ha: Part }>} */
export async function loadBrandParts(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  const alphaAt = (x, y) => data[(y * width + x) * channels + channels - 1]

  const rowFilled = Array.from({ length: height }, (_, y) => {
    for (let x = 0; x < width; x += 1) if (alphaAt(x, y) > EMPTY_ALPHA) return true
    return false
  })
  const rowGap = widestGap(rowFilled)
  if (rowGap === null) throw new Error(`${file}: no empty band between the mark and the wordmark`)

  const wordTop = rowGap.end + 1
  const columnFilled = Array.from({ length: width }, (_, x) => {
    for (let y = wordTop; y < height; y += 1) if (alphaAt(x, y) > EMPTY_ALPHA) return true
    return false
  })
  const wordGap = widestGap(columnFilled)
  if (wordGap === null) throw new Error(`${file}: no word space in the wordmark`)

  /** Crops to the visible pixels inside [left, right) x [top, bottom). */
  const crop = (left, top, right, bottom) => {
    const box = alphaBounds(alphaAt, { left, top, right, bottom })
    if (box === null) throw new Error(`${file}: nothing visible in ${left},${top} to ${right},${bottom}`)
    return extract(file, box)
  }

  const [lockup, cloud, wordmark, ha] = await Promise.all([
    crop(0, 0, width, height),
    crop(0, 0, width, rowGap.start),
    crop(0, wordTop, width, height),
    crop(0, wordTop, wordGap.start, height),
  ])
  return { lockup, cloud, wordmark, ha }
}

/**
 * @typedef {{ png: Buffer, width: number, height: number }} Part
 * A white-on-transparent PNG cropped tight to its visible pixels.
 */
async function extract(file, region) {
  const { data, info } = await sharp(file).extract(region).png().toBuffer({ resolveWithObject: true })
  return { png: data, width: info.width, height: info.height }
}

/**
 * The tight box around every pixel above EMPTY_ALPHA in a region. sharp's
 * trim() keys off the top-left pixel's colour, and transparent pixels in this
 * file do not all share one RGB value, so it trims nothing.
 */
function alphaBounds(alphaAt, { left, top, right, bottom }) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -1
  let maxY = -1
  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      if (alphaAt(x, y) > EMPTY_ALPHA) {
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
    }
  }
  return maxX < 0 ? null : { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 }
}

/**
 * The longest run of `false` strictly between two `true`s, i.e. a gap with
 * artwork on both sides. Leading and trailing empty space is not a gap.
 */
export function widestGap(filled) {
  const first = filled.indexOf(true)
  const last = filled.lastIndexOf(true)
  let best = null
  let runStart = null
  for (let index = first; index <= last; index += 1) {
    if (!filled[index]) {
      if (runStart === null) runStart = index
    } else if (runStart !== null) {
      if (best === null || index - runStart > best.end - best.start + 1) best = { start: runStart, end: index - 1 }
      runStart = null
    }
  }
  return best
}
