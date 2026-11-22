// Indicadores calculados a partir das notas do Raio-x (funções puras).
export const factorLabel = (f, i) => f.name.trim() || `Fator ${i + 1}`;

export const fmt1 = (n) => (n === null || n === undefined ? '—' : n.toFixed(1).replace('.', ','));

export function computeMetrics(factors) {
  const rows = factors.map((f, i) => ({
    index: i,
    name: factorLabel(f, i),
    mine: f.mine,
    others: f.others,
    diff: f.mine !== null && f.others !== null ? f.mine - f.others : null,
  }));
  const rated = rows.filter((r) => r.diff !== null);
  const avg = (key) => (rated.length ? rated.reduce((sum, r) => sum + r[key], 0) / rated.length : null);
  const best = rated.filter((r) => r.diff > 0).sort((a, b) => b.diff - a.diff)[0] || null;
  return {
    rows,
    total: factors.length,
    rated: rated.length,
    red: rated.filter((r) => r.diff === 0).length,
    above: rated.filter((r) => r.diff > 0).length,
    below: rated.filter((r) => r.diff < 0).length,
    avgMine: avg('mine'),
    avgOthers: avg('others'),
    best,
  };
}

export const situation = (row) =>
  row.diff === null ? 'Sem nota' : row.diff === 0 ? 'Oceano vermelho' : row.diff > 0 ? 'Acima' : 'Abaixo';

export function daysUntil(iso) {
  const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(iso || '');
  if (!m) return null;
  const target = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86400000);
}

export function countdownText(days) {
  if (days === null) return 'Defina uma data';
  if (days > 1) return `Faltam ${days} dias`;
  if (days === 1) return 'Falta 1 dia';
  if (days === 0) return 'Vence hoje';
  return days === -1 ? 'Venceu há 1 dia' : `Venceu há ${-days} dias`;
}
