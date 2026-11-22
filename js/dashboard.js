// Etapa final: painel com indicadores, gráficos, brecha, matriz e teste de 7 dias.
import { h } from './dom.js';
import { RULES, formatDate, ideaTitle } from './model.js';
import { computeMetrics, countdownText, daysUntil, fmt1 } from './metrics.js';
import { chartAvailable, chartFallback, chartSummary, dataTable, diffChart, lineChart } from './charts.js';
import { buildActions } from './actions.js';

const text = (value, empty = 'Não preenchido') =>
  value.trim() ? h('p', { class: 'pre' }, value) : h('p', { class: 'empty' }, empty);

function kpi(label, value, note, mod = '') {
  return h('div', { class: `kpi ${mod}`.trim() }, h('span', { class: 'kpi-label' }, label), h('strong', { class: 'kpi-value' }, value), h('span', { class: 'kpi-note' }, note));
}

function indicators(m) {
  const none = m.rated === 0;
  return h(
    'div',
    { class: 'kpis' },
    kpi('Oceano vermelho', none ? '—' : `${m.red} de ${m.rated}`, 'fatores com notas iguais', m.red > 0 ? 'kpi--red' : ''),
    kpi('Acima da concorrência', none ? '—' : String(m.above), none ? 'dê notas no Raio-x' : `${m.below} abaixo da concorrência`, 'kpi--up'),
    kpi('Média das notas', none ? '—' : `${fmt1(m.avgMine)} x ${fmt1(m.avgOthers)}`, 'meu negócio x concorrência'),
    kpi('Maior diferencial', m.best ? `+${m.best.diff}` : '—', m.best ? m.best.name : 'nenhum fator à frente ainda', 'kpi--up'),
  );
}

function matrix(a) {
  return h(
    'div',
    { class: 'matrix' },
    ...RULES.map((r) => h('section', { class: `quad q-${r.key}` }, h('h4', {}, r.title), h('p', { class: 'quad-prompt' }, r.prompt), text(a.rules[r.key], '—'))),
  );
}

function testCard(a) {
  const days = daysUntil(a.test.until);
  const late = days !== null && days < 0;
  return h(
    'section',
    { class: 'card test-card' },
    h('h3', {}, 'Meu teste de 7 dias'),
    h('p', { class: `countdown${late ? ' is-late' : ''}` }, countdownText(days), a.test.until && h('span', {}, ` · até ${formatDate(a.test.until)}`)),
    h('dl', { class: 'facts' },
      h('dt', {}, 'Eu vou testar'), h('dd', {}, text(a.test.what, '—')),
      h('dt', {}, 'Deu certo se'), h('dd', {}, text(a.test.success, '—')),
      h('dt', {}, 'Quem vai me cobrar'), h('dd', {}, text(a.test.who, '—'))),
  );
}

export function buildDashboard(a, ctx) {
  const m = computeMetrics(a.factors);
  const lineCanvas = h('canvas', { role: 'img', 'aria-label': chartSummary(a.factors) });
  const barsCanvas = h('canvas', { role: 'img', 'aria-label': 'Barras com a diferença de nota (meu negócio menos concorrência) em cada fator. Os valores estão na tabela.' });
  const printImg = h('img', { class: 'print-img', alt: '' });
  let line = null;
  let bars = null;
  const syncPrint = () => { if (line) printImg.src = line.chart.toBase64Image(); };

  ctx.afterMount(() => {
    if (!chartAvailable()) return;
    line = lineChart(lineCanvas, a.factors);
    bars = diffChart(barsCanvas, a.factors);
    syncPrint();
  });
  window.addEventListener('beforeprint', syncPrint);
  ctx.onCleanup(() => {
    window.removeEventListener('beforeprint', syncPrint);
    line?.destroy();
    bars?.destroy();
  });

  const ok = chartAvailable();
  return h(
    'div',
    { class: 'summary' },
    buildActions(a, { beforePrint: syncPrint }),
    h(
      'article',
      { class: 'sheet', 'aria-label': 'Painel da análise' },
      h('header', { class: 'sheet-head' }, h('p', { class: 'kicker' }, 'Estratégia do Oceano Azul'), h('h3', { class: 'sheet-title' }, ideaTitle(a)), a.idea.trim() && h('p', { class: 'pre idea' }, a.idea)),
      indicators(m),
      h(
        'section',
        { class: 'card chart-card' },
        h('h3', {}, 'Raio-x: curva de valor'),
        ok ? h('div', { class: 'chart-box chart-box--line chart-box--tall' }, lineCanvas, printImg) : chartFallback(),
        h('details', { class: 'data-table no-print', open: !ok }, h('summary', {}, 'Ver os dados do gráfico em tabela'), dataTable(a.factors)),
      ),
      ok && h(
        'section',
        { class: 'card chart-card no-print' },
        h('h3', {}, 'Diferença por fator'),
        h('p', { class: 'muted' }, 'Verde: meu negócio na frente. Vermelho: concorrência na frente. Sem barra: notas iguais (oceano vermelho).'),
        h('div', { class: `chart-box chart-box--bars n-${a.factors.length}` }, barsCanvas),
      ),
      h('section', { class: 'gap' }, h('h3', {}, 'A brecha: onde ninguém está'), text(a.gap)),
      h('section', { class: 'rules' }, h('h3', {}, 'Minha nova regra do jogo'), matrix(a)),
      testCard(a),
      h('p', { class: 'sheet-foot' }, 'Baseado na Estratégia do Oceano Azul (W. Chan Kim e Renée Mauborgne).'),
    ),
  );
}
