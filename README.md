# Node principle of least privilege using knex

```
external-web: "Robert'); DROP TABLE students" did nothing wrong!
database    : Check your privilege!
```

Principle of least privilege access control across multiple applications using separate database schema and permissions.

__[relevant xkcd](https://xkcd.com/327/)__

## Scenario

You have two applications:

* **external-web**
  * Public site used by unauthenicated users and exposed to the internet
  * Allows users to submit application data to be processed, with a limited view of previously submitted application data
  * High risk, don't want users to potentially view other users application data or change details
* **internal-site**
  * Internal site used by authenicated users and IP restricted
  * Allows users to process applications
  * Lower risk, but still don't want users to be able to perform actions like deleting records or submitting applications

### Proposed solution:

* Split the data stores, so **external-web** and **internal-web** have their own stores, with **external-web** only holding data as long as necessary
* Use permissions to prevent each application from doing anything other than the minimum they need on their stores (principle of least privilege)
* Use a worker application, not exposed or directly connected to either application, to move data between the two
* Use either a special API or function to allow **external-web** to query historic data with limited access, so it cannot query the entire store

### Responsibilies:

1. In central data-migrations
  * scripts for initial database setup
    1. admin user on master:
      * creates logins __ExternalWebUser__, __InternalWebUser__, __WorkerUser__
    2. admin user on apvs:
      * creates users for logins
      * creates schema for ExternalSchema, InternalSchema
      * alters users to set default schema per User
      * adds reader/writer role to users to respective schemas (so each user cannot query tables in other schema)
      * add exec role to __ExternalWebUser__ on specific table functions used to provide a restricted view on completed applications (e.g. function takes reference number and runs select on data as schema owner)
      * adds reader/writer/deletion role to __WorkerUser__ on both schemas
  * scripts to clear down data/database for rebuild (development only)
3. In **external-web** (publically exposed)
  * migrations is responsible for maintaining ExternalSchema (using user with schema change permissions)
  * queries for selecting/inserting transient application data and tasks for worker (using __ExternalWebUser__)
  * queries for executing table functions which allow a limited view of InternalSchema data
4. In worker (runs asynchronous tasks, polling queue tables)
  * queries for selecting/deleting transient application data from ExternalSchema and selecting/inserting into InternalSchema to move completed application data to historic internal user store (using __WorkerUser__)
5. In **internal-web**
  * migrations is responsible for maintaining InternalSchema (using user with schema change permissions)
  * queries for selecting/updating application data and tasks for worker (using __InternalWebUser__)

### Note

Found this [link](http://dba.stackexchange.com/questions/143157/sql-server-how-to-grant-select-permission-on-view-that-access-data-in-schemas) helpful for creating the table function which can run under different permissions.

This solution is for when you can't or don't want to split concerns further, such as a full microservice architecture and split database for internal/external. For more security you could split out data operations with a separate **external-web**/**external-api** and **internal-web**/**internal-api**, with the APIs hosted on separate servers IP restricting calls to their web apps and the DB IP restricted to the APIs.

But sometimes tripling the complexity of your architecture isn't a good option.

## Requires

* node
* MS SQL instance (with owner user and a DB called 'polp')
* Environmental variables set

```
# Assumes you have a DB user with permissions to create users/schema etc.
# Set environmental variables for DB connection
export MSSQL_OWNER_USERNAME='USERNAME'
export MSSQL_OWNER_PASSWORD='PASSWORD'
export MSSQL_SERVER='SERVER.database.windows.net'
```

## Run

```
# Setup DB
./node_modules/.bin/knex seed:run --knexfile knexfile-owner.js

# run as ExtWebUser
node ExtWebUser.js

# Outputs
# **** AS ExtWebUser ****
# TableA:
# [ { fname: 'Kin-A' } ]
# fAllTableB: YEAH CAN'T SELECT TableB, BUT I CAN USE THIS FUNCTION!
# [ { fname: 'Kin-B' } ]
# ERROR - THIS IS FINE - I DON'T HAVE PERMISSION ANYWAY:
# fOneTableB: YEAH CAN'T SELECT TableB, BUT I CAN USE THIS FUNCTION WITH A PARAM TO RESTRICT FURTHER!
# []

# run as IntWebUser
node IntWebUser.js

# Outputs
# **** AS IntWebUser ****
# TableB:
# [ { fname: 'Kin-B' } ]
# ERROR SELECTING ExtSchema.TableA - THIS IS FINE - I DON'T HAVE PERMISSION ANYWAY:
```