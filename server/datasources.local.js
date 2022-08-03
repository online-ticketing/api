// eslint-disable-next-line strict
const config = require('config');
module.exports = {
  db: {
    name: 'db',
    connector: 'memory',
  },
  // eslint-disable-next-line camelcase
  online_ticketing: {
    name: config.db.name,
    connector: 'mysql',
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    username: config.db.username,
    password: config.db.password,
  },
  transient: {
    name: 'transient',
    connector: 'transient',
  },
};
