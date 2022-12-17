'use strict';

const { Model, Deferrable } = require('sequelize');
const moment = require('moment');
const Student = require('../StudentRecords/students.model');
const User = require('../UserAccess/user.model');
const StudyYear = require('../ProgrammeManager/programmeStudyYear.model');
const AcademicYear = require('../EventScheduler/academicYear.model');
const Semester = require('../EventScheduler/semester.model');

const uppercaseFirst = (str) => `${str[0].toUpperCase()}${str.substr(1)}`;

module.exports = (sequelize, DataTypes) => {
  class PaymentTransaction extends Model {
    getRecord(options) {
      if (!this.origin_type) return Promise.resolve(null);
      const mixinMethodName = `get${uppercaseFirst(this.origin_type)}`;

      return this[mixinMethodName](options);
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.academicYear = this.belongsTo(models.AcademicYear, {
        as: 'academicYear',
        foreignKey: 'academic_year_id',
      });
      this.semester = this.belongsTo(models.Semester, {
        as: 'semester',
        foreignKey: 'semester_id',
      });
      this.student = this.belongsTo(models.Student, {
        as: 'student',
        foreignKey: 'student_id',
      });

      this.studyYear = this.belongsTo(models.ProgrammeStudyYear, {
        as: 'studyYear',
        foreignKey: 'study_year_id',
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

      this.sponsorTransaction = this.belongsTo(models.SponsorTransaction, {
        as: 'sponsorTransaction',
        foreignKey: 'origin_id',
        constraints: false,
      });
    }
  }

  PaymentTransaction.init(
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
      academic_year_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: AcademicYear,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      semester_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: Semester,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      study_year_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: StudyYear,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      ura_prn: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      system_prn: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      bank: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      branch: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      banktxnid: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      payment_date: {
        type: DataTypes.DATEONLY,
        get: function () {
          return moment
            .utc(this.getDataValue('payment_date'))
            .format('YYYY.MM.DD');
        },
        allowNull: false,
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      signature: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      allocated_amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0.0,
      },
      unallocated_amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0.0,
      },
      transaction_origin: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payment_mode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mode_reference: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      narration: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      origin_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      origin_type: {
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
      modelName: 'PaymentTransaction',
      tableName: 'payment_transactions',
      underscored: true,
      timestamps: true,
      schema: 'enrollment_and_registration_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  // PaymentTransaction.addHook('afterFind', (findRecord) => {
  //   if (!Array.isArray(findRecord)) findRecord = [findRecord];
  //   for (const instance of findRecord) {
  //     if (
  //       instance.origin_type === 'sponsorTransaction' &&
  //       instance.sponsorTransaction !== undefined
  //     ) {
  //       instance.origin_id = instance.sponsorTransaction;
  //     }

  //     // To prevent mistakes:
  //     delete instance.sponsorTransaction;
  //     delete instance.dataValues.sponsorTransaction;
  //   }
  // });

  return PaymentTransaction;
};
