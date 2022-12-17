'use strict';

const { Model, Deferrable } = require('sequelize');
const moment = require('moment');
const Student = require('../StudentRecords/students.model');
const User = require('../UserAccess/user.model');

module.exports = (sequelize, DataTypes) => {
  class PaymentReference extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Use this to Save to paymentReferenceOtherFeesInvoice Table
      this.otherFeesInvoices = this.hasMany(
        models.PaymentReferenceOtherFeesInvoice,
        {
          as: 'otherFeesInvoices',
          foreignKey: 'payment_reference_id',
        }
      );

      // Use this to Save to paymentReferenceManualInvoice Table
      this.manualInvoices = this.hasMany(models.PaymentReferenceManualInvoice, {
        as: 'manualInvoices',
        foreignKey: 'payment_reference_id',
      });

      // Use this to Save to PaymentReferenceFunctionalInvoice Table
      this.functionalFeesInvoice = this.hasMany(
        models.PaymentReferenceFunctionalInvoice,
        {
          as: 'functionalFeesInvoice',
          foreignKey: 'payment_reference_id',
        }
      );

      // Use this to Save to PaymentReferenceTuitionInvoice Table
      this.tuitionInvoice = this.hasMany(
        models.PaymentReferenceTuitionInvoice,
        {
          as: 'tuitionInvoice',
          foreignKey: 'payment_reference_id',
        }
      );

      //
      this.graduationInvoices = this.hasMany(
        models.PaymentReferenceGraduationInvoice,
        {
          as: 'graduationInvoices',
          foreignKey: 'payment_reference_id',
        }
      );

      //
      this.elementAllocation = this.hasMany(models.FeesItemPayment, {
        as: 'elementAllocation',
        foreignKey: 'payment_reference_id',
      });

      this.student = this.belongsTo(models.Student, {
        as: 'student',
        foreignKey: 'student_id',
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

  PaymentReference.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      student_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: Student,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
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
        allowNull: false,
        defaultValue: false,
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
      payment_status: {
        type: DataTypes.STRING,
        defaultValue: 'A',
      },
      payment_status_description: {
        type: DataTypes.STRING,
        defaultValue: 'AVAILABLE',
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
      modelName: 'PaymentReference',
      tableName: 'payment_references',
      underscored: true,
      timestamps: true,
      schema: 'enrollment_and_registration_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return PaymentReference;
};
