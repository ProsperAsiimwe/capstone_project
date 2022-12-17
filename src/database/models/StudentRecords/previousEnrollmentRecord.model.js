'use strict';

const { Model, Deferrable } = require('sequelize');
const moment = require('moment');
const StudentProgramme = require('./studentProgramme.model');
const MetadataValue = require('../App/metadataValue.model');
const User = require('../UserAccess/user.model');

module.exports = (sequelize, DataTypes) => {
  class PreviousEnrollmentRecord extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      //
      this.studentProgramme = this.belongsTo(models.StudentProgramme, {
        as: 'studentProgramme',
        foreignKey: 'student_programme_id',
      });
      //
      this.otherFees = this.hasMany(models.PreviousEnrollmentRecordOtherFees, {
        as: 'otherFees',
        foreignKey: 'migrated_record_id',
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

  PreviousEnrollmentRecord.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
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
      academic_year_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      study_year_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      semester_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      enrollment_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      enrollment_status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      enrollment_date: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      registration_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      registration_status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      registration_date: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_card_printed: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      tuition_invoice_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tuition_amount: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      tuition_credit: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      tuition_paid: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      tuition_balance_due: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      functional_invoice_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      functional_amount: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      functional_credit: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      functional_paid: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      functional_balance_due: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      total_bill: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      total_credit: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      total_paid: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      total_due: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      is_billed: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },

      // Record Details
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: moment.now(),
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
      modelName: 'PreviousEnrollmentRecord',
      tableName: 'migrated_enrollments_records',
      underscored: true,
      timestamps: true,
      schema: 'students_data',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return PreviousEnrollmentRecord;
};
