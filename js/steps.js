// Etapas simples do wizard: ideia, nova regra do jogo e teste de 7 dias.
import { h } from './dom.js';
import { field } from './fields.js';
import { FIELD_LIMITS, RULES, TEST_FIELDS, datePlus } from './model.js';

export function buildIdeia(a, ctx) {
  return h(
    'div',
    { class: 'step-fields' },
    field({
      label: 'Nome da análise', cls: 'field--name', maxlength: FIELD_LIMITS.name, value: a.name, placeholder: 'ex.: Food truck de açaí',
      hint: 'É o nome que aparece na lista "Minhas ideias". Você pode mudar quando quiser.',
      onInput: (v) => ctx.edit(() => { a.name = v; }),
    }),
    field({
      label: 'Minha ideia (ou um problema que vivo no dia a dia)', multiline: true, rows: 6,
      maxlength: FIELD_LIMITS.idea, value: a.idea, placeholder: 'Escreva com as suas palavras.',
      onInput: (v) => ctx.edit(() => { a.idea = v; }),
    }),
  );
}

export function buildRegra(a, ctx) {
  return h(
    'div',
    { class: 'quads' },
    h('p', { class: 'instruction' }, 'Uma resposta em cada quadro. Comece pelo Tirar.'),
    ...RULES.map((r) =>
      h(
        'section',
        { class: `quad q-${r.key}` },
        h('h3', {}, r.title),
        field({
          label: r.prompt, multiline: true, rows: 3, maxlength: FIELD_LIMITS.rule, value: a.rules[r.key],
          onInput: (v) => ctx.edit(() => { a.rules[r.key] = v; }),
        }),
      ),
    ),
  );
}

export function buildTeste(a, ctx) {
  if (!a.test.until) ctx.edit(() => { a.test.until = datePlus(7); });
  return h(
    'div',
    { class: 'step-fields' },
    h('p', { class: 'instruction' }, 'Teste antes de investir. Escreva, tire uma foto e mostre para quem vai te cobrar.'),
    ...TEST_FIELDS.map((f) =>
      field({
        label: f.label, type: f.key === 'until' ? 'date' : 'text', multiline: f.key === 'what' || f.key === 'success',
        rows: 2, maxlength: FIELD_LIMITS.test, value: a.test[f.key],
        hint: f.key === 'until' ? 'Sugestão: 7 dias a partir de hoje. Você pode trocar.' : undefined,
        onInput: (v) => ctx.edit(() => { a.test[f.key] = v; }),
      }),
    ),
  );
}
