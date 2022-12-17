'use strict';

const { Model, Deferrable } = require('sequelize');

const RunningAdmissionApplicant = require('./runningAdmissionApplicant.model');
const MetadataValue = require('../App/metadataValue.model');

module.exports = (sequelize, DataTypes) => {
  class RunningAdmissionApplicantSection extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get the running admission applicant from running admission applicant Table.
      this.runningAdmissionApplicant = this.belongsTo(
        models.RunningAdmissionApplicant,
        {
          as: 'runningAdmissionApplicant',
          foreignKey: 'running_admission_applicant_id',
        }
      );
      // Get the formSection from MetadataValues Table.
      this.formSection = this.belongsTo(models.MetadataValue, {
        as: 'formSection',
        foreignKey: 'form_section_id',
      });
    }
  }

  RunningAdmissionApplicantSection.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      running_admission_applicant_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: RunningAdmissionApplicant,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      form_section_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
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
      modelName: 'RunningAdmissionApplicantSection',
      tableName: 'running_admission_applicant_sections',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return RunningAdmissionApplicantSection;
};
