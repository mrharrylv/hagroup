const ATTRIBUTE_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '"': '&quot;',
  "'": '&#39;',
  '<': '&lt;',
  '>': '&gt;',
};

const TEXT_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
};

/** Escapes a value for a double- or single-quoted HTML attribute. */
export function escapeAttribute(value: string): string {
  return value.replace(/[&"'<>]/g, (char) => ATTRIBUTE_ESCAPES[char]);
}

/** Escapes a value for an HTML text node such as <title>. */
export function escapeText(value: string): string {
  return value.replace(/[&<>]/g, (char) => TEXT_ESCAPES[char]);
}

/** Escapes a value for XML text or a double-quoted XML attribute. */
export function escapeXml(value: string): string {
  return escapeAttribute(value).replace(/&#39;/g, '&apos;');
}

const LINE_SEPARATOR = new RegExp('\\u2028', 'g');
const PARAGRAPH_SEPARATOR = new RegExp('\\u2029', 'g');

/**
 * JSON for a <script type="application/ld+json"> element. <, > and & become
 * \u escapes, so no string in the data ("</script>", "<!--") can end the
 * element or change how the HTML parser reads it; the JSON value is unchanged.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(LINE_SEPARATOR, '\\u2028')
    .replace(PARAGRAPH_SEPARATOR, '\\u2029');
}
