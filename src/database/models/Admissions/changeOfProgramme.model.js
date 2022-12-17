'use strict';

const { Model, Deferrable } = require('sequelize');
const moment = require('moment');
const Student = require('../StudentRecords/students.model');
const Event = require('../EventScheduler/event.model');
const StudentProgramme = require('../StudentRecords/studentProgramme.model');
const MetadataValue = require('../App/metadataValue.model');
const User = require('../UserAccess/user.model');
const Programme = require('../ProgrammeManager/programme.model');
const ProgrammeVersion = require('../ProgrammeManager/programmeVersion.model');
const ProgrammeStudyYear = require('../ProgrammeManager/programmeStudyYear.model');
const ProgrammeType = require('../ProgrammeManager/programmeType.model');
const SubjectCombination = require('../ProgrammeManager/SubjectCombination.model');

module.exports = (sequelize, DataTypes) => {
  class ChangeOfProgramme extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get from model.
      this.student = this.belongsTo(models.Student, {
        as: 'student',
        foreignKey: 'student_id',
      });
      // Get from model.
      this.studentProgramme = this.belongsTo(models.StudentProgramme, {
        as: 'studentProgramme',
        foreignKey: 'student_programme_id',
      });
      this.event = this.belongsTo(models.Event, {
        as: 'event',
        foreignKey: 'event_id',
      });
      // Get from model.
      this.academicYear = this.belongsTo(models.MetadataValue, {
        as: 'academicYear',
        foreignKey: 'academic_year_id',
      });
      // Get from model.
      this.studyYear = this.belongsTo(models.ProgrammeStudyYear, {
        as: 'studyYear',
        foreignKey: 'new_study_year_id',
      });
      // Get from model.
      this.newProgramme = this.belongsTo(models.Programme, {
        as: 'newProgramme',
        foreignKey: 'new_programme_id',
      });
      // Get from model.
      this.newVersion = this.belongsTo(models.ProgrammeVersion, {
        as: 'newVersion',
        foreignKey: 'new_programme_version_id',
      });
      // Get from model.
      this.newProgrammeType = this.belongsTo(models.ProgrammeType, {
        as: 'newProgrammeType',
        foreignKey: 'new_programme_type_id',
      });
      // Get from model.
      this.newCampus = this.belongsTo(models.MetadataValue, {
        as: 'newCampus',
        foreignKey: 'new_campus_id',
      });
      // Get from model.
      this.newSubjectComb = this.belongsTo(models.SubjectCombination, {
        as: 'newSubjectComb',
        foreignKey: 'new_subject_comb_id',
      });
      // The User who Approved this Record
      this.approvedBy = this.belongsTo(models.User, {
        as: 'approvedBy',
        foreignKey: 'staff_approval_by',
      });
      // The User who Approved this Record
      this.acceptedBy = this.belongsTo(models.User, {
        as: 'acceptedBy',
        foreignKey: 'staff_accepted_by',
      });
      // The User who created this Record
      this.staffWhoCreated = this.belongsTo(models.User, {
        as: 'staffWhoCreated',
        foreignKey: 'staff_created_id',
      });
    }
  }

  ChangeOfProgramme.init(
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
      new_programme_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: Programme,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      new_programme_version_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ProgrammeVersion,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      new_programme_type_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ProgrammeType,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      new_campus_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      event_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: Event,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      new_subject_comb_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: SubjectCombination,
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
      new_study_year_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ProgrammeStudyYear,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      currency_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      request_status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'PENDING',
      },
      request_approved_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      staff_created_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      request_approval_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      requires_payment: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      system_prn: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ura_prn: {
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
      paid: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      balance: {
        type: DataTypes.DOUBLE,
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
      currency: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      service_type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'CHANGE OF PROGRAMME',
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
      payment_status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'PENDING',
      },
      payment_status_description: {
        type: DataTypes.STRING,
        defaultValue: 'PENDING',
        allowNull: true,
      },
      staff_has_approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      staff_approval_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      staff_approved_on: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      staff_has_accepted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      staff_accepted_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      staff_accepted_on: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      student_accepted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      student_accepted_on: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      acceptance_letter_downloaded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      acceptance_letter_downloaded_on: {
        type: DataTypes.DATE,
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
      modelName: 'ChangeOfProgramme',
      tableName: 'change_of_programmes',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return ChangeOfProgramme;
};
