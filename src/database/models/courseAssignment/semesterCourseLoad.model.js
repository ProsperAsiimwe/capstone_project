'use strict';

const { Model, Deferrable } = require('sequelize');
const User = require('../UserAccess/user.model');

const MetadataValue = require('../App/metadataValue.model');
const {
  SemesterCourseLoadContext,
} = require('./semesterCourseLoadContext.model');

module.exports = (sequelize, DataTypes) => {
  class SemesterCourseLoad extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.courseCategory = this.belongsTo(models.MetadataValue, {
        as: 'courseCategory',
        foreignKey: 'course_category_id',
      });

      // The User who created this Record
      this.createdBy = this.belongsTo(models.User, {
        as: 'createdBy',
        foreignKey: 'created_by_id',
      });

      // The User who created this Record
      this.lastUpdatedBy = this.belongsTo(models.User, {
        as: 'lastUpdatedBy',
        foreignKey: 'last_updated_by_id',
      });
    }
  }

  SemesterCourseLoad.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      semester_course_load_context_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: SemesterCourseLoadContext,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      course_category_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      minimum_courses: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      maximum_courses: {
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
      last_updated_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
    },

    {
      sequelize,
      modelName: 'SemesterCourseLoad',
      tableName: 'semester_course_loads',
      underscored: true,
      timestamps: true,
      schema: 'course_assignment',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return SemesterCourseLoad;
};
