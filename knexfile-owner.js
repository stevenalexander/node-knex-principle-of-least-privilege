module.exports = {
  development: {
    client: 'mssql',
    connection: {
      host: process.env.MSSQL_SERVER,
      user: process.env.MSSQL_OWNER_USERNAME,
      password: process.env.MSSQL_OWNER_PASSWORD,
      database: 'master',
      options: {
        encrypt: true
      }
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
}
