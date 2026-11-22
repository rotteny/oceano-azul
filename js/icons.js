// Ícones no estilo Lucide (ISC), desenhados em grade 24x24.
import { s } from './dom.js';

const WAVE = (y) =>
  `M2 ${y}c.6.5 1.2 1 2.5 1C7 ${y + 1} 7 ${y - 1} 9.5 ${y - 1}c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1`;

const ICONS = {
  plus: [['path', 'M5 12h14'], ['path', 'M12 5v14']],
  x: [['path', 'M18 6 6 18'], ['path', 'M6 6l12 12']],
  check: [['path', 'M20 6 9 17l-5-5']],
  'arrow-left': [['path', 'M19 12H5'], ['path', 'M12 19l-7-7 7-7']],
  'arrow-right': [['path', 'M5 12h14'], ['path', 'M12 5l7 7-7 7']],
  trash: [
    ['path', 'M3 6h18'],
    ['path', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6'],
    ['path', 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'],
    ['path', 'M10 11v6'],
    ['path', 'M14 11v6'],
  ],
  copy: [
    ['rect', { x: 8, y: 8, width: 14, height: 14, rx: 2 }],
    ['path', 'M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2'],
  ],
  printer: [
    ['path', 'M6 9V2h12v7'],
    ['path', 'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2'],
    ['rect', { x: 6, y: 14, width: 12, height: 8 }],
  ],
  download: [['path', 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'], ['path', 'M7 10l5 5 5-5'], ['path', 'M12 15V3']],
  upload: [['path', 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'], ['path', 'M17 8l-5-5-5 5'], ['path', 'M12 3v12']],
  info: [['circle', { cx: 12, cy: 12, r: 10 }], ['path', 'M12 16v-4'], ['path', 'M12 8h.01']],
  waves: [['path', WAVE(6)], ['path', WAVE(12)], ['path', WAVE(18)]],
  'chevron-down': [['path', 'm6 9 6 6 6-6']],
};

export function icon(name, size = 20) {
  const parts = (ICONS[name] || []).map(([tag, attrs]) =>
    s(tag, typeof attrs === 'string' ? { d: attrs } : attrs),
  );
  return s(
    'svg',
    {
      class: 'icon', width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
      stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round',
      'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false',
    },
    ...parts,
  );
}
