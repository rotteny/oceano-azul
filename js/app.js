import * as store from './store.js';
import { renderList } from './list.js';
import { renderWizard } from './wizard.js';
import { STEPS } from './model.js';
import { partner } from '../config.js';
import { renderPartner } from './partner.js';

const root = document.getElementById('app');
const warning = document.getElementById('storage-warning');
let cleanup = null;

function route() {
  store.flush();
  cleanup?.();
  cleanup = null;
  const m = /^#\/a\/([\w-]+)(?:\/(\d))?$/.exec(location.hash);
  const analysis = m && store.get(m[1]);
  if (analysis) {
    const step = Math.min(Number(m[2] || 0), STEPS.length - 1);
    cleanup = renderWizard(root, analysis, step);
  } else {
    if (m) history.replaceState(null, '', '#/');
    cleanup = renderList(root);
    document.title = 'Oceano Azul';
  }
}

renderPartner(document.querySelector('.site-header'), partner);
store.init();
store.flushOnLeave();
const syncWarning = ({ canSave }) => { warning.hidden = canSave; };
syncWarning(store.getState());
store.subscribe(syncWarning);
addEventListener('hashchange', route);
document.querySelector('.skip').addEventListener('click', (e) => { e.preventDefault(); root.focus(); });
route();

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
