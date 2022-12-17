'use strict';

const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');
const Student = require('../StudentRecords/students.model');
const StudentProgramme = require('../StudentRecords/studentProgramme.model');
const FeesElement = require('../FeesManager/feesElement.model');

const uppercaseFirst = (str) => `${str[0].toUpperCase()}${str.substr(1)}`;

module.exports = (sequelize, DataTypes) => {
  class CreditNote extends Model {
    getInvoice(options) {
      if (!this.invoice_type) return Promise.resolve(null);
      const mixinMethodName = `get${uppercaseFirst(this.invoice_type)}`;

      return this[mixinMethodName](options);
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.functionalFeesInvoice = this.belongsTo(
        models.EnrollmentFunctionalFeesInvoice,
        {
          as: 'functionalFeesInvoice',
          foreignKey: 'invoice_id',
          constraints: false,
        }
      );
      this.otherFeesInvoice = this.belongsTo(
        models.EnrollmentOtherFeesInvoice,
        {
          as: 'otherFeesInvoice',
          foreignKey: 'invoice_id',
          constraints: false,
        }
      );
      this.tuitionInvoice = this.belongsTo(models.EnrollmentTuitionInvoice, {
        as: 'tuitionInvoice',
        foreignKey: 'invoice_id',
        constraints: false,
      });
      this.manualInvoice = this.belongsTo(models.EnrollmentManualInvoice, {
        as: 'manualInvoice',
        foreignKey: 'invoice_id',
        constraints: false,
      });

      this.student = this.belongsTo(models.Student, {
        as: 'student',
        foreignKey: 'student_id',
      });

      this.studentProgramme = this.belongsTo(models.StudentProgramme, {
        as: 'studentProgramme',
        foreignKey: 'student_programme_id',
      });

      // fees element
      this.feesElement = this.belongsTo(models.FeesElement, {
        as: 'feesElement',
        foreignKey: 'fees_element_id',
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

  CreditNote.init(
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
      student_programme_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: StudentProgramme,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      fees_element_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: FeesElement,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      invoice_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      invoice_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
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
      status: {
        type: DataTypes.STRING,
        defaultValue: 'PENDING',
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
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
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'CreditNote',
      tableName: 'credit_notes',
      underscored: true,
      timestamps: true,
      schema: 'enrollment_and_registration_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  CreditNote.addHook('afterFind', (findResult) => {
    if (!Array.isArray(findResult)) findResult = [findResult];
    for (const instance of findResult) {
      if (
        instance.invoice_type === 'tuitionInvoice' &&
        instance.tuitionInvoice !== undefined
      ) {
        instance.invoice_id = instance.tuitionInvoice;
      } else if (
        instance.invoice_type === 'functionalFeesInvoice' &&
        instance.functionalFeesInvoice !== undefined
      ) {
        instance.invoice_id = instance.functionalFeesInvoice;
      } else if (
        instance.invoice_type === 'otherFeesInvoice' &&
        instance.otherFeesInvoice !== undefined
      ) {
        instance.invoice_id = instance.otherFeesInvoice;
      } else if (
        instance.invoice_type === 'manualInvoice' &&
        instance.manualInvoice !== undefined
      ) {
        instance.invoice_id = instance.manualInvoice;
      }
      // To prevent mistakes:
      delete instance.tuitionInvoice;
      delete instance.dataValues.tuitionInvoice;
      delete instance.functionalFeesInvoice;
      delete instance.dataValues.functionalFeesInvoice;
      delete instance.otherFeesInvoice;
      delete instance.dataValues.otherFeesInvoice;
      delete instance.manualInvoice;
      delete instance.dataValues.manualInvoice;
    }
  });

  return CreditNote;
};
