const fs = require('fs')
const dynamicClasses = fs.existsSync('/tmp/js-classes.txt')
  ? fs.readFileSync('/tmp/js-classes.txt', 'utf8').split('\n').filter(Boolean)
  : []
module.exports = {
  content: [
    './desktop/php/**/*.php', './desktop/modal/**/*.php', './desktop/template/**/*.html',
    './desktop/js/**/*.js', './desktop/common/js/**/*.js',
    './mobile/php/**/*.php', './mobile/html/**/*.html', './mobile/js/**/*.js',
    './core/php/**/*.php', './core/class/**/*.php', './core/ajax/**/*.php', './core/js/**/*.js',
    './core/template/**/*.html', './plugins/**/*.php', './plugins/**/*.js', './plugins/**/*.html'
  ],
  css: ['./desktop/css/desktop.main.css', './desktop/css/dom.ui.css', './desktop/css/coreWidgets.css'],
  output: './desktop/css/purged-strict/',
  safelist: {
    standard: [
      /^active$/, /^in$/, /^open$/, /^disabled$/, /^hidden$/, /^hide$/, /^show$/,
      /^col-/, /^row$/, /^container/, /^visible-/, /^hidden-/,
      /^btn/, /^modal/, /^dropdown/, /^nav/, /^navbar/, /^alert/, /^form-/,
      /^input-/, /^table/, /^label/, /^badge/, /^panel/, /^list-group/,
      /^progress/, /^pull-/, /^text-/, /^bg-/, /^clearfix$/,
      /^ui-/, /^jq/, /^tippy/, /^tooltip/, /^contextMenu/,
      /^fa[srb]?$/, /^fa-/, /^fas$/, /^far$/, /^fab$/, /^icon$/, /^material-icons$/,
      /^jeedom/, /^eqLogic/, /^eqSignal/, /^cmd/, /^widget/, /^scenario/,
      /^objectSummary/, /^packery/, /^draggable/, /^ui-resizable/,
      ...dynamicClasses
    ],
    deep: [/^body/, /^html/, /^:root/, /:hover$/, /:focus$/, /:active$/, /:checked$/, /:disabled$/, /::before$/, /::after$/, /::-webkit/, /::placeholder$/],
    greedy: [/\[data-/, /\[aria-/, /\.fa-/, /\.jeedom/, /\.cmd/, /\.eqLogic/, /\.ui-/, /\.modal/, /\.dropdown/, /\.navbar/],
    keyframes: true,
    variables: true
  },
  fontFace: false,
  keyframes: false,
  variables: false,
  rejected: true
}
