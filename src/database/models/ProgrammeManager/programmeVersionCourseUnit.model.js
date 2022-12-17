'use strict';

const { Model, Deferrable } = require('sequelize');

const MetadataValue = require('../App/metadataValue.model');
const User = require('../UserAccess/user.model');
const ProgrammeVersion = require('./programmeVersion.model');
const CourseUnit = require('./courseUnit.model');
const Grading = require('./grading.model');
const ProgrammeStudyYear = require('./programmeStudyYear.model');

module.exports = (sequelize, DataTypes) => {
  class ProgrammeVersionCourseUnit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      this.planCourseUnits = this.hasMany(
        models.ProgrammeVersionPlanCourseUnit,
        {
          as: 'planCourseUnits',
          foreignKey: 'programme_version_course_unit_id',
          onDelete: 'cascade',
          hooks: true,
        }
      );

      this.specCourseUnits = this.hasMany(
        models.ProgrammeVersionSpecializationCourseUnit,
        {
          as: 'specCourseUnits',
          foreignKey: 'programme_version_course_unit_id',
          onDelete: 'cascade',
          hooks: true,
        }
      );

      this.subjectCourseUnits = this.hasMany(models.SubjectCourseUnit, {
        as: 'subjectCourseUnits',
        foreignKey: 'programme_version_course_unit_id',
        onDelete: 'cascade',
        hooks: true,
      });

      this.programmeVersion = this.belongsTo(models.ProgrammeVersion, {
        as: 'programmeVersion',
        foreignKey: 'programme_version_id',
      });

      this.courseUnit = this.belongsTo(models.CourseUnit, {
        as: 'courseUnit',
        foreignKey: 'course_unit_id',
      });

      this.grading = this.belongsTo(models.Grading, {
        as: 'grading',
        foreignKey: 'grading_id',
      });

      this.contributionAlgorithm = this.belongsTo(models.MetadataValue, {
        as: 'contributionAlgorithm',
        foreignKey: 'contribution_algorithm_id',
      });

      this.courseUnitSemester = this.belongsTo(models.MetadataValue, {
        as: 'courseUnitSemester',
        foreignKey: 'course_unit_semester_id',
      });

      this.courseUnitYear = this.belongsTo(models.ProgrammeStudyYear, {
        as: 'courseUnitYear',
        foreignKey: 'course_unit_year_id',
      });

      this.courseUnitCategory = this.belongsTo(models.MetadataValue, {
        as: 'courseUnitCategory',
        foreignKey: 'course_unit_category_id',
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

  ProgrammeVersionCourseUnit.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      course_unit_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: CourseUnit,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      grading_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: Grading,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      contribution_algorithm_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      course_unit_semester_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      course_unit_year_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ProgrammeStudyYear,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      course_unit_category_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      number_of_assessments: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      is_audited_course: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      version_credit_units: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      expect_result_upload: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      course_unit_status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      reason_for_active: {
        type: DataTypes.TEXT,
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
      modelName: 'ProgrammeVersionCourseUnit',
      tableName: 'programme_version_course_units',
      underscored: true,
      timestamps: true,
      schema: 'programme_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return ProgrammeVersionCourseUnit;
};
