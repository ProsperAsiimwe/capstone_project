'use strict';

const { Model, Deferrable } = require('sequelize');

const Registration = require('./registration.model');
const CourseUnit = require('../ProgrammeManager/courseUnit.model');
const MetadataValue = require('../App/metadataValue.model');

module.exports = (sequelize, DataTypes) => {
  class RegistrationCourseUnit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // registration
      this.registration = this.belongsTo(models.Registration, {
        as: 'registration',
        foreignKey: 'registration_id',
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
    }
  }

  RegistrationCourseUnit.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      registration_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: Registration,
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
      modelName: 'RegistrationCourseUnit',
      tableName: 'registration_course_units',
      underscored: true,
      timestamps: true,
      schema: 'enrollment_and_registration_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return RegistrationCourseUnit;
};
