var config = require('./knexfile-intwebuser').development
var knex = require('knex')(config)

console.log('**** AS IntWebUser ****')
knex.select('*')
    .from('TableB') // don't have to give schema as default is set for user
    .then(function (result) {
      // Succeeds as TableB is in IntSchema
      console.log('TableB:')
      console.dir(result)
    })

knex.select('*')
    .from('ExtSchema.TableA')
    .then(function (result) {
      // Fails as TableA is in ExtSchema
      console.log('SHOULD NOT GET HERE - TableA:')
      console.dir(result)
    })
    .catch(function () {
      console.log('ERROR SELECTING ExtSchema.TableA - THIS IS FINE - I DON\'T HAVE PERMISSION ANYWAY:')
    })
