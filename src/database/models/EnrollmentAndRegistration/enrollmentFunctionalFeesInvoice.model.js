'use strict';

const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');
const Enrollment = require('./enrollment.model');
const MetadataValue = require('../App/metadataValue.model');
const Student = require('../StudentRecords/students.model');
const StudentProgramme = require('../StudentRecords/studentProgramme.model');

module.exports = (sequelize, DataTypes) => {
  class EnrollmentFunctionalFeesInvoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get the academic year from academic_years Table.
      this.enrollment = this.belongsTo(models.Enrollment, {
        as: 'enrollment',
        foreignKey: 'enrollment_id',
      });
      this.student = this.belongsTo(models.Student, {
        as: 'student',
        foreignKey: 'student_id',
      });
      // student programme
      this.programme = this.belongsTo(models.StudentProgramme, {
        as: 'programme',
        foreignKey: 'student_programme_id',
      });
      this.invoiceType = this.belongsTo(models.MetadataValue, {
        as: 'invoiceType',
        foreignKey: 'invoice_type_id',
      });
      this.invoiceStatus = this.belongsTo(models.MetadataValue, {
        as: 'invoiceStatus',
        foreignKey: 'invoice_status_id',
      });
      this.creditNotes = this.hasMany(models.CreditNote, {
        as: 'creditNotes',
        foreignKey: 'invoice_id',
        constraints: false,
        scope: {
          invoice_type: 'functionalFeesInvoice',
        },
      });

      // Use this to save the fees elements for this invoice
      this.functionalElements = this.hasMany(
        models.FunctionalInvoiceFeesElement,
        {
          as: 'functionalElements',
          foreignKey: 'functional_invoice_id',
        }
      );

      this.feesElements = this.hasMany(models.FunctionalInvoiceFeesElement, {
        as: 'feesElements',
        foreignKey: 'functional_invoice_id',
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

  EnrollmentFunctionalFeesInvoice.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      enrollment_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: Enrollment,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
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
      student_programme_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: StudentProgramme,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      invoice_type_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      invoice_status_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      due_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      invoice_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      invoice_amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0.0,
      },
      amount_paid: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      amount_due: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0.0,
      },
      credit_note: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      debit_note: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
      },
      percentage_completion: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      exempted_amount: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
      },
      exempted_percentage: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
      },
      exemption_comments: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      de_allocated_amount: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
      },
      de_allocation_comments: {
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
      modelName: 'EnrollmentFunctionalFeesInvoice',
      tableName: 'enrollment_functional_fees_invoices',
      underscored: true,
      timestamps: true,
      schema: 'enrollment_and_registration_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return EnrollmentFunctionalFeesInvoice;
};
