var config = require('./knexfile-extwebuser').development
var knex = require('knex')(config)

console.log('**** AS ExtWebUser ****')
knex.select('*')
    .from('TableA') // don't have to give schema as default is set for user
    .then(function (result) {
      // Succeeds as TableA is in ExtSchema
      console.log('TableA:')
      console.dir(result)
    })

knex.select('*')
    .from('IntSchema.TableB')
    .then(function (result) {
      // Fails as TableB is in IntSchema
      console.log('SHOULD NOT GET HERE - TableB:')
      console.dir(result)
    })
    .catch(function () {
      console.log('ERROR SELECTING IntSchema.TableB - THIS IS FINE - I DON\'T HAVE PERMISSION ANYWAY:')
    })

knex.raw('SELECT * FROM [IntSchema].[fAllTableB] ()')
    .then(function (result) {
      console.log('fAllTableB: YEAH CAN\'T SELECT TableB, BUT I CAN USE THIS FUNCTION!')
      console.dir(result)
    })
    .catch(function (error) {
      console.error(error)
    })

knex.raw('SELECT * FROM [IntSchema].[fOneTableB] (?)', ['Kin-N'])
    .then(function (result) {
      console.log('fOneTableB: YEAH CAN\'T SELECT TableB, BUT I CAN USE THIS FUNCTION WITH A PARAM TO RESTRICT FURTHER!')
      console.dir(result)
    })
    .catch(function (error) {
      console.error(error)
    })
