'use strict';

const { Model, Deferrable } = require('sequelize');

const Student = require('./students.model');
const Programme = require('../ProgrammeManager/programme.model');
const ProgrammeVersion = require('../ProgrammeManager/programmeVersion.model');
const ProgrammeVersionPlan = require('../ProgrammeManager/ProgrammeVersionPlan.model');
const ProgrammeVersionSpecialization = require('../ProgrammeManager/ProgrammeVersionSpecialization.model');
const SubjectCombination = require('../ProgrammeManager/SubjectCombination.model');
const SubjectCombinationSubject = require('../ProgrammeManager/SubjectCombinationSubject.model');
const FeesWaiver = require('../FeesManager/feesWaiver.model');
const Applicant = require('../Admissions/applicant.model');
const MetadataValue = require('../App/metadataValue.model');
const ProgrammeStudyYear = require('../ProgrammeManager/programmeStudyYear.model');
const ProgrammeType = require('../ProgrammeManager/programmeType.model');
const User = require('../UserAccess/user.model');

module.exports = (sequelize, DataTypes) => {
  class StudentProgramme extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      // approvals
      this.approvals = this.hasOne(models.StudentApproval, {
        as: 'approvals',
        foreignKey: 'student_programme_id',
      });
      //
      this.studentSponsor = this.hasOne(models.SponsorStudent, {
        as: 'studentSponsor',
        foreignKey: 'student_programme_id',
      });
      //
      this.academicStatuses = this.hasMany(
        models.StudentProgrammeAcademicStatus,
        {
          as: 'academicStatuses',
          foreignKey: 'student_programme_id',
        }
      );
      this.academicStatusDetails = this.hasMany(
        models.StudentProgrammeAcademicStatusDetail,
        {
          as: 'academicStatusDetails',
          foreignKey: 'student_programme_id',
        }
      );
      // Get from model.
      this.student = this.belongsTo(models.Student, {
        as: 'student',
        foreignKey: 'student_id',
      });
      // Get from model.
      this.programme = this.belongsTo(models.Programme, {
        as: 'programme',
        foreignKey: 'programme_id',
      });
      // Get from model.
      this.programmeVersion = this.belongsTo(models.ProgrammeVersion, {
        as: 'programmeVersion',
        foreignKey: 'programme_version_id',
      });
      // Get from model.
      this.programmeVersionPlan = this.belongsTo(models.ProgrammeVersionPlan, {
        as: 'programmeVersionPlan',
        foreignKey: 'programme_version_plan_id',
      });
      // Get from model.
      this.versionSpecialization = this.belongsTo(
        models.ProgrammeVersionSpecialization,
        {
          as: 'versionSpecialization',
          foreignKey: 'specialization_id',
        }
      );
      // Get from model.
      this.subjectCombination = this.belongsTo(models.SubjectCombination, {
        as: 'subjectCombination',
        foreignKey: 'subject_combination_id',
      });
      // Get from model.
      this.major = this.belongsTo(models.SubjectCombinationSubject, {
        as: 'major',
        foreignKey: 'major_subject_id',
      });
      // Get from model.
      this.minor = this.belongsTo(models.SubjectCombinationSubject, {
        as: 'minor',
        foreignKey: 'minor_subject_id',
      });
      // Get from model.
      this.applicant = this.belongsTo(models.Applicant, {
        as: 'applicant',
        foreignKey: 'applicant_id',
      });
      // Get from model.
      this.feesWaiver = this.belongsTo(models.FeesWaiver, {
        as: 'feesWaiver',
        foreignKey: 'fees_waiver_id',
      });
      // Get from model.
      this.entryStudyYear = this.belongsTo(models.ProgrammeStudyYear, {
        as: 'entryStudyYear',
        foreignKey: 'entry_study_year_id',
      });

      // Get from model.
      this.versionEntryYears = this.hasMany(models.ProgrammeVersionEntryYear, {
        as: 'versionEntryYears',
        foreignKey: 'programme_version_id',
        sourceKey: 'programme_version_id',
      });
      // Get from model.
      this.currentStudyYear = this.belongsTo(models.ProgrammeStudyYear, {
        as: 'currentStudyYear',
        foreignKey: 'current_study_year_id',
      });
      // Get from model.
      this.intake = this.belongsTo(models.MetadataValue, {
        as: 'intake',
        foreignKey: 'intake_id',
      });
      // Get from model.
      this.campus = this.belongsTo(models.MetadataValue, {
        as: 'campus',
        foreignKey: 'campus_id',
      });
      // Get from model.
      this.entryAcademicYear = this.belongsTo(models.MetadataValue, {
        as: 'entryAcademicYear',
        foreignKey: 'entry_academic_year_id',
      });
      // Get from model.
      this.programmeType = this.belongsTo(models.ProgrammeType, {
        as: 'programmeType',
        foreignKey: 'programme_type_id',
      });
      // Get from model.
      this.sponsorship = this.belongsTo(models.MetadataValue, {
        as: 'sponsorship',
        foreignKey: 'sponsorship_id',
      });
      // Get from model.
      this.billingCategory = this.belongsTo(models.MetadataValue, {
        as: 'billingCategory',
        foreignKey: 'billing_category_id',
      });
      // Get from model.
      this.residenceStatus = this.belongsTo(models.MetadataValue, {
        as: 'residenceStatus',
        foreignKey: 'residence_status_id',
      });
      // Get from model.
      this.hallOfAttachment = this.belongsTo(models.MetadataValue, {
        as: 'hallOfAttachment',
        foreignKey: 'hall_of_attachment_id',
      });
      // Get from model.
      this.hallOfResidence = this.belongsTo(models.MetadataValue, {
        as: 'hallOfResidence',
        foreignKey: 'hall_of_residence_id',
      });
      // Get from model.
      this.studentAcademicStatus = this.belongsTo(models.MetadataValue, {
        as: 'studentAcademicStatus',
        foreignKey: 'student_academic_status_id',
      });
      // Get from model.
      this.currentSemester = this.belongsTo(models.MetadataValue, {
        as: 'currentSemester',
        foreignKey: 'current_semester_id',
      });

      // The User who Created this Record
      this.createdBy = this.belongsTo(models.User, {
        as: 'createdBy',
        foreignKey: 'created_by_id',
      });

      // The User who verified documents
      this.documentsVerifiedBy = this.belongsTo(models.User, {
        as: 'documentsVerifiedBy',
        foreignKey: 'documents_verified_by_id',
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

  StudentProgramme.init(
    {
      id: {
        type: DataTypes.BIGINT,
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
      applicant_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: Applicant,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      programme_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: Programme,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      programme_type_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ProgrammeType,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      programme_version_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ProgrammeVersion,
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
      subject_combination_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: SubjectCombination,
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
      fees_waiver_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: FeesWaiver,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      entry_academic_year_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      entry_study_year_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ProgrammeStudyYear,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      current_study_year_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: ProgrammeStudyYear,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      current_semester_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
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
      campus_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      sponsorship_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      billing_category_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      residence_status_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      hall_of_attachment_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      hall_of_residence_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      student_academic_status_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      academic_status_academic_year_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      academic_status_created_by_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      academic_status_active_until: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      academic_status_comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      marital_status_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      old_student_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      registration_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      student_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_current_programme: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      is_on_loan_scheme: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      has_completed: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      on_graduation_list: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      is_affiliated: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      on_provisional_list: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      affiliate_institute_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sponsor: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      documents_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      document_verification_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      documents_verified_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
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
      modelName: 'StudentProgramme',
      tableName: 'student_programmes',
      underscored: true,
      timestamps: true,
      schema: 'students_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return StudentProgramme;
};
