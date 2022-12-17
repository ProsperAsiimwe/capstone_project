'use strict';

const { Model, Deferrable } = require('sequelize');

const PujabAdmissionInstitutionProgramme = require('./pujabAdmissionInstitutionProgramme.model');
const PujabApplication = require('./pujabApplication.model');

module.exports = (sequelize, DataTypes) => {
  class PujabProgrammeChoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //
      this.admissionProgramme = this.belongsTo(
        models.PujabAdmissionInstitutionProgramme,
        {
          as: 'admissionProgramme',
          foreignKey: 'pujab_admission_institution_programme_id',
        }
      );
      //
      this.pujabApplication = this.belongsTo(models.PujabApplication, {
        as: 'pujabApplication',
        foreignKey: 'pujab_application_id',
      });
    }
  }

  PujabProgrammeChoice.init(
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
        allowNull: true,
      },
      choice_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // Record Details
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
      modelName: 'PujabProgrammeChoice',
      tableName: 'pujab_programme_choices',
      underscored: true,
      timestamps: true,
      schema: 'pujab_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return PujabProgrammeChoice;
};
