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

"use strict"

if (!jeeFrontEnd.database) {
  jeeFrontEnd.database = {
    init: function() {
      window.jeeP = this
    },
    dbExecuteCommand: function(_command, _addToList) {
      if (!isset(_addToList)) _addToList = false
      document.getElementById('div_commandResult').empty()
      jeedom.db({
        command: _command,
        error: function(error) {
          jeedomUtils.showAlert({
            message: error.message,
            level: 'danger'
          })
        },
        success: function(result) {
          document.getElementById('h3_executeCommand').empty().innerHTML = '{{Commande :}} "' + _command + '"<br/>{{Temps d\'éxécution}} :' + ' ' + result.time + 's'
          if(result.sql !== null){
          	document.getElementById('div_commandResult').html(jeeFrontEnd.database.dbGenerateTableFromResponse(result.sql), true)
          }
          document.getElementById('in_specificCommand').value = _command

          if (_addToList) {
            const listCmd = document.querySelector('.bt_dbCommand[data-command="' + _command.replace(/"/g, '\\"') + '"]')
            if (listCmd == null) {
              const add = '<li class="cursor list-group-item list-group-item-success"><a class="bt_dbCommand" data-command="' + _command.replace(/"/g, '\\"') + '">' + _command + '</a></li>'
              document.getElementById('ul_listSqlHistory').insertAdjacentHTML('afterbegin', add)
            }
            const kids = document.getElementById('ul_listSqlHistory').children
            if (kids.length >= 10) {
              document.getElementById('ul_listSqlHistory').lastElementChild.remove()
            }
          }
        }
      })
    },
    dbGenerateTableFromResponse: function(_response) {
      let result = '<table class="table table-condensed">'
      result += '<thead>'
      result += '<tr>'
      for (const i in _response[0]) {
        result += '<th>' + i + '</th>'
      }
      result += '</tr></thead>'

      result += '<tbody>'
      for (const i in _response) {
        result += '<tr>'
        for (const j in _response[i]) {
          result += '<td>' + _response[i][j] + '</td>'
        }
        result += '</tr>'
      }
      result += '</tbody></table>'
      return result
    },
    // -> SQL constructor
    constructSQLstring: function() {
      const operation = document.getElementById('sqlOperation').value
      let command = operation

      switch (operation) {
        case 'SELECT':
          command += ' ' + document.getElementById('sql_selector').value + ' FROM `' + document.getElementById('sqlTable').value + '`'
          break
        case 'INSERT':
          command += ' INTO `' + document.getElementById('sqlTable').value + '`'
          break
        case 'UPDATE':
          command += ' `' + document.getElementById('sqlTable').value + '` SET '
          break
        case 'DELETE':
          command += ' FROM `' + document.getElementById('sqlTable').value + '`'
          break
      }
      if (operation === 'INSERT') {
        let col, cols, value, values
        cols = values = ''
        document.querySelectorAll('#sqlSetOptions input.sqlSetter').forEach( _setter => {
          col = _setter.getAttribute('id')
          value = _setter.value
          if (value !== '') {
            cols += '`' + col + '`,'
            values += '' + value + ','
          }
        })
        command += ' (' + cols.slice(0, -1) + ') VALUES (' + values.slice(0, -1) + ')'
      }

      if (operation === 'UPDATE') {
        let col, value, isNull
        document.querySelectorAll('#sqlSetOptions input.sqlSetter').forEach( _setter => {
          col = _setter.getAttribute('id')
          value = _setter.value
          isNull = _setter.closest('.form-group').querySelector('.checkSqlColNull').checked
          if (value !== '') {
            command += '`' + col + '`= ' + value + ','
          } else if (isNull) {
            command += '`' + col + '`= NULL,'
          }
        })
        command = command.slice(0, -1)
      }

      if (['SELECT', 'UPDATE', 'DELETE'].includes(operation) && document.getElementById('checksqlwhere').checked && document.getElementById('sqlLikeValue').value !== '') {
        command += ' WHERE '
        command += '`' + document.getElementById('sqlWhere').value + '`'
        command += ' ' + document.getElementById('sqlLike').value
        command += ' ' + document.getElementById('sqlLikeValue').value
      }

      return command
    },
    defineSQLsetGroup: function() {
      const selectedTable = document.getElementById('sqlTable').value
      const operation = document.getElementById('sqlOperation').value
      let options = '<div id="sqlSetOptions">'
      let name, type, extra
      for (const col in jeephp2js.tableList[selectedTable]) {
        name = jeephp2js.tableList[selectedTable][col]['colName']
        type = jeephp2js.tableList[selectedTable][col]['colType']
        extra = jeephp2js.tableList[selectedTable][col]['colExtra']
        options += '<div class="form-group">'
        if (extra === 'auto_increment') {
          options += '<label class="col-xs-2 control-label warning">' + name + '</label>'
          options += '<div class="col-xs-8"><input id="' + name + '" class="form-control disabled input-sm" type="text" value="" placeholder="' + type + ' (auto-increment)" disabled/></div>'
        } else {
          options += '<label class="col-xs-2 control-label">' + name + '</label>'
          options += '<div class="col-xs-8"><input id="' + name + '" class="form-control sqlSetter input-sm" type="text" value="" placeholder="' + type + '"/></div>'
          if (operation === 'UPDATE') options += '<label class="col-xs-2"><input class="checkSqlColNull" type="checkbox"/>Null</label>'
        }
        options += '</div>'
      }
      options += '</div>'
      document.querySelector('#sqlSetGroup > label').empty().insertAdjacentHTML('beforeend', options.slice(0, -1))
    },
  }
}

jeeFrontEnd.database.init()


//Register events on top of page container:
window.registerEvent("resize", function db(event) {
  const tHeight = document.getElementById('dbCommands').offsetHeight  + document.getElementById('jeedomMenuBar').offsetHeight + 10
  document.getElementById('div_commandResult').style.height = (window.innerHeight - tHeight) + 'px'
})
window.triggerEvent('resize')


//Manage events outside parents delegations:
document.getElementById('bt_validateSpecificCommand')?.addEventListener('click', function(event) {
  const command = document.getElementById('in_specificCommand').value
  jeeP.dbExecuteCommand(command, true)
})

document.getElementById('in_specificCommand')?.addEventListener('keypress', function(event) {
  if (event.key === "Enter") {
    const command = document.getElementById('in_specificCommand').value
    jeeP.dbExecuteCommand(command, true)
  }
})

//SQL constructor
document.getElementById('sqlOperation')?.addEventListener('change', function(event) {
  const operation = event.target.value
  switch (operation) {
    case 'SELECT':
      event.target.removeClass('warning', 'danger').addClass('info')
      document.getElementById('sql_selector').parentNode.seen()
      document.getElementById('lblFrom').seen().innerHTML = 'FROM'

      document.getElementById('sqlSetGroup').unseen()
      document.getElementById('sqlWhereGroup').seen()
      break
    case 'INSERT':
      event.target.removeClass('info', 'danger').addClass('warning')
      document.getElementById('sql_selector').parentNode.unseen()
      document.getElementById('lblFrom').seen().innerHTML = 'INTO'

      document.getElementById('sqlSetGroup').seen()
      document.getElementById('sqlWhereGroup').unseen()
      jeeP.defineSQLsetGroup()
      break
    case 'UPDATE':
      event.target.removeClass('info', 'warning').addClass('danger')
      document.getElementById('sql_selector').parentNode.unseen()
      document.getElementById('lblFrom').unseen()

      document.getElementById('sqlSetGroup').seen()
      document.getElementById('sqlWhereGroup').seen()
      document.getElementById('checksqlwhere').checked = true
      document.getElementById('checksqlwhere').triggerEvent('change')
      jeeP.defineSQLsetGroup()
      break
    case 'DELETE':
      event.target.removeClass('info', 'warning').addClass('danger')
      document.getElementById('sql_selector').parentNode.unseen()
      document.getElementById('lblFrom').seen().innerHTML = 'FROM'

      document.getElementById('sqlSetGroup').unseen()
      document.getElementById('sqlWhereGroup').seen()
      document.getElementById('checksqlwhere').checked = true
      document.getElementById('checksqlwhere').triggerEvent('change')
      break
  }
  window.triggerEvent('resize')
})

document.getElementById('sqlTable')?.addEventListener('change', function(event) {
  const selectedTable = event.target.closest('#sqlTable').value
  let options = ''
  for (const col in jeephp2js.tableList[selectedTable]) {
    options += '<option value="' + jeephp2js.tableList[selectedTable][col]['colName'] + '">' + jeephp2js.tableList[selectedTable][col]['colName'] + '</option>'
  }
  document.getElementById('sqlWhere').innerHTML = options

  if (['INSERT', 'UPDATE'].includes(document.getElementById('sqlOperation').value)) {
    jeeP.defineSQLsetGroup()
  }
  window.triggerEvent('resize')
})

document.getElementById('checksqlwhere')?.addEventListener('change', function(event) {
  if (!event.target.closest('#checksqlwhere').checked) {
    document.querySelectorAll('#sqlWhere, #sqlLike, #sqlLikeValue').addClass('disabled')
  } else {
    document.querySelectorAll('#sqlWhere, #sqlLike, #sqlLikeValue').removeClass('disabled')
  }
})

document.getElementById('bt_writeDynamicCommand')?.addEventListener('click', function(event) {
  const sqlString = jeeP.constructSQLstring()
  document.getElementById('in_specificCommand').value = sqlString
})

document.getElementById('bt_execDynamicCommand')?.addEventListener('click', function(event) {
  const sqlString = jeeP.constructSQLstring()
  document.getElementById('in_specificCommand').value = sqlString
  jeeP.dbExecuteCommand(sqlString, true)
})


/*Events delegations
*/
document.getElementById('ul_listSqlRequest')?.addEventListener('click', function(event) {
  let _target = null
  if (_target = event.target.closest('.bt_dbCommand')) {
    const command = event.target.getAttribute('data-command')
    jeeP.dbExecuteCommand(command, false)
    return
  }
})

document.getElementById('ul_listSqlHistory')?.addEventListener('click', function(event) {
  let _target = null
  if (_target = event.target.closest('.bt_dbCommand')) {
    const command = event.target.getAttribute('data-command')
    jeeP.dbExecuteCommand(command, false)
    return
  }
})
