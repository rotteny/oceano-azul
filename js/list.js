// Tela inicial: lista de análises salvas.
import { h } from './dom.js';
import * as store from './store.js';
import { ideaTitle } from './model.js';
import { button, confirmDialog, toast } from './ui.js';
import { importControl } from './actions.js';

const stamp = (ms) =>
  new Date(ms).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const open = (id, step = 0) => { location.hash = `#/a/${id}/${step}`; };

export function renderList(root) {
  const draw = () => {
    const items = store.list();
    root.replaceChildren(
      h('section', { class: 'home' },
        h('h1', {}, 'Encontre o seu oceano azul'),
        h('p', { class: 'lead' }, 'Responda em poucos passos: compare a sua ideia com quem já existe, ache a brecha e planeje um teste de 7 dias.'),
        h('div', { class: 'actions' },
          button({ text: 'Nova análise', icon: 'plus', variant: 'primary', onclick: () => open(store.create().id) }),
          ...importControl()),
        h('h2', { class: 'list-title' }, 'Minhas ideias'),
        items.length
          ? h('ul', { class: 'idea-list' }, ...items.map(card))
          : h('p', { class: 'empty-state' }, 'Você ainda não tem nenhuma análise. Toque em "Nova análise" para começar.')),
    );
  };

  const card = (a) =>
    h('li', { class: 'idea-card' },
      h('div', { class: 'idea-info' }, h('h3', {}, ideaTitle(a)), h('p', { class: 'muted' }, `Alterada em ${stamp(a.updatedAt)}`)),
      h('div', { class: 'idea-actions' },
        button({ text: 'Abrir', icon: 'arrow-right', variant: 'primary', label: `Abrir: ${ideaTitle(a)}`, onclick: () => open(a.id) }),
        button({ text: 'Duplicar', icon: 'copy', label: `Duplicar: ${ideaTitle(a)}`, onclick: () => { store.duplicate(a.id); draw(); toast('Análise duplicada.'); } }),
        button({
          text: 'Excluir', icon: 'trash', variant: 'danger-outline', label: `Excluir: ${ideaTitle(a)}`,
          onclick: async () => {
            const ok = await confirmDialog({ title: 'Excluir esta análise?', message: `"${ideaTitle(a)}" será apagada deste navegador. Isso não pode ser desfeito.`, confirmLabel: 'Excluir' });
            if (!ok) return;
            store.remove(a.id);
            draw();
            toast('Análise excluída.');
          },
        })));

  draw();
  return () => {};
}
