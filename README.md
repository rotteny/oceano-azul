# Oceano Azul

Passo a passo no celular para a folha de exercício da **Estratégia do Oceano Azul**. Pensado para quem está começando e não conhece o vocabulário: o app guia a pessoa por cinco etapas e termina em um painel com gráficos e indicadores.

Baseado na Estratégia do Oceano Azul (W. Chan Kim e Renée Mauborgne). A folha de exercício original foi apresentada por um agente do **Sebrae** na Campus Party. Este app é um trabalho voluntário que leva esse exercício para o digital, de graça.

**No ar:** https://rotteny.github.io/oceano-azul/

**Desenvolvimento:** [Gorila Software House](https://gorilash.com.br), trabalho voluntário.

## Como usar

1. **Minha ideia**: escreva a ideia ou o problema que você vive.
2. **Raio-x**: dê notas de 1 a 5 para a sua ideia e para quem já existe, em 3 a 8 fatores. Onde as notas são iguais, aparece "oceano vermelho". A curva de valor atualiza na hora. Escreva também a brecha (onde ninguém está).
3. **Nova regra do jogo**: Tirar, Diminuir, Aumentar e Criar.
4. **Teste de 7 dias**: o que vai testar, como saber que deu certo, até quando (sugerimos hoje + 7 dias) e quem vai cobrar.
5. **Painel**: indicadores, gráfico de linha, barras de diferença, brecha, matriz 2x2 e contagem regressiva do teste.

No painel: **Imprimir / salvar PDF** (cabe em uma folha A4), **Copiar texto** (para o WhatsApp), **Exportar JSON** e **Importar JSON** (o arquivo é validado antes de gravar). Na tela inicial você tem várias análises: criar, abrir, duplicar e excluir. Tudo é salvo automaticamente.

## Rodar localmente

Não há build nem npm. Qualquer servidor estático serve:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicar no GitHub Pages

Em **Settings > Pages**, escolha a branch `main` e a pasta `/ (root)`. O arquivo `.nojekyll` já está na raiz. Todos os caminhos são relativos, então funciona em `https://usuario.github.io/oceano-azul/`.

Ao alterar qualquer arquivo do app, aumente `CACHE_VERSION` em `sw.js` para que o modo offline (PWA) pegue a versão nova.

## Privacidade

Nada sai do seu navegador. Os dados ficam no `localStorage` (chave `oceano-azul:v1`, com `schemaVersion`). Não há servidor, cadastro, analytics nem chamadas a CDN: as bibliotecas ficam em `vendor/`. Se o navegador bloquear o armazenamento, o app avisa e continua funcionando sem salvar. Use "Exportar JSON" para guardar um backup. Limpar os dados do site apaga as análises.

## Personalizar com a marca de um parceiro

Edite `config.js`:

```js
export const partner = { name: 'Nome do parceiro', logo: 'parceiro/logo.svg', url: 'https://exemplo.com.br' };
```

- `logo`: caminho relativo a um arquivo do repositório ou URL `https`. Com `logo` preenchido, a imagem aparece em destaque no cabeçalho, com o `name` como texto alternativo. Vazio (padrão), nada é exibido.
- `url`: opcional (`https`); transforma a logo em link.
- **Só use a logo de uma marca com autorização do dono da marca.** Se usar um arquivo local, adicione-o a `ASSETS` em `sw.js` para funcionar offline.

## Tecnologia

HTML, CSS e JavaScript puros (ES modules), sem build. Gráficos com [Chart.js](https://www.chartjs.org/) 4.4.9 (MIT), copiado para `vendor/`. Ícones no estilo [Lucide](https://lucide.dev/) (ISC). Licenças em `vendor/LICENSES.md`. Todo texto do usuário entra no DOM por `textContent`, inclusive o JSON importado.

## Licença

Código sob MIT (veja `LICENSE`). A marca Sebrae pertence ao Sebrae e não é coberta por essa licença; veja `vendor/LICENSES.md`.
