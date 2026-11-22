import { h, uid } from './dom.js';

// Campo de texto (ou textarea) com label e dica opcional.
export function field({ label, hint, value = '', multiline = false, rows = 3, type = 'text', placeholder, maxlength = 400, onInput, cls = '' }) {
  const id = uid('f');
  const hintId = hint ? `${id}-hint` : null;
  const control = h(multiline ? 'textarea' : 'input', {
    id,
    type: multiline ? null : type,
    rows: multiline ? rows : null,
    maxlength,
    placeholder,
    value,
    'aria-describedby': hintId,
    oninput: (e) => onInput(e.target.value),
  });
  return h(
    'div',
    { class: `field ${cls}`.trim() },
    h('label', { for: id }, label),
    hint && h('p', { class: 'field-hint', id: hintId }, hint),
    control,
  );
}

// Botões segmentados 1–5 (radios nativos: teclado e leitor de tela de graça).
export function segGroup({ legend, name, value, variant, onChange }) {
  const radios = [1, 2, 3, 4, 5].map((n) => {
    const input = h('input', { type: 'radio', name, value: String(n), checked: value === n });
    input.addEventListener('change', () => onChange(n));
    return h('label', {}, input, h('span', {}, String(n)));
  });
  return h(
    'fieldset',
    { class: `seg-group seg-group--${variant}` },
    h('legend', {}, legend),
    h('div', { class: 'seg' }, ...radios),
    h('div', { class: 'seg-caption', 'aria-hidden': 'true' }, h('span', {}, '1 = fraco'), h('span', {}, '5 = forte')),
  );
}
