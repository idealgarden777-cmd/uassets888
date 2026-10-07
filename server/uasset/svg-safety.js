/*
=========================================================
UASSET — SVG SAFETY CHECK (server)
=========================================================

Uploaded SVGs are inlined on the public site, so any
active content is rejected at upload time:

- <script>, <foreignObject>, <iframe>, <embed>, <object>,
  <use> pointing outside the file, <style>, <meta>, <link>
- DOCTYPE / ENTITY declarations
- on* event attributes (onload, onerror, ...)
- javascript:, vbscript:, data:text/html URLs
- href / xlink:href / src that is not a local "#id" ref
- url(...) that is not a local "#id" ref

Entity-encoded tricks (&#106;avascript:) are decoded
before checking.
=========================================================
*/

const MAX_SVG_LENGTH = 200000;

const BLOCKED_TAGS =
  /<\s*\/?\s*(script|foreignobject|iframe|embed|object|style|meta|link|base|form|input|textarea|audio|video|handler|listener)\b/i;

function decodeEntities(value) {
  return String(value || "")
    .replace(
      /&#x([0-9a-f]+);?/gi,
      (_, hex) =>
        String.fromCodePoint(
          parseInt(hex, 16) || 32
        )
    )
    .replace(
      /&#(\d+);?/g,
      (_, dec) =>
        String.fromCodePoint(
          parseInt(dec, 10) || 32
        )
    )
    .replace(/&colon;/gi, ":")
    .replace(/&tab;|&newline;/gi, "")
    .replace(/&lpar;/gi, "(")
    .replace(/&rpar;/gi, ")");
}

export function checkSvgSafety(svg) {
  const value =
    String(svg || "").trim();

  if (
    !value ||
    value.length > MAX_SVG_LENGTH ||
    !/^<svg\b/i.test(value) ||
    !/<\/svg>\s*$/i.test(value)
  ) {
    return {
      ok: false,
      reason: "Complete SVG markup is required"
    };
  }

  const decoded =
    decodeEntities(value);

  /* Remove whitespace/control chars for scheme checks */
  const compact =
    decoded.replace(
      /[\u0000-\u0020]+/g,
      ""
    );

  const checks = [
    [
      /<!\s*(doctype|entity)/i.test(decoded),
      "DOCTYPE/ENTITY is not allowed in SVG"
    ],
    [
      BLOCKED_TAGS.test(decoded),
      "SVG contains a blocked element (script, style, foreignObject, iframe...)"
    ],
    [
      /[\s"'\/]on[a-z]+\s*=/i.test(decoded),
      "SVG event attributes (onload, onclick...) are not allowed"
    ],
    [
      /(javascript|vbscript|livescript):/i.test(compact) ||
        /data:text\/html/i.test(compact),
      "Script URLs are not allowed in SVG"
    ],
    [
      /\b(?:xlink:)?href\s*=\s*["']?\s*(?!#)[^"'\s>]/i.test(decoded) ||
        /\bsrc\s*=/i.test(decoded),
      "External links (href/src) are not allowed; use local #id references only"
    ],
    [
      /url\(\s*["']?\s*(?!#)[^)]/i.test(decoded),
      "External url(...) references are not allowed in SVG"
    ]
  ];

  for (const [failed, reason] of checks) {
    if (failed) {
      return {
        ok: false,
        reason
      };
    }
  }

  return {
    ok: true,
    svg: value
  };
}
