'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Application extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get all App Functions
      this.appFunctions = this.hasMany(models.AppFunction, {
        as: 'appFunctions',
        foreignKey: 'app_id',
      });
    }
  }

  Application.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      app_code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      app_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      app_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      app_icon: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      app_status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      app_description: {
        type: DataTypes.STRING,
        allowNull: false,
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
      modelName: 'Application',
      tableName: 'apps',
      underscored: true,
      timestamps: true,
      schema: 'user_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Application;
};
