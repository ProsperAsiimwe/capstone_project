'use strict';

const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');
const MetadataValue = require('../App/metadataValue.model');
const Student = require('../StudentRecords/students.model');
const StudentProgramme = require('../StudentRecords/studentProgramme.model');
const Event = require('../EventScheduler/event.model');
const StudyYear = require('../ProgrammeManager/programmeStudyYear.model');
const ProgrammeVersionPlan = require('../ProgrammeManager/ProgrammeVersionPlan.model');
const ProgrammeVersionSpecialization = require('../ProgrammeManager/ProgrammeVersionSpecialization.model');
const SubjectCombinationSubject = require('../ProgrammeManager/SubjectCombinationSubject.model');

module.exports = (sequelize, DataTypes) => {
  class Enrollment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.functionalInvoice = this.hasOne(
        models.EnrollmentFunctionalFeesInvoice,
        {
          as: 'functionalInvoice',
          foreignKey: 'enrollment_id',
        }
      );
      this.otherFeesInvoice = this.hasMany(models.EnrollmentOtherFeesInvoice, {
        as: 'otherFeesInvoice',
        foreignKey: 'enrollment_id',
      });
      this.tuitionInvoice = this.hasMany(models.EnrollmentTuitionInvoice, {
        as: 'tuitionInvoice',
        foreignKey: 'enrollment_id',
      });
      // Get the enrollment event Table.
      this.event = this.belongsTo(models.Event, {
        as: 'event',
        foreignKey: 'event_id',
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

      this.studyYear = this.belongsTo(models.ProgrammeStudyYear, {
        as: 'studyYear',
        foreignKey: 'study_year_id',
      });
      this.enrollmentStatus = this.belongsTo(models.MetadataValue, {
        as: 'enrollmentStatus',
        foreignKey: 'enrollment_status_id',
      });
      //
      this.oldSemester = this.belongsTo(models.MetadataValue, {
        as: 'oldSemester',
        foreignKey: 'old_semester_id',
      });

      this.registration = this.hasOne(models.Registration, {
        as: 'registration',
        foreignKey: 'enrollment_id',
      });

      this.retakes = this.hasMany(models.EnrollmentCourseUnit, {
        as: 'retakes',
        foreignKey: 'enrollment_id',
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

  Enrollment.init(
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
      event_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: Event,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      study_year_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: StudyYear,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      enrollment_status_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      old_study_year_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: StudyYear,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      old_semester_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      programme_version_plan_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: ProgrammeVersionPlan,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      specialization_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: ProgrammeVersionSpecialization,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      major_subject_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: SubjectCombinationSubject,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      minor_subject_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: SubjectCombinationSubject,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      enrollment_token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      enrolled_by: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      comment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      enrollment_condition: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      reg_due_date: {
        type: DataTypes.DATE,
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
      modelName: 'Enrollment',
      tableName: 'enrollments',
      underscored: true,
      timestamps: true,
      schema: 'enrollment_and_registration_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return Enrollment;
};
