'use strict';

const { Model, Deferrable } = require('sequelize');

const RunningAdmissionProgrammeCampus = require('./runningAdmissionProgrammeCampus.model');
const SubjectCombination = require('../ProgrammeManager/SubjectCombination.model');

module.exports = (sequelize, DataTypes) => {
  class RunningAdmissionProgrammeCampusCombination extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //
      this.runningAdmissionProgCampus = this.belongsTo(
        models.RunningAdmissionProgrammeCampus,
        {
          as: 'runningAdmissionProgCampus',
          foreignKey: 'running_admission_programme_campus_id',
        }
      );
      //
      this.subjectCombination = this.belongsTo(models.SubjectCombination, {
        as: 'subjectCombination',
        foreignKey: 'subject_combination_id',
      });
    }
  }

  RunningAdmissionProgrammeCampusCombination.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      running_admission_programme_campus_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: RunningAdmissionProgrammeCampus,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      subject_combination_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: SubjectCombination,
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
      modelName: 'RunningAdmissionProgrammeCampusCombination',
      tableName: 'running_admission_programme_campus_combinations',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return RunningAdmissionProgrammeCampusCombination;
};
