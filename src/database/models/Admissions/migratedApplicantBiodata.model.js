'use strict';

const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');
const MetadataValue = require('../App/metadataValue.model');

module.exports = (sequelize, DataTypes) => {
  class MigratedApplicant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //
      this.salutation = this.belongsTo(models.MetadataValue, {
        as: 'salutation',
        foreignKey: 'salutation_id',
      });
      //
      this.maritalStatus = this.belongsTo(models.MetadataValue, {
        as: 'maritalStatus',
        foreignKey: 'marital_status_id',
      });

      //
      this.choices = this.hasMany(models.MigratedApplicantProgrammeChoice, {
        as: 'choices',
        foreignKey: 'migrated_applicant_id',
      });

      //
      this.highSchool = this.hasOne(models.MigratedApplicantOAndALevelData, {
        as: 'highSchool',
        foreignKey: 'migrated_applicant_id',
      });

      //
      this.employments = this.hasMany(
        models.MigratedApplicantEmploymentRecord,
        {
          as: 'employments',
          foreignKey: 'migrated_applicant_id',
        }
      );

      //
      this.qualifications = this.hasMany(
        models.MigratedApplicantOtherQualification,
        {
          as: 'qualifications',
          foreignKey: 'migrated_applicant_id',
        }
      );

      //
      this.referees = this.hasMany(models.MigratedApplicantRefereeDetail, {
        as: 'referees',
        foreignKey: 'migrated_applicant_id',
      });

      //
      this.directAdmission = this.hasOne(models.AdmittedApplicant, {
        as: 'directAdmission',
        foreignKey: 'migrated_applicant_id',
      });

      // The User who Created this Record
      this.createdBy = this.belongsTo(models.User, { as: 'createdBy' });

      // The User who approved the newly created Record
      this.createApprovedBy = this.belongsTo(models.User, {
        as: 'createApprovedBy',
      });

      // The User who Last Updated this Record
      this.lastUpdatedBy = this.belongsTo(models.User, { as: 'lastUpdatedBy' });

      // The User who approved the last Update to this Record
      this.lastUpdateApprovedBy = this.belongsTo(models.User, {
        as: 'lastUpdateApprovedBy',
      });

      // The User who Deleted this Record
      this.deletedBy = this.belongsTo(models.User, { as: 'deletedBy' });

      // The User who approved the Deletion to this Record
      this.deleteApprovedBy = this.belongsTo(models.User, {
        as: 'deleteApprovedBy',
      });
    }
  }

  MigratedApplicant.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      salutation_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      marital_status_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      migrated_form_id: {
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
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      birth_certificate_attachment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      district_of_origin: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      religion: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nationality: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      a_level_index: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      a_level_year: {
        type: DataTypes.STRING,
        allowNull: true,
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
        allowNull: true,
      },
      district_of_birth: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      disability_details: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      migrated_prn: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      application_fee: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      amount_paid: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      fee_paid: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      fee_payment_bank: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fee_payment_branch: {
        type: DataTypes.STRING,
        allowNull: true,
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
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_by_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      create_approved_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      create_approval_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      create_approval_status: {
        type: DataTypes.STRING,
        defaultValue: 'PENDING',
      },
      last_updated_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      last_update_approved_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      last_update_approval_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      last_update_approval_status: {
        type: DataTypes.STRING,
        defaultValue: 'PENDING',
      },
      deleted_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      delete_approved_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      delete_approval_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      delete_approval_status: {
        type: DataTypes.STRING,
        defaultValue: 'PENDING',
      },
    },
    {
      sequelize,
      modelName: 'MigratedApplicant',
      tableName: 'migrated_applicant_biodata',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return MigratedApplicant;
};
