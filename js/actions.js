// Barra de ações do painel e botão de importar (reaproveitado na tela inicial).
import { h } from './dom.js';
import * as store from './store.js';
import { button, toast } from './ui.js';
import { buildText, copyText, downloadJson, readImportFile } from './export.js';

export function importControl({ variant = 'secondary' } = {}) {
  const input = h('input', { type: 'file', accept: '.json,application/json', class: 'sr-only', tabindex: '-1', 'aria-hidden': 'true' });
  input.addEventListener('change', async () => {
    const file = input.files[0];
    input.value = '';
    if (!file) return;
    try {
      const analysis = store.add(await readImportFile(file));
      toast('Análise importada.');
      location.hash = `#/a/${analysis.id}/4`;
    } catch (err) {
      toast(`Não foi possível importar: ${err.message}`);
    }
  });
  return [button({ text: 'Importar JSON', icon: 'upload', variant, onclick: () => input.click() }), input];
}

export function buildActions(a, { beforePrint }) {
  return h(
    'div',
    { class: 'actions no-print', role: 'group', 'aria-label': 'Ações do painel' },
    button({ text: 'Imprimir / salvar PDF', icon: 'printer', variant: 'primary', onclick: () => { beforePrint(); window.print(); } }),
    button({ text: 'Copiar texto', icon: 'copy', onclick: async () => toast((await copyText(buildText(a))) ? 'Texto copiado. Cole no WhatsApp.' : 'Não consegui copiar neste navegador.') }),
    button({ text: 'Exportar JSON', icon: 'download', onclick: () => { downloadJson(a); toast('Arquivo gerado.'); } }),
    ...importControl(),
  );
}
