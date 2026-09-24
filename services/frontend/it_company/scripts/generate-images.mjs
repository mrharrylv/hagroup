#!/usr/bin/env node
/**
 * Renders every search and share image the site ships, from ONE source:
 * brand-source/ha-group-logo-white.png (the white cloud + "HA GROUP" lockup).
 *
 *   npm run images
 *
 * Writes to public/ (served from the site root, deployed with the site):
 *
 *   favicon.ico                16, 32, 48      cloud + "HA" on a dark tile
 *   favicon-96x96.png          what Google's result page shows
 *   favicon-192x192.png
 *   apple-touch-icon.png       180, full bleed: iOS rounds its own corners
 *   icon-512.png               manifest icon
 *   icon-maskable-512.png      manifest icon, mark inside the 80% safe zone
 *   logo-512.png               Organization.logo: the whole lockup, square
 *   og-image.png               1200x630 share card, English
 *   og-image-lv.png, -ru.png   the same card, Latvian and Russian tagline
 *
 * Why these exist at all: every image under /brand/* is white on transparent.
 * On Google's white result page the favicon vanished (Google shows its default
 * globe), and the 512x264 og:image was centre-cropped to a square that read
 * "GROU". Everything here is opaque, square where it has to be, and the share
 * card keeps the whole lockup and tagline inside its central 630px square, so
 * a 1:1, 4:3 or 16:9 crop never cuts the name.
 *
 * Output is committed. Re-run only when the logo or a tagline changes, and keep
 * the file names stable: Google refetches a favicon URL, it does not look for
 * a new one.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

import { loadBrandParts } from './lib/brand-parts.mjs'
import { encodeIco } from './lib/ico.mjs'
import { fitSize, loadFontStack, textToPath } from './lib/text-path.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC_DIR = join(ROOT, 'public')
const SOURCE = join(ROOT, 'brand-source', 'ha-group-logo-white.png')

/** The site's own palette: theme-color, zinc-900, and the indigo/violet glow. */
const INK = '#09090b'
const INK_RAISED = '#1c1c22'
const INDIGO = '#6366f1'
const VIOLET = '#8b5cf6'

/** The share card's tagline, per locale. Keep in step with 6_seo.json's home copy. */
const TAGLINES = {
  en: { line: 'DevOps, cloud & custom software', place: 'Rīga, Latvia · hagroup.lv' },
  lv: { line: 'DevOps, mākonis un programmatūra', place: 'Rīga, Latvija · hagroup.lv' },
  ru: { line: 'DevOps, облака и разработка ПО', place: 'Рига, Латвия · hagroup.lv' },
}

const OG = { width: 1200, height: 630 }
/** The largest square centred on the card: what a 1:1 crop keeps. */
const SAFE = { left: (OG.width - OG.height) / 2, width: OG.height }

const fontFiles = (weight) =>
  ['latin', 'latin-ext', 'cyrillic'].map((subset) =>
    join(ROOT, 'node_modules', '@fontsource', 'inter', 'files', `inter-${subset}-${weight}-normal.woff`),
  )

const pngDataUri = (png) => `data:image/png;base64,${png.toString('base64')}`

/**
 * Grows a white-on-transparent part's strokes by roughly `radius` source px.
 *
 * The logo's outline is about 22px thick at 1135px wide, which shrinks to half
 * a pixel in a 16px favicon and simply disappears. Blurring the alpha and then
 * re-steepening it pushes the edge outwards evenly. (sharp's dilate() is no use
 * here: on an alpha channel it shrinks the shape.)
 */
async function thickened(part, radius) {
  const alpha = await sharp(part.png)
    .extractChannel(3)
    .blur(radius)
    .linear(4, -64)
    .raw()
    .toBuffer({ resolveWithObject: true })
  const png = await sharp({ create: { width: part.width, height: part.height, channels: 3, background: '#ffffff' } })
    .joinChannel(alpha.data, { raw: { width: alpha.info.width, height: alpha.info.height, channels: 1 } })
    .png()
    .toBuffer()
  return { ...part, png }
}

/** A white part, resized to `width`, optionally with its strokes thickened first. */
async function sized(part, width, thicken = 0) {
  const height = Math.round((part.height * width) / part.width)
  const source = thicken > 0 ? await thickened(part, thicken) : part
  const png = await sharp(source.png).resize(width, height, { kernel: 'lanczos3' }).png().toBuffer()
  return { png, width, height }
}

/**
 * The favicon mark: the cloud, with "HA" set in its lower body.
 * `scale` is the cloud's width as a fraction of the tile.
 */
async function markSvg(parts, size, { scale, withLetters, thicken }) {
  const cloudWidth = Math.round(size * scale)
  const cloud = await sized(parts.cloud, cloudWidth, thicken)
  const cloudTop = Math.round((size - cloud.height) / 2 + (withLetters ? size * 0.03 : 0))
  const layers = [
    `<image href="${pngDataUri(cloud.png)}" x="${(size - cloud.width) / 2}" y="${cloudTop}" width="${cloud.width}" height="${cloud.height}"/>`,
  ]
  if (withLetters) {
    const ha = await sized(parts.ha, Math.round(cloudWidth * 0.42), thicken > 0 ? Math.max(1, thicken - 1) : 0)
    layers.push(
      `<image href="${pngDataUri(ha.png)}" x="${(size - ha.width) / 2}" y="${cloudTop + Math.round(cloud.height * 0.5)}" width="${ha.width}" height="${ha.height}"/>`,
    )
  }
  return layers.join('\n  ')
}

