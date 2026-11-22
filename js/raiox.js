// Passo 1: Raio-x da ideia (fatores, notas 1–5, curva de valor ao vivo).
import { h } from './dom.js';
import { icon } from './icons.js';
import { field, segGroup } from './fields.js';
import { FIELD_LIMITS, MAX_FACTORS, MIN_FACTORS, addFactor, isRedOcean } from './model.js';
import { button, toast } from './ui.js';
import { chartAvailable, chartFallback, chartSummary, dataTable, lineChart } from './charts.js';

const PLACEHOLDERS = ['Preço', 'Atendimento', 'Variedade', 'Conveniência', 'Marca', 'Prazo', 'Qualidade', 'Localização'];

export function buildRaioX(a, ctx) {
  const factorsHost = h('div', { class: 'factors' });
  const addBtn = button({ text: 'Adicionar fator', icon: 'plus', onclick: () => {
    ctx.edit(() => addFactor(a));
    render();
    changed();
    factorsHost.querySelector('.factor:last-child input[type="text"]')?.focus();
  } });
  const canvas = h('canvas', { role: 'img', 'aria-label': chartSummary(a.factors) });
  const tableHost = h('div', { class: 'table-host' });
  let live = null;

  function refreshChart() {
    live?.update(a.factors);
    tableHost.replaceChildren(dataTable(a.factors));
    canvas.setAttribute('aria-label', chartSummary(a.factors));
  }

  function changed() {
    refreshChart();
    ctx.refreshHint();
  }

  function factorCard(f, i) {
    const badge = h('span', { class: 'badge-red', hidden: !isRedOcean(f) }, 'oceano vermelho');
    const card = h('article', { class: `factor${isRedOcean(f) ? ' is-red' : ''}` });
    const update = () => {
      card.classList.toggle('is-red', isRedOcean(f));
      badge.hidden = !isRedOcean(f);
      changed();
    };
    const remove = button({
      icon: 'x', variant: 'ghost', label: `Remover o fator ${i + 1}`, disabled: a.factors.length <= MIN_FACTORS, cls: 'btn--icon',
      onclick: () => {
        ctx.edit(() => a.factors.splice(i, 1));
        render();
        changed();
        toast('Fator removido.');
      },
    });
    card.append(
      h('div', { class: 'factor-head' }, h('h3', {}, `Fator ${i + 1}`), badge, remove),
      field({
        label: 'Em que a categoria compete', maxlength: FIELD_LIMITS.factor, value: f.name,
        placeholder: `ex.: ${PLACEHOLDERS[i % PLACEHOLDERS.length]}`,
        onInput: (v) => { ctx.edit(() => { f.name = v; }); changed(); },
      }),
      h(
        'div',
        { class: 'seg-pair' },
        segGroup({ legend: 'Minha ideia (1 a 5)', name: `m-${f.id}`, value: f.mine, variant: 'mine', onChange: (n) => { ctx.edit(() => { f.mine = n; }); update(); } }),
        segGroup({ legend: 'Quem já existe (1 a 5)', name: `o-${f.id}`, value: f.others, variant: 'others', onChange: (n) => { ctx.edit(() => { f.others = n; }); update(); } }),
      ),
    );
    return card;
  }

  function render() {
    factorsHost.replaceChildren(...a.factors.map(factorCard));
    addBtn.disabled = a.factors.length >= MAX_FACTORS;
    addBtn.lastChild.textContent = a.factors.length >= MAX_FACTORS ? `Máximo de ${MAX_FACTORS} fatores` : 'Adicionar fator';
  }
  render();

  ctx.afterMount(() => {
    if (chartAvailable()) live = lineChart(canvas, a.factors);
    refreshChart();
  });
  ctx.onCleanup(() => live?.destroy());

  return h(
    'div',
    { class: 'raiox' },
    h('p', { class: 'instruction' }, 'Dê notas de 1 (fraco) a 5 (forte). Onde as notas são iguais, você está no oceano vermelho.'),
    factorsHost,
    h('div', { class: 'add-row' }, addBtn, h('span', { class: 'muted' }, `De ${MIN_FACTORS} a ${MAX_FACTORS} fatores.`)),
    h(
      'section',
      { class: 'card chart-card' },
      h('h3', {}, 'Curva de valor'),
      h('p', { class: 'muted' }, 'Atualiza conforme você dá as notas. Pontos circulados em vermelho são oceano vermelho.'),
      chartAvailable()
        ? h('div', { class: 'chart-box chart-box--line' }, canvas)
        : chartFallback(),
      h('details', { class: 'data-table', open: !chartAvailable() }, h('summary', {}, 'Ver os dados do gráfico em tabela'), tableHost),
    ),
    field({
      label: 'Onde ninguém está (a brecha)', multiline: true, rows: 3, maxlength: FIELD_LIMITS.gap, value: a.gap,
      onInput: (v) => { ctx.edit(() => { a.gap = v; }); ctx.refreshHint(); },
    }),
  );
}
