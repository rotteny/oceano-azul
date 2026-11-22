import { h } from './dom.js';

export const HELP = [
  {
    text: 'Escreva em uma ou duas frases o que você quer criar ou qual problema vive no dia a dia. Não precisa estar perfeito: dá para voltar e mudar depois.',
    example: 'Moro longe do centro e não acho marmita saudável por perto. Quero vender marmitas fit para quem trabalha no meu bairro.',
  },
  {
    text: 'Oceano vermelho é o mercado lotado, onde todo mundo faz a mesma coisa e briga por preço. Aqui você compara a sua ideia com quem já existe nos mesmos pontos (fatores). Onde as notas são iguais, você está copiando o mercado. A brecha é o ponto onde ninguém está.',
    example: 'Marmita fit. Preço: eu 3, eles 4. Variedade: eu 2, eles 2 (igual: oceano vermelho). Entrega rápida: eu 5, eles 1. Brecha: entregar dentro do prédio na hora do almoço.',
  },
  {
    text: 'São quatro perguntas para sair da briga. Tirar: o que o setor faz e o cliente nem valoriza. Diminuir: o que é exagero. Aumentar: o que dói e ninguém resolve. Criar: o que ainda não existe.',
    example: 'Tirar: cardápio com 30 opções. Diminuir: embalagem sofisticada. Aumentar: pontualidade na entrega. Criar: assinatura semanal com troca de cardápio por WhatsApp.',
  },
  {
    text: 'Antes de gastar dinheiro, faça um teste pequeno de uma semana. Diga o que vai fazer, como saber que deu certo, até quando e quem vai cobrar você. Tire uma foto desta tela e mostre para essa pessoa.',
    example: 'Vou testar: vender 10 marmitas para colegas do prédio. Deu certo se: 7 pedirem de novo. Até: daqui a 7 dias. Quem vai me cobrar: minha irmã.',
  },
  {
    text: 'Este é o seu painel: junta as notas, a brecha, a nova regra do jogo e o teste. Use os botões para imprimir, salvar em arquivo ou copiar o texto e mandar no WhatsApp.',
    example: null,
  },
];

export function helpBox(stepIndex) {
  const item = HELP[stepIndex];
  return h(
    'details',
    { class: 'help' },
    h('summary', {}, 'O que é isso?'),
    h('div', { class: 'help-body' }, h('p', {}, item.text), item.example && h('p', { class: 'help-example' }, h('strong', {}, 'Exemplo: '), item.example)),
  );
}
