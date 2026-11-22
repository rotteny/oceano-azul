// Gráficos com Chart.js (vendorizado em vendor/, global `Chart`) e tabela equivalente.
import { h } from './dom.js';
import { computeMetrics, situation } from './metrics.js';

export const COLORS = {
  mine: '#005EB8',
  others: '#C2570C',
  red: '#B42318',
  up: '#1F6B45',
  down: '#B42318',
  neutral: '#6B7B86',
  grid: '#D5E2E9',
  text: '#0F2A3A',
};

export const chartAvailable = () => typeof globalThis.Chart === 'function';
const short = (text, max = 13) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

function baseOptions() {
  return { responsive: true, maintainAspectRatio: false, animation: false, color: COLORS.text };
}

function lineData(factors) {
  const { rows } = computeMetrics(factors);
  return {
    labels: rows.map((r) => r.name),
    datasets: [
      {
        label: 'Meu negócio', data: rows.map((r) => r.mine), borderColor: COLORS.mine, backgroundColor: COLORS.mine,
        borderWidth: 3, pointRadius: 5, pointHoverRadius: 7, pointStyle: 'circle',
      },
      {
        label: 'Concorrência', data: rows.map((r) => r.others), borderColor: COLORS.others, backgroundColor: COLORS.others,
        borderWidth: 3, borderDash: [7, 4], pointRadius: 5, pointHoverRadius: 7, pointStyle: 'rect',
      },
      {
        label: 'Oceano vermelho (notas iguais)', data: rows.map((r) => (r.diff === 0 ? r.mine : null)), showLine: false,
        pointStyle: 'circle', pointRadius: 13, pointHoverRadius: 13, pointBorderWidth: 3, pointBorderColor: COLORS.red,
        pointBackgroundColor: 'rgba(180, 35, 24, 0.12)', borderColor: COLORS.red, backgroundColor: COLORS.red,
      },
    ],
  };
}

// Curva de valor: retorna { chart, update(factors), destroy() }.
export function lineChart(canvas, factors) {
  const chart = new globalThis.Chart(canvas, {
    type: 'line',
    data: lineData(factors),
    options: {
      ...baseOptions(),
      interaction: { mode: 'index', intersect: false },
      layout: { padding: { top: 4, right: 8 } },
      scales: {
        y: {
          min: 0, max: 6, ticks: { stepSize: 1, callback: (v) => (v >= 1 && v <= 5 ? v : '') },
          grid: { color: COLORS.grid }, title: { display: true, text: 'Nota (1 fraco, 5 forte)' },
        },
        x: {
          grid: { color: COLORS.grid },
          ticks: { autoSkip: false, maxRotation: 60, minRotation: 0, callback(v) { return short(this.getLabelForValue(v)); } },
        },
      },
      plugins: {
        legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 10, padding: 12 } },
        tooltip: {
          filter: (item) => item.datasetIndex < 2,
          callbacks: {
            afterBody(items) {
              const [a, b] = items.map((i) => i.raw);
              return items.length === 2 && a !== null && a === b ? ['Oceano vermelho: notas iguais'] : [];
            },
          },
        },
      },
    },
  });
  return {
    chart,
    update(next) {
      chart.data = lineData(next);
      chart.update('none');
    },
    destroy: () => chart.destroy(),
  };
}

// Barras divergentes: diferença (meu − concorrência) por fator.
export function diffChart(canvas, factors) {
  const { rows } = computeMetrics(factors);
  const color = (d) => (d === null ? COLORS.neutral : d > 0 ? COLORS.up : d < 0 ? COLORS.down : COLORS.neutral);
  const chart = new globalThis.Chart(canvas, {
    type: 'bar',
    data: {
      labels: rows.map((r) => r.name),
      datasets: [{ label: 'Diferença', data: rows.map((r) => r.diff), backgroundColor: rows.map((r) => color(r.diff)), borderRadius: 4 }],
    },
    options: {
      ...baseOptions(),
      indexAxis: 'y',
      scales: {
        x: {
          min: -4, max: 4, grid: { color: COLORS.grid },
          ticks: { stepSize: 1, callback: (v) => (v > 0 ? `+${v}` : v) },
          title: { display: true, text: '← Concorrência na frente | Meu negócio na frente →' },
        },
        y: { grid: { display: false }, ticks: { callback(v) { return short(this.getLabelForValue(v), 16); } } },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => items[0].label,
            label: (item) => {
              const d = item.raw;
              return d === null ? 'Sem nota' : d === 0 ? 'Iguais: oceano vermelho' : `${d > 0 ? '+' : ''}${d} (${d > 0 ? 'acima' : 'abaixo'} da concorrência)`;
            },
          },
        },
      },
    },
  });
  return { chart, destroy: () => chart.destroy() };
}

export function chartSummary(factors) {
  return `Gráfico de linhas com as notas de 1 a 5 de "Meu negócio" e "Concorrência" em ${factors.length} fatores. Os mesmos dados estão na tabela abaixo do gráfico.`;
}

// Tabela equivalente ao gráfico.
export function dataTable(factors) {
  const { rows } = computeMetrics(factors);
  const num = (v) => (v === null ? '—' : String(v));
  return h(
    'table',
    { class: 'data' },
    h('caption', {}, 'Notas do Raio-x por fator'),
    h('thead', {}, h('tr', {}, ...['Nº', 'Fator', 'Meu negócio', 'Concorrência', 'Situação'].map((t) => h('th', { scope: 'col' }, t)))),
    h(
      'tbody',
      {},
      ...rows.map((r) =>
        h(
          'tr',
          { class: r.diff === 0 ? 'is-red' : null },
          h('td', {}, String(r.index + 1)), h('th', { scope: 'row' }, r.name),
          h('td', {}, num(r.mine)), h('td', {}, num(r.others)), h('td', {}, situation(r)),
        ),
      ),
    ),
  );
}

export const chartFallback = () =>
  h('p', { class: 'notice' }, 'Não foi possível carregar o gráfico. Os dados estão na tabela abaixo.');
