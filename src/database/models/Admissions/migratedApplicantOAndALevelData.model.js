'use strict';

const { Model, Deferrable } = require('sequelize');

const MigratedApplicant = require('./migratedApplicantBiodata.model');

module.exports = (sequelize, DataTypes) => {
  class MigratedApplicantOAndALevelData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get from model.
    }
  }

  MigratedApplicantOAndALevelData.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      migrated_applicant_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MigratedApplicant,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      sat_a_level_exams: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      a_level_index_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      a_level_year_of_sitting: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      a_level_school: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sat_o_level_exams: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      o_level_index_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      o_level_year_of_sitting: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      o_level_school: {
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
      modelName: 'MigratedApplicantOAndALevelData',
      tableName: 'migrated_applicant_o_and_a_level_data',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return MigratedApplicantOAndALevelData;
};
