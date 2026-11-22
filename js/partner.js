// Logo opcional de um parceiro no cabeçalho (config.js). Vazio: não mostra nada.
import { h } from './dom.js';

const safeSrc = (src) => /^(https:\/\/|[\w./-]+$)/.test(src) && !src.startsWith('//');

export function renderPartner(header, { name = '', logo = '', url = '' } = {}) {
  if (!logo || !safeSrc(logo)) return;
  const img = h('img', { class: 'partner-logo', src: logo, alt: name || 'Logo do parceiro' });
  const holder = /^https:\/\//.test(url)
    ? h('a', { class: 'partner', href: url, target: '_blank', rel: 'noopener noreferrer' }, img)
    : h('span', { class: 'partner' }, img);
  header.querySelector('.brand').after(holder);
  header.classList.add('has-partner');
}
