'use strict';

const { Model, Deferrable } = require('sequelize');
const User = require('../UserAccess/user.model');

const MetadataValue = require('../App/metadataValue.model');
const Programme = require('../ProgrammeManager/programme.model');
const { ProgrammeStudyYear } = require('@models/ProgrammeManager');

module.exports = (sequelize, DataTypes) => {
  class SemesterCourseLoadContext extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.academicYear = this.belongsTo(models.MetadataValue, {
        as: 'academicYear',
        foreignKey: 'academic_year_id',
      });

      this.semester = this.belongsTo(models.MetadataValue, {
        as: 'semester',
        foreignKey: 'semester_id',
      });

      this.studyYear = this.belongsTo(models.ProgrammeStudyYear, {
        as: 'studyYear',
        foreignKey: 'semester_id',
      });

      // Get the Programme Semester Load Context
      this.programme = this.belongsTo(models.Programme, {
        as: 'programme',
        foreignKey: 'programme_id',
      });

      // Save Programme Semester Loads
      this.semesterLoads = this.hasMany(models.SemesterCourseLoad, {
        as: 'semesterLoads',
        foreignKey: 'semester_course_load_context_id',
        onDelete: 'cascade',
        hooks: true,
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

  SemesterCourseLoadContext.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      programme_study_year_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ProgrammeStudyYear,
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
      academic_year_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
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
      modelName: 'SemesterCourseLoadContext',
      tableName: 'semester_course_load_contexts',
      underscored: true,
      timestamps: true,
      schema: 'course_assignment',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return SemesterCourseLoadContext;
};
