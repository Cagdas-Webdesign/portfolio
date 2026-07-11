// Phase 1 migration extractor: pulls CSS, JS and body markup out of the
// original single-file portfolio and emits Vite/React sources.
// Run from portfolio-react/: node scripts/extract.mjs
import * as cheerio from 'cheerio';
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve('..', 'index (6).html');
const html = fs.readFileSync(SRC, 'utf8');
const $ = cheerio.load(html);

const outStyles = path.resolve('src/styles');
const outComponents = path.resolve('src/components');
const outLegacy = path.resolve('public/legacy');
for (const d of [outStyles, outComponents, outLegacy]) fs.mkdirSync(d, { recursive: true });

// ---------------------------------------------------------------- CSS
// Cascade order must match the original document exactly.
const styleBlocks = [];
$('style').each((i, el) => {
  const id = $(el).attr('id') || `anon-${i}`;
  styleBlocks.push({ id, css: $(el).text() });
});
const bodyIndex = html.indexOf('<body>');
// Blocks that appear before <body> vs after (document order preserved either way)
let headCss = [], bodyCss = [];
let cursor = 0;
$('style').each((i, el) => {
  const css = styleBlocks[i].css;
  const pos = html.indexOf(css.length > 40 ? css.slice(0, 40) : css, cursor);
  const target = pos !== -1 && pos < bodyIndex ? headCss : bodyCss;
  if (pos !== -1) cursor = pos;
  target.push(`/* ==== style block #${i} id="${styleBlocks[i].id}" ==== */\n${css}`);
});
// Pre-existing syntax error in block v108: a dangling selector before `}`.
// Browsers drop just that selector; replicate that so PostCSS parses cleanly
// and the error can't swallow the following block in the concatenated file.
const fixed = headCss.join('\n\n').replace(
  '  .final-bring-section .badge-auto .fb-badge-icon::before,\n  }', '  }'
);
fs.writeFileSync(path.join(outStyles, 'base.css'), fixed);
fs.writeFileSync(path.join(outStyles, 'patches.css'), bodyCss.join('\n\n'));
console.log(`CSS: ${headCss.length} head blocks -> base.css, ${bodyCss.length} body blocks -> patches.css`);

// ---------------------------------------------------------------- Legacy JS
// Each inline script becomes its own classic script file, loaded in order,
// so shared-global-scope semantics match the original page.
let jsCount = 0;
$('script').each((i, el) => {
  const src = $(el).attr('src');
  const type = $(el).attr('type');
  if (src) return; // CDN gsap replaced by npm
  if (type && type !== 'text/javascript') return; // skip application/json data block
  const code = $(el).text();
  if (!code.trim()) return;
  const id = $(el).attr('id') || 'anon';
  fs.writeFileSync(
    path.join(outLegacy, `block-${String(jsCount).padStart(2, '0')}.js`),
    `/* legacy inline script #${jsCount} id="${id}" */\n${code}`
  );
  jsCount++;
});
fs.writeFileSync(
  path.resolve('src/legacy-manifest.json'),
  JSON.stringify({ count: jsCount }, null, 2)
);
console.log(`JS: ${jsCount} inline blocks -> public/legacy/`);

