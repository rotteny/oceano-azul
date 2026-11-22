// Modelo de dados, validação e regras puras (sem DOM).
export const SCHEMA_VERSION = 1;
export const MIN_FACTORS = 3;
export const MAX_FACTORS = 8;
export const DEFAULT_FACTORS = 5;

export const STEPS = [
  { id: 'ideia', title: 'Minha ideia' },
  { id: 'raiox', title: 'Raio-x' },
  { id: 'regra', title: 'Nova regra do jogo' },
  { id: 'teste', title: 'Teste de 7 dias' },
  { id: 'painel', title: 'Painel' },
];

export const RULES = [
  { key: 'tirar', title: 'Tirar', prompt: 'O que todos fazem e o usuário não valoriza' },
  { key: 'diminuir', title: 'Diminuir', prompt: 'O que é entregue além do necessário' },
  { key: 'aumentar', title: 'Aumentar', prompt: 'A dor que ninguém resolve' },
  { key: 'criar', title: 'Criar', prompt: 'O que nunca foi oferecido' },
];

export const TEST_FIELDS = [
  { key: 'what', label: 'Eu vou testar' },
  { key: 'success', label: 'Deu certo se' },
  { key: 'until', label: 'Até (data)' },
  { key: 'who', label: 'Quem vai me cobrar' },
];

const LIMITS = { name: 80, idea: 1000, gap: 600, factor: 80, rule: 400, test: 400 };

export const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const pad = (n) => String(n).padStart(2, '0');

export function datePlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatDate(iso) {
  const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(iso || '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

const newFactor = () => ({ id: newId(), name: '', mine: null, others: null });

export function newAnalysis() {
  const now = Date.now();
  return {
    id: newId(), schemaVersion: SCHEMA_VERSION, createdAt: now, updatedAt: now,
    name: '',
    idea: '',
    factors: Array.from({ length: DEFAULT_FACTORS }, newFactor),
    gap: '',
    rules: Object.fromEntries(RULES.map((r) => [r.key, ''])),
    test: { what: '', success: '', until: '', who: '' },
  };
}

export const addFactor = (a) => a.factors.push(newFactor());

export function ideaTitle(a) {
  const name = (a.name || '').trim();
  const line = name || (a.idea || '').trim().split('\n')[0].trim();
  if (!line) return 'Ideia sem nome';
  return line.length > 60 ? `${line.slice(0, 60)}…` : line;
}

export const isRedOcean = (f) => f.mine !== null && f.mine === f.others;

// ---- validação / saneamento ----
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const okNote = (v) => v === null || (Number.isInteger(v) && v >= 1 && v <= 5);
const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');

export function shapeError(a) {
  if (!isObj(a)) return 'O arquivo não contém uma análise.';
  if (!Array.isArray(a.factors) || a.factors.length < MIN_FACTORS || a.factors.length > MAX_FACTORS) {
    return `O Raio-x precisa ter de ${MIN_FACTORS} a ${MAX_FACTORS} fatores.`;
  }
  for (const f of a.factors) {
    if (!isObj(f) || typeof f.name !== 'string' || !okNote(f.mine) || !okNote(f.others)) {
      return 'Há um fator do Raio-x com dados inválidos (as notas devem ser de 1 a 5 ou vazias).';
    }
  }
  if (a.name !== undefined && typeof a.name !== 'string') return 'O nome da análise é inválido.';
  if (typeof a.idea !== 'string' || typeof a.gap !== 'string') return 'Os textos da ideia ou da brecha estão ausentes.';
  if (!isObj(a.rules) || RULES.some((r) => typeof a.rules[r.key] !== 'string')) {
    return 'As respostas da nova regra do jogo estão ausentes ou inválidas.';
  }
  if (!isObj(a.test) || TEST_FIELDS.some((f) => typeof a.test[f.key] !== 'string')) {
    return 'Os campos do teste de 7 dias estão ausentes ou inválidos.';
  }
  return null;
}

export function sanitizeAnalysis(a, { fresh = false } = {}) {
  if (shapeError(a)) return null;
  const now = Date.now();
  const stamp = (v) => (Number.isFinite(v) ? v : now);
  const until = /^\d{4}-\d\d-\d\d$/.test(a.test.until) ? a.test.until : '';
  return {
    id: fresh || typeof a.id !== 'string' || !a.id ? newId() : a.id.slice(0, 80),
    schemaVersion: SCHEMA_VERSION,
    createdAt: fresh ? now : stamp(a.createdAt),
    updatedAt: fresh ? now : stamp(a.updatedAt),
    name: str(a.name, LIMITS.name).replace(/\s+/g, ' ').trim(),
    idea: str(a.idea, LIMITS.idea),
    factors: a.factors.map((f) => ({ id: newId(), name: str(f.name, LIMITS.factor), mine: f.mine, others: f.others })),
    gap: str(a.gap, LIMITS.gap),
    rules: Object.fromEntries(RULES.map((r) => [r.key, str(a.rules[r.key], LIMITS.rule)])),
    test: {
      what: str(a.test.what, LIMITS.test), success: str(a.test.success, LIMITS.test),
      until, who: str(a.test.who, LIMITS.test),
    },
  };
}

export const FIELD_LIMITS = LIMITS;

// ---- validação leve de preenchimento (não bloqueia) ----
export function missing(step, a) {
  const out = [];
  if (step === 0 && !a.idea.trim()) out.push('a sua ideia');
  if (step === 1) {
    const unnamed = a.factors.filter((f) => !f.name.trim()).length;
    const unrated = a.factors.filter((f) => f.mine === null || f.others === null).length;
    if (unnamed) out.push(unnamed === 1 ? 'o nome de 1 fator' : `o nome de ${unnamed} fatores`);
    if (unrated) out.push(unrated === 1 ? 'as notas de 1 fator' : `as notas de ${unrated} fatores`);
    if (!a.gap.trim()) out.push('a brecha');
  }
  if (step === 2) RULES.forEach((r) => { if (!a.rules[r.key].trim()) out.push(r.title); });
  if (step === 3) TEST_FIELDS.forEach((f) => { if (!a.test[f.key].trim()) out.push(f.label); });
  return out;
}
