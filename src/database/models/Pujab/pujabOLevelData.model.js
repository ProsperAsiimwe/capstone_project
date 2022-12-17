'use strict';

const { Model, Deferrable } = require('sequelize');
const PujabApplication = require('./pujabApplication.model');

module.exports = (sequelize, DataTypes) => {
  class PujabOLevelData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get the subjects Table.
      this.subjects = this.hasMany(models.PujabOLevelSubject, {
        as: 'subjects',
        foreignKey: 'pujab_o_level_id',
        sourceKey: 'id',
        onDelete: 'CASCADE',
      });

      //
      this.pujabApplication = this.belongsTo(models.PujabApplication, {
        as: 'pujabApplication',
        foreignKey: 'pujab_application_id',
        sourceKey: 'id',
      });
    }
  }

  PujabOLevelData.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      pujab_application_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: PujabApplication,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      index_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      exam_year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      school_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      distinctions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      credits: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      failures: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      passes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
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
      modelName: 'PujabOLevelData',
      tableName: 'pujab_o_level_data',
      underscored: true,
      timestamps: true,
      schema: 'pujab_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return PujabOLevelData;
};
