// Helpers de DOM. Todo texto entra por nó de texto (nunca innerHTML).
const SVG_NS = 'http://www.w3.org/2000/svg';
const PROPS = new Set(['value', 'checked', 'disabled', 'hidden', 'selected']);

function apply(el, props, isSvg) {
  for (const [key, val] of Object.entries(props || {})) {
    if (val === null || val === undefined || val === false) continue;
    if (key.startsWith('on') && typeof val === 'function') {
      el.addEventListener(key.slice(2), val);
    } else if (!isSvg && PROPS.has(key)) {
      el[key] = val;
    } else {
      el.setAttribute(key, val === true ? '' : String(val));
    }
  }
}

function append(el, kids) {
  for (const kid of kids.flat(Infinity)) {
    if (kid === null || kid === undefined || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
}

export function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  apply(el, props, false);
  append(el, kids);
  return el;
}

export function s(tag, props, ...kids) {
  const el = document.createElementNS(SVG_NS, tag);
  apply(el, props, true);
  append(el, kids);
  return el;
}

let counter = 0;
export const uid = (prefix = 'id') => `${prefix}-${++counter}`;
