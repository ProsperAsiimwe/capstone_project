'use strict';

const { Model, Deferrable } = require('sequelize');

const AcademicYear = require('./academicYear.model');
const MetadataValue = require('../App/metadataValue.model');
const User = require('../UserAccess/user.model');

module.exports = (sequelize, DataTypes) => {
  class Semester extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get the metadata value this semester belongs to
      this.semester = this.belongsTo(models.MetadataValue, {
        as: 'semester',
        foreignKey: 'semester_id',
      });

      this.academicYear = this.belongsTo(models.AcademicYear, {
        as: 'academicYear',
        foreignKey: 'academic_year_id',
      });

      // Get the campuses from metadata_values Table.
      this.campuses = this.belongsToMany(models.MetadataValue, {
        through: models.SemesterCampus,
        as: 'campuses',
        foreignKey: 'semester_id',
        otherKey: 'campus_id',
      });

      // Use this to Save to semester_campus Table
      this.semesterCampuses = this.hasMany(models.SemesterCampus, {
        as: 'semesterCampuses',
      });

      // Get the intakes from metadata_values Table.
      this.intakes = this.belongsToMany(models.MetadataValue, {
        through: models.SemesterIntake,
        as: 'intakes',
        foreignKey: 'semester_id',
        otherKey: 'intake_id',
      });

      // Use this to Save to semester_intakes Table
      this.semesterIntakes = this.hasMany(models.SemesterIntake, {
        as: 'semesterIntakes',
      });
      //
      this.semEntryAcademicYrs = this.hasMany(
        models.SemesterEntryAcademicYear,
        {
          as: 'semEntryAcademicYrs',
        }
      );

      // The User who Created this Record
      this.createdBy = this.belongsTo(models.User, { as: 'createdBy' });

      // The User who approved the newly created Record
      this.createApprovedBy = this.belongsTo(models.User, {
        as: 'createApprovedBy',
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

  Semester.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      semester_id: {
        type: DataTypes.BIGINT,
        unique: false,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      academic_year_id: {
        type: DataTypes.BIGINT,
        unique: false,
        allowNull: false,
        references: {
          key: 'id',
          model: AcademicYear,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
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
        allowNull: false,
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
      modelName: 'Semester',
      tableName: 'semesters',
      underscored: true,
      timestamps: true,
      schema: 'events_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return Semester;
};
