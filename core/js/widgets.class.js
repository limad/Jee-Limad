/* This file is part of Jeedom.
 *
 * Jeedom is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Jeedom is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Jeedom. If not, see <http://www.gnu.org/licenses/>.
 */

jeedom.widgets = function() {};

// Factory interne : construit une fonction AJAX standard vers widgets.ajax.php
jeedom.widgets._call = function(_action, _required, _dataKeys) {
  return function(_params) {
    _params = _params || {};
    try {
      jeedom.private.checkParamsRequired(_params, _required);
    } catch (e) {
      (_params.error || jeedom.private.default_params.error)(e);
      return;
    }
    const params = domUtils.extend({}, jeedom.private.default_params, _params);
    const paramsAJAX = jeedom.private.getParamsAJAX(params);
    paramsAJAX.url = 'core/ajax/widgets.ajax.php';
    paramsAJAX.data = { action: _action };
    for (const key of _dataKeys) {
      paramsAJAX.data[key] = key === 'widgets' ? JSON.stringify(_params[key]) : _params[key];
    }
    domUtils.ajax(paramsAJAX);
  };
};

jeedom.widgets.remove                 = jeedom.widgets._call('remove',                 ['id'],       ['id']);
jeedom.widgets.byId                   = jeedom.widgets._call('byId',                   ['id'],       ['id']);
jeedom.widgets.save                   = jeedom.widgets._call('save',                   ['widgets'],  ['widgets']);
jeedom.widgets.all                    = jeedom.widgets._call('all',                    [],           []);
jeedom.widgets.getTemplateConfiguration = jeedom.widgets._call('getTemplateConfiguration', ['template'], ['template']);
jeedom.widgets.getPreview             = jeedom.widgets._call('getPreview',             ['id'],       ['id']);
jeedom.widgets.replacement            = jeedom.widgets._call('replacement',            ['version', 'replace', 'by'], ['version', 'replace', 'by']);

jeedom.widgets.getThemeImg = function(_light, _dark) {
  if (_light !== '' && _dark === '') return _light;
  if (_light === '' && _dark !== '') return _dark;
  if (document.body.hasAttribute('data-theme')) {
    if (document.body.getAttribute('data-theme').endsWith('Light')) return _light;
  }
  return _dark;
};
