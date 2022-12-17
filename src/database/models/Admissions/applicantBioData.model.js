'use strict';

const { Model, Deferrable } = require('sequelize');

const RunningAdmission = require('../Admissions/runningAdmission.model');
const Applicant = require('../Admissions/applicant.model');
const MetadataValue = require('../App/metadataValue.model');

module.exports = (sequelize, DataTypes) => {
  class ApplicantBioData extends Model {
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
      // Get the salutation from metadataValues Table.
      this.salutation = this.belongsTo(models.MetadataValue, {
        as: 'salutation',
        foreignKey: 'salutation_id',
      });
    }
  }

  ApplicantBioData.init(
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
      salutation_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      form_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      surname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      other_names: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      date_of_birth: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      birth_certificate_attachment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      district_of_origin: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      religion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      marital_status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nationality: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      national_id_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      national_id_attachment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      passport_id_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      passport_attachment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emis_id_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      place_of_residence: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      district_of_birth: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      disability_details: {
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
      modelName: 'ApplicantBioData',
      tableName: 'applicant_bio_data',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return ApplicantBioData;
};