// ---------------------------------------------------------------- JSX
const BOOL_ATTRS = new Set(['muted', 'loop', 'autoplay', 'controls', 'playsinline', 'hidden', 'disabled', 'checked', 'selected', 'async', 'defer', 'novalidate', 'required', 'open']);
const ATTR_MAP = {
  class: 'className', for: 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly',
  maxlength: 'maxLength', autoplay: 'autoPlay', playsinline: 'playsInline',
  autocomplete: 'autoComplete', spellcheck: 'spellCheck', srcset: 'srcSet',
  crossorigin: 'crossOrigin', frameborder: 'frameBorder', allowfullscreen: 'allowFullScreen',
  contenteditable: 'contentEditable', novalidate: 'noValidate', autofocus: 'autoFocus',
  'xlink:href': 'xlinkHref', 'xmlns:xlink': 'xmlnsXlink', 'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin',
  'stroke-dasharray': 'strokeDasharray', 'stroke-dashoffset': 'strokeDashoffset',
  'stroke-miterlimit': 'strokeMiterlimit', 'stroke-opacity': 'strokeOpacity',
  'fill-rule': 'fillRule', 'fill-opacity': 'fillOpacity', 'clip-rule': 'clipRule',
  'clip-path': 'clipPath', 'font-family': 'fontFamily', 'font-size': 'fontSize',
  'font-weight': 'fontWeight', 'letter-spacing': 'letterSpacing', 'text-anchor': 'textAnchor',
  'dominant-baseline': 'dominantBaseline', 'stop-color': 'stopColor', 'stop-opacity': 'stopOpacity',
  'vector-effect': 'vectorEffect', 'shape-rendering': 'shapeRendering',
  'color-interpolation-filters': 'colorInterpolationFilters', 'flood-color': 'floodColor',
  'flood-opacity': 'floodOpacity', 'baseline-shift': 'baselineShift',
  'alignment-baseline': 'alignmentBaseline', 'paint-order': 'paintOrder',
  'marker-end': 'markerEnd', 'marker-start': 'markerStart', 'marker-mid': 'markerMid',
  'stroke-linecap:': 'strokeLinecap', 'transform-origin': 'transformOrigin',
};
const VOID_OK = true;

function splitDecls(styleText) {
  // split on ';' but not inside parentheses (data: URIs contain ';')
  const decls = [];
  let depth = 0, cur = '';
  for (const ch of styleText) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ';' && depth === 0) { decls.push(cur); cur = ''; }
    else cur += ch;
  }
  if (cur.trim()) decls.push(cur);
  return decls;
}

function styleToObject(styleText) {
  const entries = [];
  for (const decl of splitDecls(styleText)) {
    const idx = decl.indexOf(':');
    if (idx === -1) continue;
    let prop = decl.slice(0, idx).trim();
    const val = decl.slice(idx + 1).trim();
    if (!prop) continue;
    if (!prop.startsWith('--')) {
      prop = prop.replace(/^-(webkit|moz|ms|o)-/, (m, v) => v[0].toUpperCase() + v.slice(1) + '-')
        .replace(/-([a-z])/g, (m, c) => c.toUpperCase());
    }
    entries.push(`${JSON.stringify(prop)}: ${JSON.stringify(val)}`);
  }
  return `{{${entries.join(', ')}}}`;
}

