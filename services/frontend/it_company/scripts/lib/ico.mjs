/**
 * Packs PNG images into a single .ico file.
 *
 * Each entry is stored as PNG rather than as a BMP bitmap. Every browser since
 * IE9, and Google's favicon fetcher, reads PNG-compressed entries, and they are
 * a fraction of the size.
 *
 * Layout: ICONDIR (6 bytes), one ICONDIRENTRY (16 bytes) per image, then the
 * PNG bytes of each image in order.
 */

const HEADER_BYTES = 6
const ENTRY_BYTES = 16

/**
 * @param {{ size: number, png: Buffer }[]} images square PNGs, 1-256 px
 * @returns {Buffer}
 */
export function encodeIco(images) {
  if (images.length === 0) throw new Error('encodeIco: at least one image is required')
  for (const { size, png } of images) {
    if (!Number.isInteger(size) || size < 1 || size > 256) {
      throw new Error(`encodeIco: size ${size} is outside 1-256`)
    }
    if (!isPng(png)) throw new Error(`encodeIco: the ${size}px entry is not a PNG`)
  }

  const header = Buffer.alloc(HEADER_BYTES)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type 1 = icon
  header.writeUInt16LE(images.length, 4)

  let offset = HEADER_BYTES + ENTRY_BYTES * images.length
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(ENTRY_BYTES)
    entry.writeUInt8(size === 256 ? 0 : size, 0) // width, 0 means 256
    entry.writeUInt8(size === 256 ? 0 : size, 1) // height
    entry.writeUInt8(0, 2) // palette colours: none
    entry.writeUInt8(0, 3) // reserved
    entry.writeUInt16LE(1, 4) // colour planes
    entry.writeUInt16LE(32, 6) // bits per pixel
    entry.writeUInt32LE(png.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += png.length
    return entry
  })

  return Buffer.concat([header, ...entries, ...images.map(({ png }) => png)])
}

/**
 * Reads back the directory of an .ico, for tests and sanity checks.
 * @param {Buffer} ico
 * @returns {{ width: number, height: number, bytes: number, offset: number }[]}
 */
export function readIcoDirectory(ico) {
  if (ico.readUInt16LE(0) !== 0 || ico.readUInt16LE(2) !== 1) {
    throw new Error('readIcoDirectory: not an icon file')
  }
  const count = ico.readUInt16LE(4)
  return Array.from({ length: count }, (_, index) => {
    const at = HEADER_BYTES + index * ENTRY_BYTES
    return {
      width: ico.readUInt8(at) || 256,
      height: ico.readUInt8(at + 1) || 256,
      bytes: ico.readUInt32LE(at + 8),
      offset: ico.readUInt32LE(at + 12),
    }
  })
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

function isPng(buffer) {
  return Buffer.isBuffer(buffer) && buffer.subarray(0, 8).equals(PNG_SIGNATURE)
}
