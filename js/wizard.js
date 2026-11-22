// Casca do wizard: etapas, progresso, salvamento, dica de campos vazios e navegação.
import { h } from './dom.js';
import { icon } from './icons.js';
import * as store from './store.js';
import { STEPS, missing } from './model.js';
import { buildIdeia, buildRegra, buildTeste } from './steps.js';
import { buildRaioX } from './raiox.js';
import { buildDashboard } from './dashboard.js';
import { helpBox } from './help.js';
import { button } from './ui.js';

const BUILDERS = [buildIdeia, buildRaioX, buildRegra, buildTeste, buildDashboard];
const LAST = STEPS.length - 1;

const SAVE_TEXT = { saving: 'Salvando…', saved: 'Salvo', error: 'Não salvo' };

export function renderWizard(root, a, step) {
  const go = (i) => { location.hash = i < 0 ? '#/' : `#/a/${a.id}/${i}`; };
  const mounted = [];
  const cleanups = [];

  const hint = h('p', { class: 'hint no-print', hidden: true });
  const refreshHint = () => {
    const list = step === LAST ? [] : missing(step, a);
    hint.hidden = list.length === 0;
    hint.textContent = list.length ? `Ainda em branco: ${list.join(', ')}. Você pode avançar mesmo assim.` : '';
  };
  const ctx = {
    edit: (fn) => store.edit(a.id, fn),
    refreshHint,
    afterMount: (fn) => mounted.push(fn),
    onCleanup: (fn) => cleanups.push(fn),
  };

  const saveLabel = h('span', {});
  const saveStatus = h('span', { class: 'save-status', role: 'status' }, icon('check', 16), saveLabel);
  const paint = ({ status, canSave }) => {
    const key = canSave ? status : 'error';
    saveStatus.dataset.state = key;
    saveLabel.textContent = SAVE_TEXT[key];
  };
  paint(store.getState());
  const unsubscribe = store.subscribe(paint);

  const steps = h(
    'ol',
    { class: 'steps' },
    ...STEPS.map((s, i) =>
      h('li', {}, h('button', {
        type: 'button', class: 'step-dot', 'aria-current': i === step ? 'step' : null, 'aria-label': `Etapa ${i + 1}: ${s.title}`,
        onclick: () => go(i),
      }, String(i + 1))),
    ),
  );

  const heading = h('h2', { class: 'step-title', tabindex: '-1' }, `Etapa ${step + 1} de ${STEPS.length}: ${STEPS[step].title}`);
  const body = h('div', { class: 'step-body' }, BUILDERS[step](a, ctx));

  const nav = h(
    'div',
    { class: 'nav-buttons no-print' },
    button({ text: step === 0 ? 'Minhas ideias' : 'Voltar', icon: 'arrow-left', onclick: () => go(step - 1) }),
    step < LAST && button({ text: step === LAST - 1 ? 'Ver painel' : 'Avançar', icon: 'arrow-right', variant: 'primary', cls: 'btn--next', onclick: () => go(step + 1) }),
    step === LAST && button({ text: 'Minhas ideias', variant: 'primary', onclick: () => go(-1) }),
  );

  root.replaceChildren(
    h('div', { class: 'wizard' },
      h('div', { class: 'wiz-top no-print' }, h('a', { class: 'back-link', href: '#/' }, icon('arrow-left', 16), 'Minhas ideias'), saveStatus),
      steps,
      h('progress', { class: 'progress no-print', max: STEPS.length, value: step + 1, 'aria-label': `Etapa ${step + 1} de ${STEPS.length}` }),
      heading,
      h('div', { class: 'no-print' }, helpBox(step)),
      body, hint, nav),
  );
  refreshHint();
  mounted.forEach((fn) => fn());
  window.scrollTo(0, 0);
  heading.focus({ preventScroll: true });

  return () => {
    unsubscribe();
    cleanups.forEach((fn) => fn());
  };
}
