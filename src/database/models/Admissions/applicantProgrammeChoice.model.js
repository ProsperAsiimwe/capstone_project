'use strict';

const { Model, Deferrable } = require('sequelize');

const RunningAdmission = require('../Admissions/runningAdmission.model');
const Applicant = require('../Admissions/applicant.model');
const MetadataValue = require('../App/metadataValue.model');
const RunningAdmissionProgrammeCampus = require('./runningAdmissionProgrammeCampus.model');
const SubjectCombination = require('../ProgrammeManager/SubjectCombination.model');
const ProgrammeVersionWeightingCriteria = require('./programmeVersionWeightingCriteria.model');
const ProgrammeVersionSelectionCriteria = require('./programmeVersionSelectionCriteria.model');
const User = require('../UserAccess/user.model');

module.exports = (sequelize, DataTypes) => {
  class ApplicantProgrammeChoice extends Model {
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
      // Get the programmeCampus from RunningAdmissionProgrammeCampus Table.
      this.programmeCampus = this.belongsTo(
        models.RunningAdmissionProgrammeCampus,
        {
          as: 'programmeCampus',
          foreignKey: 'programme_campus_id',
        }
      );
      //
      this.entryStudyYear = this.belongsTo(models.MetadataValue, {
        as: 'entryStudyYear',
        foreignKey: 'entry_study_year_id',
      });
      //
      this.sponsorship = this.belongsTo(models.MetadataValue, {
        as: 'sponsorship',
        foreignKey: 'sponsorship_id',
      });
      //
      this.subjectCombination = this.belongsTo(models.SubjectCombination, {
        as: 'subjectCombination',
        foreignKey: 'subject_combination_id',
      });
    }
  }

  ApplicantProgrammeChoice.init(
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
      programme_campus_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: RunningAdmissionProgrammeCampus,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      entry_study_year_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      sponsorship_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      subject_combination_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: SubjectCombination,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      form_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      choice_number_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      choice_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      applicant_weights: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      applicant_selected: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      weighting_criteria_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: ProgrammeVersionWeightingCriteria,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      selection_criteria_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: ProgrammeVersionSelectionCriteria,
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

      // recommend

      recommendation_status: {
        type: DataTypes.STRING,
        defaultValue: 'PENDING',
      },
      recommendation_reason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      recommended_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      recommended_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'ApplicantProgrammeChoice',
      tableName: 'applicant_programme_choices',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      recommendedAt: 'recommended_at',
    }
  );

  return ApplicantProgrammeChoice;
};
