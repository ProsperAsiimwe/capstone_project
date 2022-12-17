'use strict';

const { Model, Deferrable } = require('sequelize');
const moment = require('moment');
const RunningAdmission = require('./runningAdmission.model');
const Applicant = require('./applicant.model');
const MetadataValue = require('../App/metadataValue.model');

module.exports = (sequelize, DataTypes) => {
  class RunningAdmissionApplicant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get the sections from metadata_values Table.
      this.sections = this.belongsToMany(models.MetadataValue, {
        through: models.RunningAdmissionApplicantSection,
        as: 'sections',
        foreignKey: 'running_admission_applicant_id',
        otherKey: 'form_section_id',
      });
      // Use this to Save to RunningAdmissionApplicantSection Table
      this.formSections = this.hasMany(
        models.RunningAdmissionApplicantSection,
        {
          as: 'formSections',
          foreignKey: 'running_admission_applicant_id',
        }
      );
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
      // get the payment method
      this.paymentMethod = this.belongsTo(models.MetadataValue, {
        as: 'paymentMethod',
        foreignKey: 'payment_method_id',
      });
    }
  }

  RunningAdmissionApplicant.init(
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
      payment_method_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      payment_status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'PENDING',
      },
      form_id: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      application_status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'IN-PROGRESS',
      },
      application_start_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: moment.now(),
      },
      application_completion_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      application_admission_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      ura_prn: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      system_prn: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      search_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tax_payer_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      payment_mode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      payment_bank_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tax_payer_bank_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      generated_by: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      expiry_date: {
        type: DataTypes.DATEONLY,
        get: function () {
          return moment
            .utc(this.getDataValue('expiry_date'))
            .format('YYYY.MM.DD');
        },
        allowNull: true,
      },
      is_used: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
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
      modelName: 'RunningAdmissionApplicant',
      tableName: 'running_admission_applicants',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return RunningAdmissionApplicant;
};
