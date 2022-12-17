'use strict';

const { Model, Deferrable } = require('sequelize');
const User = require('../UserAccess/user.model');
const MetadataValue = require('../App/metadataValue.model');
const ResultAllocationNode = require('./resultAllocationNode.model');
const StudentProgramme = require('../StudentRecords/studentProgramme.model');
const RegistrationCourseUnit = require('../EnrollmentAndRegistration/registrationCourseUnit.model');
const GradingValue = require('../ProgrammeManager/gradingValue.model');
const ProgrammeVersionCourseUnit = require('../ProgrammeManager/programmeVersionCourseUnit.model');

module.exports = (sequelize, DataTypes) => {
  class Result extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.batch = this.hasOne(models.ResultBatch, {
        as: 'batch',
        foreignKey: 'result_id',
      });
      this.retakes = this.hasMany(models.RetakePaper, {
        as: 'retakes',
        foreignKey: 'retake_paper_id',
      });
      // Get the model
      this.academicYear = this.belongsTo(models.MetadataValue, {
        as: 'academicYear',
        foreignKey: 'academic_year_id',
      });
      // Get the model
      this.semester = this.belongsTo(models.MetadataValue, {
        as: 'semester',
        foreignKey: 'semester_id',
      });
      // Get the model
      this.studyYear = this.belongsTo(models.MetadataValue, {
        as: 'studyYear',
        foreignKey: 'study_year_id',
      });
      // Get the model
      this.studentProgramme = this.belongsTo(models.StudentProgramme, {
        as: 'studentProgramme',
        foreignKey: 'student_programme_id',
      });
      // Get the model
      this.regCourseUnit = this.belongsTo(models.RegistrationCourseUnit, {
        as: 'regCourseUnit',
        foreignKey: 'registration_course_unit_id',
      });
      // Get the model
      this.versionCourseUnit = this.belongsTo(
        models.ProgrammeVersionCourseUnit,
        {
          as: 'versionCourseUnit',
          foreignKey: 'programme_version_course_unit_id',
        }
      );

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

      // deactivated_by_id
      this.deactivatedBy = this.belongsTo(models.User, {
        as: 'deactivatedBy',
        foreignKey: 'deactivated_by_id',
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

  Result.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      campus_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
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
      semester_id: {
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
      remark_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      course_work_node_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: ResultAllocationNode,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      final_exam_node_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: ResultAllocationNode,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      final_mark_node_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: ResultAllocationNode,
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
      registration_course_unit_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: RegistrationCourseUnit,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      programme_version_course_unit_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ProgrammeVersionCourseUnit,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      grading_value_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: GradingValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      is_audited_course: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      course_work: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      final_exam: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      final_mark: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      is_submitted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_computed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      has_passed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      pass_mark: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      approved_by_senate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_first_sitting: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      is_incomplete_result: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_retaken: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      retake_count: {
        type: DataTypes.INTEGER,
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
      submitted_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      submit_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      computed_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      compute_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      published_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      publish_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deactivated_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      deactivated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      deactivation_reason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_deactivated: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    },

    {
      sequelize,
      modelName: 'Result',
      tableName: 'results',
      timestamps: true,
      underscored: true,
      schema: 'results_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      deactivatedAt: 'deactivated_at',
    }
  );

  return Result;
};
