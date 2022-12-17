'use strict';

const { Model, Deferrable } = require('sequelize');

const Application = require('./app.model');

module.exports = (sequelize, DataTypes) => {
  class AppFunction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // The app function belongs to a specific app
      this.application = this.belongsTo(models.Application, {
        as: 'application',
        foreignKey: 'app_id',
      });
    }
  }

  AppFunction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      app_id: {
        type: DataTypes.STRING,
        unique: false,
        allowNull: false,
        references: {
          key: 'id',
          model: Application,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      action_group: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      function_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      function_description: {
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
      modelName: 'AppFunction',
      tableName: 'app_functions',
      underscored: true,
      timestamps: true,
      schema: 'user_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return AppFunction;
};