function attrToJsx(name, value) {
  const lower = name.toLowerCase();
  if (lower === 'style') return `style=${styleToObject(value)}`;
  if (lower.startsWith('on') && lower.length > 2) {
    const react = 'on' + lower[2].toUpperCase() + lower.slice(3);
    return `${react}={() => { ${value} }}`;
  }
  let jsxName = ATTR_MAP[lower] || name;
  if (!ATTR_MAP[lower] && lower.includes('-') && !/^(data-|aria-|webkit-)/.test(lower) && !lower.includes(':')) {
    // generic kebab -> camel for remaining svg attrs
    jsxName = lower.replace(/-([a-z])/g, (m, c) => c.toUpperCase());
  }
  if (BOOL_ATTRS.has(lower) && (value === '' || value === lower)) {
    return ATTR_MAP[lower] || lower;
  }
  if (/^[^"{}<>\\\n]*$/.test(value)) return `${jsxName}="${value}"`;
  return `${jsxName}={${JSON.stringify(value)}}`;
}

function nodeToJsx(node, depth) {
  const pad = '  '.repeat(depth);
  if (node.type === 'text') {
    const t = node.data;
    if (t === '') return '';
    // Emit every text node verbatim so the rendered DOM matches the source exactly.
    return pad + '{' + JSON.stringify(t) + '}\n';
  }
  if (node.type === 'comment') return '';
  if (node.type !== 'tag' && node.type !== 'script' && node.type !== 'style') return '';

  const el = $(node);
  const name = node.name;

  if (name === 'script') {
    const attrs = Object.entries(node.attribs || {})
      .map(([k, v]) => attrToJsx(k, v)).join(' ');
    const content = el.text();
    return `${pad}<script ${attrs} dangerouslySetInnerHTML={{ __html: ${JSON.stringify(content)} }} />\n`;
  }

  const attrs = Object.entries(node.attribs || {}).map(([k, v]) => attrToJsx(k, v));
  const open = attrs.length ? `<${name} ${attrs.join(' ')}` : `<${name}`;
  const children = (node.children || []).filter(c => !(c.type === 'text' && c.data === ''));

  if (children.length === 0) return `${pad}${open} />\n`;

  let inner = '';
  for (const child of children) inner += nodeToJsx(child, depth + 1);
  if (inner.trim() === '') return `${pad}${open} />\n`;
  return `${pad}${open}>\n${inner}${pad}</${name}>\n`;
}

// Map top-level body children to component names
const COMPONENT_BY_ID = {
  hero: 'Hero', funnel: 'Funnel', code: 'CodeSection', experience: 'Experience',
  'portfolio-nested-offers': 'NestedOffers', 'ai-portfolio-assistant': 'AiAssistant',
  'certified-social-media-manager': 'Certificate', 'social-lottie': 'SocialLottie',
  reels: 'ReelsShowcase', 'system-story-v64': 'SystemStory', automation: 'Automation',
  'content-engine': 'ContentEngine', contact: 'Contact',
};

const bodyChildren = $('body').children().toArray();
const pieces = []; // { component, jsxNodes: [] }
let pending = []; // nodes not yet assigned (e.g. json data script attaches to next/prev section)

for (const node of bodyChildren) {
  const name = node.name;
  const id = node.attribs?.id || '';
  if (name === 'style' || (name === 'script' && !node.attribs?.type)) continue; // handled above
  if (name === 'script' && node.attribs?.type === 'application/json') {
    // attach data block to the previous piece (reels slider data sits right after #reels)
    if (pieces.length) pieces[pieces.length - 1].nodes.push(node);
    else pending.push(node);
    continue;
  }
  if (name === 'div' && (id === 'cur' || id === 'curR')) {
    let piece = pieces.find(p => p.component === 'Cursor');
    if (!piece) { piece = { component: 'Cursor', nodes: [] }; pieces.push(piece); }
    piece.nodes.push(node);
    continue;
  }
  if (name === 'nav') { pieces.push({ component: 'Nav', nodes: [node] }); continue; }
  if (name === 'section') {
    const comp = COMPONENT_BY_ID[id] || ('Section_' + (id || 'anon').replace(/[^a-zA-Z0-9]/g, '_'));
    pieces.push({ component: comp, nodes: [...pending, node] });
    pending = [];
    continue;
  }
  // anything else top-level: report it and attach to pending
  console.log(`  [!] unmapped top-level <${name} id="${id}" class="${node.attribs?.class || ''}"> -> pending`);
  pending.push(node);
}
if (pending.length) {
  // trailing floating elements (e.g. the fixed AI assistant widget) get their own component
  pieces.push({ component: 'AiAssistantWidget', nodes: pending });
  pending = [];
}

const order = [];
for (const piece of pieces) {
  let jsx = '';
  for (const n of piece.nodes) jsx += nodeToJsx(n, 2);
  const needsFragment = piece.nodes.length > 1;
  const body = needsFragment ? `    <>\n${jsx.replace(/^/gm, '  ')}    </>` : jsx.trimEnd();
  const src = `export default function ${piece.component}() {\n  return (\n${body}\n  );\n}\n`;
  fs.writeFileSync(path.join(outComponents, `${piece.component}.jsx`), src);
  order.push(piece.component);
}
console.log('Components:', order.join(', '));
fs.writeFileSync(path.resolve('src/component-order.json'), JSON.stringify(order, null, 2));
