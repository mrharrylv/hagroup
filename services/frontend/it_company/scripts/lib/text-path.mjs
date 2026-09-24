/**
 * Turns a line of text into SVG path data, so the share images render the
 * same glyphs on every machine.
 *
 * sharp's own text renderer asks the system for fonts, which on macOS silently
 * substitutes Helvetica and on a bare Linux box may find nothing at all. Paths
 * drawn from the font files in node_modules do not depend on what is installed.
 *
 * @fontsource ships Inter split by script (latin, latin-ext, cyrillic), so a
 * "font" here is a stack: each character is drawn from the first file that
 * has a glyph for it. "Rīga" needs latin plus latin-ext; "Рига" needs cyrillic.
 */
import { readFileSync } from 'node:fs'
import opentype from 'opentype.js'

/** @param {string[]} files paths to .woff/.ttf/.otf files, most specific first */
export function loadFontStack(files) {
  if (files.length === 0) throw new Error('loadFontStack: no font files given')
  return files.map((file) => {
    const bytes = readFileSync(file)
    return opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))
  })
}

function fontFor(stack, char) {
  const font = stack.find((candidate) => candidate.charToGlyphIndex(char) > 0)
  if (font === undefined) throw new Error(`No font in the stack has a glyph for "${char}" (U+${char.codePointAt(0).toString(16)})`)
  return font
}

/** Width of `text` at `size` px, including kerning between glyphs of the same file. */
export function measureText(stack, text, size) {
  return layout(stack, text, size, 0, 0).width
}

/**
 * @param {ReturnType<typeof loadFontStack>} stack
 * @param {string} text
 * @param {{ size: number, x: number, y: number, anchor?: 'start' | 'middle' }} options
 *   `y` is the baseline; with anchor 'middle', `x` is the horizontal centre.
 * @returns {{ d: string, width: number }}
 */
export function textToPath(stack, text, { size, x, y, anchor = 'start' }) {
  const width = measureText(stack, text, size)
  const startX = anchor === 'middle' ? x - width / 2 : x
  return layout(stack, text, size, startX, y)
}

/**
 * The largest size, no bigger than `maxSize`, at which `text` fits `maxWidth`.
 * Share cards are rendered in three languages from one layout, and Latvian and
 * Russian run longer than English.
 */
export function fitSize(stack, text, { maxSize, minSize, maxWidth }) {
  for (let size = maxSize; size >= minSize; size -= 1) {
    if (measureText(stack, text, size) <= maxWidth) return size
  }
  throw new Error(`"${text}" does not fit ${maxWidth}px even at ${minSize}px`)
}

function layout(stack, text, size, startX, baseline) {
  const parts = []
  let cursor = startX
  let previous = null

  for (const char of Array.from(text)) {
    const font = fontFor(stack, char)
    const glyph = font.charToGlyph(char)
    const scale = size / font.unitsPerEm

    if (previous !== null && previous.font === font) {
      cursor += font.getKerningValue(previous.glyph, glyph) * scale
    }
    parts.push(glyph.getPath(cursor, baseline, size).toPathData(2))
    cursor += glyph.advanceWidth * scale
    previous = { font, glyph }
  }

  return { d: parts.filter(Boolean).join(' '), width: cursor - startX }
}