async function tile(parts, size, { radius = 0.22, scale = 0.8, withLetters = true, thicken = 0 } = {}) {
  const corner = Math.round(size * radius)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${INK_RAISED}"/><stop offset="1" stop-color="${INK}"/></linearGradient></defs>
  <rect width="${size}" height="${size}" rx="${corner}" fill="url(#g)"/>
  ${await markSvg(parts, size, { scale, withLetters, thicken })}
</svg>`
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer()
}

/** Organization.logo: the full lockup on an opaque square, legible on white and on dark. */
async function logoSquare(parts, size) {
  const lockup = await sized(parts.lockup, Math.round(size * 0.74))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${INK}"/>
  <image href="${pngDataUri(lockup.png)}" x="${(size - lockup.width) / 2}" y="${(size - lockup.height) / 2}" width="${lockup.width}" height="${lockup.height}"/>
</svg>`
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer()
}

async function shareCard(parts, fonts, { line, place }) {
  const lockup = await sized(parts.lockup, 440)
  const lockupTop = 128
  const lineSize = fitSize(fonts.medium, line, { maxSize: 34, minSize: 24, maxWidth: SAFE.width - 60 })
  const placeSize = fitSize(fonts.regular, place, { maxSize: 24, minSize: 18, maxWidth: SAFE.width - 60 })
  const lineBaseline = lockupTop + lockup.height + 78
  const tagline = textToPath(fonts.medium, line, { size: lineSize, x: OG.width / 2, y: lineBaseline, anchor: 'middle' })
  const where = textToPath(fonts.regular, place, { size: placeSize, x: OG.width / 2, y: lineBaseline + 46, anchor: 'middle' })

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG.width}" height="${OG.height}" viewBox="0 0 ${OG.width} ${OG.height}">
  <defs>
    <radialGradient id="glowA" cx="0.5" cy="0.36" r="0.55"><stop offset="0" stop-color="${INDIGO}" stop-opacity="0.42"/><stop offset="1" stop-color="${INDIGO}" stop-opacity="0"/></radialGradient>
    <radialGradient id="glowB" cx="0.8" cy="0.95" r="0.5"><stop offset="0" stop-color="${VIOLET}" stop-opacity="0.28"/><stop offset="1" stop-color="${VIOLET}" stop-opacity="0"/></radialGradient>
    <radialGradient id="glowC" cx="0.12" cy="0.9" r="0.4"><stop offset="0" stop-color="${INDIGO}" stop-opacity="0.16"/><stop offset="1" stop-color="${INDIGO}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${OG.width}" height="${OG.height}" fill="${INK}"/>
  <rect width="${OG.width}" height="${OG.height}" fill="url(#glowA)"/>
  <rect width="${OG.width}" height="${OG.height}" fill="url(#glowB)"/>
  <rect width="${OG.width}" height="${OG.height}" fill="url(#glowC)"/>
  <image href="${pngDataUri(lockup.png)}" x="${(OG.width - lockup.width) / 2}" y="${lockupTop}" width="${lockup.width}" height="${lockup.height}"/>
  <path d="${tagline.d}" fill="#ffffff" fill-opacity="0.92"/>
  <path d="${where.d}" fill="#ffffff" fill-opacity="0.6"/>
</svg>`

  const widest = Math.max(lockup.width, tagline.width, where.width)
  if (widest > SAFE.width) throw new Error(`Share card content is ${Math.round(widest)}px wide; a square crop keeps only ${SAFE.width}px`)
  return sharp(Buffer.from(svg)).flatten({ background: INK }).png({ compressionLevel: 9 }).toBuffer()
}

async function main() {
  const parts = await loadBrandParts(SOURCE)
  const fonts = { medium: loadFontStack(fontFiles(500)), regular: loadFontStack(fontFiles(400)) }

  // 16px cannot hold the letters; there the cloud alone, drawn heavier, reads better.
  const ico = encodeIco([
    { size: 16, png: await tile(parts, 16, { withLetters: false, scale: 0.86, thicken: 26 }) },
    { size: 32, png: await tile(parts, 32, { thicken: 11 }) },
    { size: 48, png: await tile(parts, 48, { thicken: 5 }) },
  ])

  const files = [
    ['favicon.ico', ico],
    ['favicon-96x96.png', await tile(parts, 96, { thicken: 2 })],
    ['favicon-192x192.png', await tile(parts, 192)],
    ['apple-touch-icon.png', await tile(parts, 180, { radius: 0 })],
    ['icon-512.png', await tile(parts, 512, { radius: 0 })],
    ['icon-maskable-512.png', await tile(parts, 512, { radius: 0, scale: 0.58 })],
    ['logo-512.png', await logoSquare(parts, 512)],
    ['og-image.png', await shareCard(parts, fonts, TAGLINES.en)],
    ['og-image-lv.png', await shareCard(parts, fonts, TAGLINES.lv)],
    ['og-image-ru.png', await shareCard(parts, fonts, TAGLINES.ru)],
  ]

  mkdirSync(PUBLIC_DIR, { recursive: true })
  for (const [name, buffer] of files) {
    writeFileSync(join(PUBLIC_DIR, name), buffer)
    console.log(`  ${name.padEnd(24)} ${(buffer.length / 1024).toFixed(1).padStart(6)} KB`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
