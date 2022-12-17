'use strict';

const { Model, Deferrable } = require('sequelize');

const RunningAdmission = require('./runningAdmission.model');
const Applicant = require('./applicant.model');

module.exports = (sequelize, DataTypes) => {
  class ApplicantNextOfKin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get the running admission from running admission Table.
      this.runningAdmission = this.belongsTo(models.RunningAdmission, {
        as: 'runningAdmission',
        foreignKey: 'running_admission_id',
      });
      // Get the applicant from applicants Table.
      this.applicant = this.belongsTo(models.Applicant, {
        as: 'applicant',
        foreignKey: 'applicant_id',
      });
    }
  }

  ApplicantNextOfKin.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      running_admission_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: RunningAdmission,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      applicant_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: Applicant,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      form_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      next_of_kin_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      next_of_kin_relationship: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      next_of_kin_phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      next_of_kin_address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      next_of_kin_email: {
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
      modelName: 'ApplicantNextOfKin',
      tableName: 'applicant_next_of_kin',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return ApplicantNextOfKin;
};
