'use strict';

const { Model, Deferrable } = require('sequelize');

const Subject = require('./subject.model');
const User = require('../UserAccess/user.model');
const Department = require('./department.model');

module.exports = (sequelize, DataTypes) => {
  class CourseUnit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      this.department = this.belongsTo(models.Department, {
        as: 'department',
        foreignKey: 'department_id',
      });

      this.subject = this.belongsTo(models.Subject, {
        as: 'subject',
        foreignKey: 'subject_id',
      });

      //
      this.prerequisiteCourses = this.hasMany(models.CoursePrerequisite, {
        as: 'prerequisiteCourses',
        foreignKey: 'course_unit_id',
      });

      this.pvCourseUnits = this.hasMany(models.ProgrammeVersionCourseUnit, {
        as: 'pvCourseUnits',
        foreignKey: 'course_unit_id',
      });

      // Get the course Unit Specializations.
      // this.specializations = this.belongsToMany(models.Specialization, {
      //   through: models.CourseUnitSpecialization,
      //   as: 'specializations',
      //   foreignKey: 'course_unit_id',
      //   otherKey: 'specialization_id',
      // });
      // // Use this to save data to courseUnitSpecialization table.
      // this.courseSpecializations = this.hasMany(
      //   models.CourseUnitSpecialization,
      //   {
      //     as: 'courseSpecializations',
      //     foreignKey: 'course_unit_id',
      //   }
      // );

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

  CourseUnit.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      department_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: Department,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      subject_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: Subject,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      course_unit_code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      course_unit_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      credit_unit: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      lecture_hours: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      clinical_hours: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      practical_hours: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      contact_hours: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      tutorial_hours: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      notional_hours: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      field_work_hours: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      has_prerequisite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      modelName: 'CourseUnit',
      tableName: 'course_units',
      underscored: true,
      timestamps: true,
      schema: 'programme_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return CourseUnit;
};
