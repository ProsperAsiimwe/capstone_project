'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Client extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  Client.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      application_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      client_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      secret_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      remember_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      narration: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      block_reason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      access_until: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Client',
      tableName: 'clients',
      underscored: true,
      timestamps: true,
      defaultScope: {
        attributes: { exclude: ['secret_number'] },
      },
      schema: 'api_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Client;
};
