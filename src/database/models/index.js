const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const dbEnvConfigs = require('../config/config');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = dbEnvConfigs[env];
const db = {};

let sequelize;

const sequelizeConfig = {
  ...config,
  // isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
  retry: {
    match: [
      Sequelize.ConnectionError,
      Sequelize.ConnectionTimedOutError,
      Sequelize.TimeoutError,
      /Deadlock/i,
      'SQLITE_BUSY',
    ],
    max: 3,
    backoffBase: 1000,
    backoffExponent: 1.5,
  },
};

if (config.use_env_variable) {
  sequelize = new Sequelize(
    process.env[config.use_env_variable],
    sequelizeConfig
  );
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    sequelizeConfig
  );
}

const directories = fs.readdirSync(__dirname).filter(function (file) {
  return fs.statSync(path.join(__dirname, file)).isDirectory();
});

let modelFiles = [];

directories.forEach(function (value, index, array) {
  const currentModelFiles = fs
    .readdirSync(path.join(__dirname, value))
    .filter(function (file) {
      return (
        file.indexOf('.') !== 0 &&
        file !== basename &&
        file.slice(-9) === '.model.js'
      );
    })
    .map(function (file) {
      return path.join(__dirname, value, file);
    });

  modelFiles = modelFiles.concat(currentModelFiles);
});

modelFiles.forEach((modelFile) => {
  const model = require(modelFile)(sequelize, Sequelize.DataTypes);

  db[model.name] = model;
});

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
