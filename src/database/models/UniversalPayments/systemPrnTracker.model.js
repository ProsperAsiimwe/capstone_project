'use strict';

const { Model, Deferrable } = require('sequelize');
const User = require('../UserAccess/user.model');
const UniversalInvoice = require('./universalInvoice.model');
const Student = require('../StudentRecords/students.model');
const RunningAdmissionApplicant = require('../Admissions/runningAdmissionApplicant.model');
const Sponsor = require('./sponsor.model');
const moment = require('moment');
const { PujabApplication } = require('@models/Pujab');

module.exports = (sequelize, DataTypes) => {
  class SystemPrnTracker extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //
      this.universalInvoice = this.belongsTo(models.UniversalInvoice, {
        as: 'universalInvoice',
        foreignKey: 'universal_invoice_id',
      });
      //
      this.student = this.belongsTo(models.Student, {
        as: 'student',
        foreignKey: 'student_id',
      });
      //
      this.applicant = this.belongsTo(models.RunningAdmissionApplicant, {
        as: 'applicant',
        foreignKey: 'running_admission_applicant_id',
      });

      // The User who Created this Record
      this.createdBy = this.belongsTo(models.User, {
        as: 'createdBy',
        foreignKey: 'created_by_id',
      });

      // The User who approved the newly created Record
      this.createApprovedBy = this.belongsTo(models.User, {
        as: 'createApprovedBy',
        foreignKey: 'create_approved_by_id',
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

  SystemPrnTracker.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      // Universal Invoice Only Fields
      universal_invoice_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: UniversalInvoice,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      ip_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Enrollment And Registration Only Fields
      student_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: Student,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      // Applicant Only Fields
      running_admission_applicant_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: RunningAdmissionApplicant,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      // Applicant Only Fields
      pujab_application_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: PujabApplication,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      // Sponsor Only Fields
      sponsor_invoice_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: Sponsor,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      // Cross-cutting fields
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      system_prn: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      ura_prn: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      search_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0.0,
      },
      tax_payer_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payment_mode: {
        type: DataTypes.STRING,
        allowNull: false,
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
        allowNull: false,
      },
      expiry_date: {
        type: DataTypes.DATEONLY,
        get: function () {
          return moment
            .utc(this.getDataValue('expiry_date'))
            .format('YYYY.MM.DD');
        },
        allowNull: false,
      },
      is_used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      payment_status: {
        type: DataTypes.STRING,
        defaultValue: 'A',
      },
      payment_status_description: {
        type: DataTypes.STRING,
        defaultValue: 'AVAILABLE',
      },

      // Record Details
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
      modelName: 'SystemPrnTracker',
      tableName: 'system_prn_tracker',
      timestamps: false,
      underscored: true,
      schema: 'universal_payments_mgt',
      deletedAt: 'deleted_at',
    }
  );

  return SystemPrnTracker;
};
