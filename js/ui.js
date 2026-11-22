import { h } from './dom.js';
import { icon } from './icons.js';

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
