{spawn, exec} = require 'child_process'

task 'build', 'continually build the JavaScript code', ->
  coffee = spawn 'coffee', ['-cw', '-o', 'lib', 'src']
  coffee.stdout.on 'data', (data) -> console.log data.toString().trim()

