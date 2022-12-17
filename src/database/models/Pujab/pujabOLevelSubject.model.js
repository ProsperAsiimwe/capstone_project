'use strict';

const { Model, Deferrable } = require('sequelize');
const PujabOLevelData = require('./pujabOLevelData.model');

module.exports = (sequelize, DataTypes) => {
  class PujabOLevelSubject extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }

  PujabOLevelSubject.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      pujab_o_level_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: PujabOLevelData,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      grade: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // Extra Record Details
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
      modelName: 'PujabOLevelSubject',
      tableName: 'pujab_o_level_subjects',
      underscored: true,
      timestamps: true,
      schema: 'pujab_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return PujabOLevelSubject;
};
