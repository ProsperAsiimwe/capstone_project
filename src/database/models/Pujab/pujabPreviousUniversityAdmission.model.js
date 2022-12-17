'use strict';

const { Model, Deferrable } = require('sequelize');

const PujabApplication = require('./pujabApplication.model');

module.exports = (sequelize, DataTypes) => {
  class PujabPreviousUniversityAdmission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //
      this.pujabApplication = this.belongsTo(models.PujabApplication, {
        as: 'pujabApplication',
        foreignKey: 'pujab_application_id',
      });
    }
  }

  PujabPreviousUniversityAdmission.init(
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
      institution_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      programme: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      student_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      registration_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sponsor: {
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
      modelName: 'PujabPreviousUniversityAdmission',
      tableName: 'pujab_previous_university_admission',
      underscored: true,
      timestamps: true,
      schema: 'pujab_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return PujabPreviousUniversityAdmission;
};
