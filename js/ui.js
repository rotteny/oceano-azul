import { h } from './dom.js';
import { icon } from './icons.js';
import { rename } from './store.js';

export function button({ text, icon: iconName, variant = 'secondary', onclick, type = 'button', label, disabled, cls = '' }) {
  return h(
    'button',
    { type, class: `btn btn--${variant} ${cls}`.trim(), onclick, disabled, 'aria-label': label },
    iconName && icon(iconName),
    text && h('span', {}, text),
  );
}

let toastTimer = null;
export function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('is-on');
    el.textContent = '';
  }, 4000);
}

export function confirmDialog({ title, message, confirmLabel = 'Confirmar' }) {
  return new Promise((resolve) => {
    const dialog = h(
      'dialog',
      { class: 'dialog', 'aria-labelledby': 'dlg-title' },
      h(
        'form',
        { method: 'dialog' },
        h('h2', { id: 'dlg-title' }, title),
        h('p', {}, message),
        h(
          'div',
          { class: 'dialog-actions' },
          h('button', { class: 'btn btn--secondary', value: 'cancel', autofocus: true }, 'Cancelar'),
          h('button', { class: 'btn btn--danger', value: 'ok' }, confirmLabel),
        ),
      ),
    );
    dialog.addEventListener('close', () => {
      resolve(dialog.returnValue === 'ok');
      dialog.remove();
    });
    document.body.append(dialog);
    dialog.showModal();
  });
}

// Pede um texto curto (ex.: renomear). Resolve com o texto ou null se cancelar.
export function promptDialog({ title, label, value = '', maxlength = 80, confirmLabel = 'Salvar' }) {
  return new Promise((resolve) => {
    const input = h('input', { id: 'dlg-input', type: 'text', maxlength, value, autofocus: true });
    const dialog = h(
      'dialog',
      { class: 'dialog', 'aria-labelledby': 'dlg-title' },
      h(
        'form',
        { method: 'dialog' },
        h('h2', { id: 'dlg-title' }, title),
        h('div', { class: 'field' }, h('label', { for: 'dlg-input' }, label), input),
        h(
          'div',
          { class: 'dialog-actions' },
          h('button', { class: 'btn btn--secondary', value: 'cancel', formnovalidate: true }, 'Cancelar'),
          h('button', { class: 'btn btn--primary', value: 'ok' }, confirmLabel),
        ),
      ),
    );
    dialog.addEventListener('close', () => {
      resolve(dialog.returnValue === 'ok' ? input.value : null);
      dialog.remove();
    });
    document.body.append(dialog);
    dialog.showModal();
    input.select();
  });
}

export async function renameAnalysis(a, onDone) {
  const next = await promptDialog({ title: 'Renomear análise', label: 'Nome da análise', value: a.name || '' });
  if (next === null) return;
  rename(a.id, next);
  onDone?.();
  toast('Nome atualizado.');
}
