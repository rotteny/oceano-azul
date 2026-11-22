// Exportar/importar JSON e texto simples para WhatsApp.
import { RULES, SCHEMA_VERSION, formatDate, ideaTitle, sanitizeAnalysis, shapeError } from './model.js';
import { computeMetrics, countdownText, daysUntil, fmt1 } from './metrics.js';

const APP_ID = 'oceano-azul';
const MAX_FILE_BYTES = 1024 * 1024;

export function exportEnvelope(a) {
  const { id, ...analysis } = a;
  return { app: APP_ID, schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), analysis: { ...analysis, id } };
}

function slug(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'analise';
}

export function downloadJson(a) {
  const blob = new Blob([JSON.stringify(exportEnvelope(a), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `oceano-azul-${slug(ideaTitle(a))}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Valida o texto de um JSON e devolve uma análise nova (ids regenerados) ou lança Error em pt-BR.
export function parseImport(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('O arquivo não é um JSON válido.');
  }
  if (!data || typeof data !== 'object' || data.app !== APP_ID) throw new Error('Este arquivo não foi gerado pelo Oceano Azul.');
  if (!Number.isInteger(data.schemaVersion) || data.schemaVersion > SCHEMA_VERSION) {
    throw new Error('O arquivo vem de uma versão mais nova do app e não pode ser importado.');
  }
  const problem = shapeError(data.analysis);
  if (problem) throw new Error(problem);
  return sanitizeAnalysis(data.analysis, { fresh: true });
}

export async function readImportFile(file) {
  if (file.size > MAX_FILE_BYTES) throw new Error('O arquivo é grande demais para ser uma análise.');
  return parseImport(await file.text());
}

export function buildText(a) {
  const m = computeMetrics(a.factors);
  const val = (t) => t.trim() || '—';
  const lines = [`OCEANO AZUL: ${ideaTitle(a)}`, '', 'MINHA IDEIA', val(a.idea), '', 'RAIO-X (notas de 1 a 5)'];
  m.rows.forEach((r) => lines.push(`${r.index + 1}. ${r.name}: meu negócio ${r.mine ?? '—'} | concorrência ${r.others ?? '—'}${r.diff === 0 ? ' (oceano vermelho)' : ''}`));
  lines.push(`Médias: meu negócio ${fmt1(m.avgMine)} | concorrência ${fmt1(m.avgOthers)}`);
  lines.push(`Oceano vermelho em ${m.red} fator(es); acima da concorrência em ${m.above}; abaixo em ${m.below}.`);
  if (m.best) lines.push(`Maior diferencial: ${m.best.name} (+${m.best.diff}).`);
  lines.push(`Brecha (onde ninguém está): ${val(a.gap)}`, '', 'NOVA REGRA DO JOGO');
  RULES.forEach((r) => lines.push(`${r.title}: ${val(a.rules[r.key])}`));
  lines.push('', 'TESTE DE 7 DIAS', `Vou testar: ${val(a.test.what)}`, `Deu certo se: ${val(a.test.success)}`);
  const days = daysUntil(a.test.until);
  lines.push(`Até: ${formatDate(a.test.until) || '—'}${days === null ? '' : ` (${countdownText(days).toLowerCase()})`}`, `Quem vai me cobrar: ${val(a.test.who)}`);
  return lines.join('\n');
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.className = 'sr-only';
    document.body.append(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* ignora */ }
    area.remove();
    return ok;
  }
}
