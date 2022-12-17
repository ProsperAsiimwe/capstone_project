'use strict';

const { Model, Deferrable } = require('sequelize');

const PujabAdmissionInstitutionProgramme = require('./pujabAdmissionInstitutionProgramme.model');
const PujabApplication = require('./pujabApplication.model');

module.exports = (sequelize, DataTypes) => {
  class PujabProgrammeChoiceView extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.pujabApplication = this.belongsTo(models.PujabApplication, {
        as: 'pujabApplication',
        foreignKey: 'pujab_application_id',
      });
    }
  }

  PujabProgrammeChoiceView.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      pujab_admission_institution_programme_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: PujabAdmissionInstitutionProgramme,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
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
      choice_number_name: {
        type: DataTypes.STRING,
      },
      choice_number: {
        type: DataTypes.INTEGER,
      },
      pujab_section_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      pujab_section: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      institution_programme_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      programme_id: {
        type: DataTypes.BIGINT,
      },
      programme_title: {
        type: DataTypes.STRING,
      },
      programme_code: {
        type: DataTypes.STRING,
      },
      programme_duration: {
        type: DataTypes.INTEGER,
      },
      duration_measure: {
        type: DataTypes.STRING,
      },
      award: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      programme_study_level: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      subject_combinations: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      institution_name: {
        type: DataTypes.STRING,
      },
      institution_code: {
        type: DataTypes.STRING,
      },

      // Record Details
      created_at: {
        type: DataTypes.DATE,
      },
      updated_at: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: 'PujabProgrammeChoiceView',
      tableName: 'pujab_programme_choice_view',
      underscored: true,
      timestamps: true,
      schema: 'pujab_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return PujabProgrammeChoiceView;
};
