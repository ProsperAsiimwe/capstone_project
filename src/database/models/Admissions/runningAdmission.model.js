'use strict';

const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');
const MetadataValue = require('../App/metadataValue.model');
const AdmissionScheme = require('./admissionScheme.model');
const AdmissionForm = require('./admissionForm.model');
const ApplicationFeesPolicy = require('../InstitutionPolicy/applicationFeesPolicy.model');
const AdmissionFeesPolicy = require('../InstitutionPolicy/admissionFeesPolicy.model');

module.exports = (sequelize, DataTypes) => {
  class RunningAdmission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get the academic year from academic_years Table.
      this.academicYear = this.belongsTo(models.MetadataValue, {
        as: 'academicYear',
        foreignKey: 'academic_year_id',
      });

      // Get the intake from Meta Data Value Table.
      this.intake = this.belongsTo(models.MetadataValue, {
        as: 'intake',
        foreignKey: 'intake_id',
      });

      // Get the admission Scheme from admission_schemes Table.
      this.admissionScheme = this.belongsTo(models.AdmissionScheme, {
        as: 'admissionScheme',
        foreignKey: 'admission_scheme_id',
      });

      // Get the admission form from admission_forms Table.
      this.admissionForm = this.belongsTo(models.AdmissionForm, {
        as: 'admissionForm',
        foreignKey: 'admission_form_id',
      });

      // Get the degree category from Meta Data Value Table.
      this.degreeCategory = this.belongsTo(models.MetadataValue, {
        as: 'degreeCategory',
        foreignKey: 'degree_category_id',
      });

      //
      this.applicationFees = this.belongsTo(models.ApplicationFeesPolicy, {
        as: 'applicationFees',
        foreignKey: 'application_fees_policy_id',
      });

      //
      this.admissionFees = this.belongsTo(models.AdmissionFeesPolicy, {
        as: 'admissionFees',
        foreignKey: 'admission_fees_policy_id',
      });

      // Get all programme version admission criteria subjects
      this.programmes = this.hasMany(models.RunningAdmissionProgramme, {
        as: 'programmes',
        foreignKey: 'running_admission_id',
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

  RunningAdmission.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      academic_year_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      intake_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      admission_scheme_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: AdmissionScheme,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      admission_form_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: AdmissionForm,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      degree_category_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      application_fees_policy_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ApplicationFeesPolicy,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      admission_fees_policy_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: AdmissionFeesPolicy,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      number_of_choices: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      maximum_number_of_forms: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      activate_online_applications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      activate_admission_fees: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      admission_start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      admission_end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      admission_description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      instructions: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      o_level_year_from: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      o_level_year_to: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      a_level_year_from: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      a_level_year_to: {
        type: DataTypes.BIGINT,
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
      modelName: 'RunningAdmission',
      tableName: 'running_admissions',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return RunningAdmission;
};
