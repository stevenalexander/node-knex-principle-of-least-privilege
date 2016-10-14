// Originally tried SQL file but knex does not like 'GO' statements, each raw call is a batch
// As an alternative batches of SQL could be loaded per file
exports.seed = function (knex, Promise) {
  return knex.schema
  .raw('USE master;')
  .raw('CREATE LOGIN ExtWebUser WITH Password=\'1Password2\';')
  .raw('CREATE LOGIN IntWebUser WITH Password=\'1Password2\';')
  // create users, schemas
  .raw('USE polp;')
  .raw('CREATE SCHEMA ExtSchema;')
  .raw('CREATE ROLE ExtSchemaReadWrite;')
  .raw('GRANT SELECT ON SCHEMA::ExtSchema TO ExtSchemaReadWrite;')
  .raw('GRANT INSERT ON SCHEMA::ExtSchema TO ExtSchemaReadWrite;')
  .raw('GRANT UPDATE ON SCHEMA::ExtSchema TO ExtSchemaReadWrite;')
  .raw('CREATE USER ExtWebUser;')
  .raw('ALTER USER ExtWebUser WITH DEFAULT_SCHEMA = ExtSchema;')
  .raw('ALTER ROLE ExtSchemaReadWrite ADD MEMBER ExtWebUser;')
  .raw('CREATE SCHEMA IntSchema;')
  .raw('CREATE ROLE IntSchemaReadWrite;')
  .raw('GRANT SELECT ON SCHEMA::IntSchema TO IntSchemaReadWrite;')
  .raw('GRANT INSERT ON SCHEMA::IntSchema TO IntSchemaReadWrite;')
  .raw('GRANT UPDATE ON SCHEMA::IntSchema TO IntSchemaReadWrite;')
  .raw('CREATE USER IntWebUser;')
  .raw('ALTER USER IntWebUser WITH DEFAULT_SCHEMA = IntSchema;')
  .raw('ALTER ROLE IntSchemaReadWrite ADD MEMBER IntWebUser;')
  // create tables and insert
  .raw('CREATE TABLE ExtSchema.TableA (fname char(5));')
  .raw('INSERT INTO ExtSchema.TableA (fname) values (\'Kin-A\');')
  .raw('CREATE TABLE IntSchema.TableB (fname char(5));')
  .raw('INSERT INTO IntSchema.TableB (fname) values (\'Kin-B\');')
  // create table function
  .raw('CREATE FUNCTION IntSchema.fAllTableB () RETURNS @allTableB TABLE (fname char(5) NOT NULL) WITH EXECUTE AS OWNER AS BEGIN INSERT INTO @allTableB (fname) SELECT fname FROM IntSchema.TableB;RETURN; END')
  .raw('CREATE FUNCTION IntSchema.fOneTableB (@oneFName char(5)) RETURNS @oneTableB TABLE (fname char(5) NOT NULL) WITH EXECUTE AS OWNER AS BEGIN INSERT INTO @oneTableB (fname) SELECT fname FROM IntSchema.TableB WHERE fname = @oneFName;RETURN; END')
  // grant ExtWebUser EXEC
  .raw('GRANT SELECT ON IntSchema.fAllTableB TO ExtWebUser;')
  .raw('GRANT SELECT ON IntSchema.fOneTableB TO ExtWebUser;')
}
