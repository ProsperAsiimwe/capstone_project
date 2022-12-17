'use strict';

const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');
const MetadataValue = require('../App/metadataValue.model');
const Student = require('../StudentRecords/students.model');
const StudentProgramme = require('../StudentRecords/studentProgramme.model');
const Event = require('../EventScheduler/event.model');
const Enrollment = require('../EnrollmentAndRegistration/enrollment.model');

module.exports = (sequelize, DataTypes) => {
  class Registration extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // save to RegistrationCourseUnit
      this.courseUnits = this.hasMany(models.RegistrationCourseUnit, {
        as: 'courseUnits',
        foreignKey: 'registration_id',
      });

      // Pick directly from the course units table.
      // this.courseUnits = this.belongsToMany(models.CourseUnit, {
      //   through: models.RegistrationCourseUnit,
      //   as: "courseUnits",
      //   foreignKey: "registration_id",
      //   otherKey: "course_unit_id",
      // });

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
      this.registrationType = this.belongsTo(models.MetadataValue, {
        as: 'registrationType',
        foreignKey: 'registration_type_id',
      });
      this.provisionalType = this.belongsTo(models.MetadataValue, {
        as: 'provisionalType',
        foreignKey: 'provisional_registration_type_id',
      });
      this.enrollment = this.belongsTo(models.Enrollment, {
        as: 'enrollment',
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

  Registration.init(
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
      enrollment_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: Enrollment,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      registration_type_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      provisional_registration_type_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      registered_by: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      comment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      registration_condition: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      provisional_registration_comment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
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
      modelName: 'Registration',
      tableName: 'registrations',
      underscored: true,
      timestamps: true,
      schema: 'enrollment_and_registration_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return Registration;
};
