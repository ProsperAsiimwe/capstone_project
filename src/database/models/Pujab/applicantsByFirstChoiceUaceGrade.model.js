'use strict';

const { Model, Deferrable } = require('sequelize');

const ApplicantsByFirstChoice = require('./applicantsByFirstChoice.model');

module.exports = (sequelize, DataTypes) => {
  class ApplicantsByFirstChoiceUaceGrade extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //
      this.applicantsByFirstChoice = this.belongsTo(
        models.ApplicantsByFirstChoice,
        {
          as: 'applicantsByFirstChoice',
          foreignKey: 'applicants_by_first_id',
        }
      );
    }
  }

  ApplicantsByFirstChoiceUaceGrade.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      applicants_by_first_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ApplicantsByFirstChoice,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      subject_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subject_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      grade: {
        type: DataTypes.STRING,
        allowNull: false,
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
      modelName: 'ApplicantsByFirstChoiceUaceGrade',
      tableName: 'applicants_by_first_choice_uace_grades',
      underscored: true,
      timestamps: true,
      schema: 'pujab_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return ApplicantsByFirstChoiceUaceGrade;
};
