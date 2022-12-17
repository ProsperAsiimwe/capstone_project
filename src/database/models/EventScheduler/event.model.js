'use strict';

const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');
const MetadataValue = require('../App/metadataValue.model');
const Semester = require('./semester.model');
const AcademicYearModel = require('./academicYear.model');

module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get the event from Meta Data Value Table.
      this.event = this.belongsTo(models.MetadataValue, {
        as: 'event',
        foreignKey: 'event_id',
      });

      // Get the academic year from academic year Table.
      this.academicYear = this.belongsTo(models.AcademicYear, {
        as: 'academicYear',
        foreignKey: 'academic_year_id',
      });

      // Get the semester from semester Table.
      this.semester = this.belongsTo(models.Semester, {
        as: 'semester',
        foreignKey: 'semester_id',
      });

      // Get the intakes from metadata_values Table.
      this.intakes = this.belongsToMany(models.MetadataValue, {
        through: models.EventIntake,
        as: 'intakes',
        foreignKey: 'event_id',
        otherKey: 'intake_id',
      });

      // Us this to Save to event_intakes Table
      this.eventIntakes = this.hasMany(models.EventIntake, {
        as: 'eventIntakes',
        foreignKey: 'event_id',
      });

      // Get the campuses from metadata_values Table.
      this.campuses = this.belongsToMany(models.MetadataValue, {
        through: models.EventCampus,
        as: 'campuses',
        foreignKey: 'event_id',
        otherKey: 'campus_id',
      });

      // Us this to Save to event_campus Table
      this.eventCampuses = this.hasMany(models.EventCampus, {
        as: 'eventCampuses',
        foreignKey: 'event_id',
      });

      // Get the entry academic years from metadata_values Table.
      this.entryAcademicYears = this.belongsToMany(models.MetadataValue, {
        through: models.EventEntryAcademicYear,
        as: 'entryAcademicYears',
        foreignKey: 'event_id',
        otherKey: 'entry_academic_year_id',
      });

      // Us this to Save to event_entry_academic_years Table
      this.eventEntryAcademicYears = this.hasMany(
        models.EventEntryAcademicYear,
        {
          as: 'eventEntryAcademicYears',
          foreignKey: 'event_id',
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

  Event.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      event_id: {
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
          model: AcademicYearModel,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      semester_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: Semester,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      event_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATEONLY,
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
      modelName: 'Event',
      tableName: 'events',
      underscored: true,
      timestamps: true,
      schema: 'events_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return Event;
};
