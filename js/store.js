// Persistência em localStorage (chave versionada). O app funciona mesmo se o storage falhar.
import { FIELD_LIMITS, SCHEMA_VERSION, newAnalysis, sanitizeAnalysis } from './model.js';

export const KEY = 'oceano-azul:v1';
const SAVE_DELAY_MS = 500;

let db = { schemaVersion: SCHEMA_VERSION, analyses: [] };
let canSave = true;
let status = 'saved';
let timer = null;
const listeners = new Set();

function emit(next) {
  status = next;
  listeners.forEach((fn) => fn({ status, canSave }));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export const getState = () => ({ status, canSave });

export function init() {
  let raw = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    canSave = false;
    return;
  }
  if (raw === null) return;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.analyses)) throw new Error('formato');
    // Dados de uma versão mais nova: lemos o que der, mas não sobrescrevemos.
    if (Number.isInteger(parsed.schemaVersion) && parsed.schemaVersion > SCHEMA_VERSION) canSave = false;
    db.analyses = parsed.analyses.map((a) => sanitizeAnalysis(a)).filter(Boolean);
  } catch {
    try { localStorage.setItem(`${KEY}:corrompido`, raw); } catch { /* ignora */ }
  }
}

function persist() {
  if (!canSave) return emit('error');
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
    emit('saved');
  } catch {
    canSave = false;
    emit('error');
  }
}

function schedule() {
  emit('saving');
  clearTimeout(timer);
  timer = setTimeout(() => { timer = null; persist(); }, SAVE_DELAY_MS);
}

export function flush() {
  if (!timer) return;
  clearTimeout(timer);
  timer = null;
  persist();
}

export const list = () => [...db.analyses].sort((a, b) => b.updatedAt - a.updatedAt);
export const get = (id) => db.analyses.find((a) => a.id === id) || null;

export function add(analysis) {
  db.analyses.push(analysis);
  flush();
  persist();
  return analysis;
}

export const create = () => add(newAnalysis());

export function edit(id, fn) {
  const a = get(id);
  if (!a) return;
  fn(a);
  a.updatedAt = Date.now();
  schedule();
}

export const rename = (id, name) =>
  edit(id, (a) => { a.name = name.replace(/\s+/g, ' ').trim().slice(0, FIELD_LIMITS.name); });

export function duplicate(id) {
  const src = get(id);
  if (!src) return null;
  const copy = sanitizeAnalysis(src, { fresh: true });
  if (copy.name) {
    copy.name = `${copy.name} (cópia)`.slice(0, FIELD_LIMITS.name);
  } else {
    const [first = '', ...rest] = copy.idea.split('\n');
    copy.idea = [`${first} (cópia)`.trim(), ...rest].join('\n');
  }
  return add(copy);
}

export function remove(id) {
  db.analyses = db.analyses.filter((a) => a.id !== id);
  persist();
}

export const flushOnLeave = () => {
  addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
};
