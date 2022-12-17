'use strict';

const { Model, Deferrable } = require('sequelize');

const Enrollment = require('./enrollment.model');
const CourseUnit = require('../ProgrammeManager/courseUnit.model');
const MetadataValue = require('../App/metadataValue.model');

module.exports = (sequelize, DataTypes) => {
  class EnrollmentCourseUnit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // enrollment
      this.enrollment = this.belongsTo(models.Enrollment, {
        as: 'enrollment',
        foreignKey: 'enrollment_id',
      });
      // courseUnit
      this.courseUnit = this.belongsTo(models.CourseUnit, {
        as: 'courseUnit',
        foreignKey: 'course_unit_id',
      });
      // courseUnit
      this.courseUnitStatus = this.belongsTo(models.MetadataValue, {
        as: 'courseUnitStatus',
        foreignKey: 'course_unit_status_id',
      });
      //
      this.tuitionInvoice = this.hasOne(models.EnrollmentTuitionInvoice, {
        as: 'tuitionInvoice',
        foreignKey: 'enrollment_course_unit_id',
      });
      //
      this.otherFeesInvoice = this.hasOne(models.EnrollmentOtherFeesInvoice, {
        as: 'otherFeesInvoice',
        foreignKey: 'enrollment_course_unit_id',
      });
    }
  }

  EnrollmentCourseUnit.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      enrollment_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: Enrollment,
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
      course_unit_status_id: {
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
    },
    {
      sequelize,
      modelName: 'EnrollmentCourseUnit',
      tableName: 'enrollment_retake_course_units',
      underscored: true,
      timestamps: true,
      schema: 'enrollment_and_registration_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return EnrollmentCourseUnit;
};
