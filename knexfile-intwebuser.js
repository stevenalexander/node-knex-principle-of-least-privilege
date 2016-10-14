module.exports = {
  development: {
    client: 'mssql',
    connection: {
      host: process.env.MSSQL_SERVER,
      user: 'IntWebUser',
      password: '1Password2',
      database: 'polp',
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
