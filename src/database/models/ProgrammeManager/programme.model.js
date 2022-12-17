'use strict';

const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');
const Department = require('./department.model');
const MetadataValue = require('../App/metadataValue.model');

module.exports = (sequelize, DataTypes) => {
  class Programme extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //
      this.otherDepartments = this.hasMany(models.ProgrammeDepartment, {
        as: 'otherDepartments',
        foreignKey: 'programme_id',
        onDelete: 'cascade',
        hooks: true,
      });
      // GET programme department.
      this.department = this.belongsTo(models.Department, {
        as: 'department',
        foreignKey: 'department_id',
      });

      // Get the Programme award from Meta Data Value Table.
      this.award = this.belongsTo(models.MetadataValue, {
        as: 'award',
        foreignKey: 'award_id',
      });

      this.admissionType = this.belongsTo(models.MetadataValue, {
        as: 'admissionType',
        foreignKey: 'admission_type_id',
      });

      // Get the Programme study Times from Meta Data Value Table.
      this.programmeTypes = this.belongsToMany(models.MetadataValue, {
        through: models.ProgrammeType,
        as: 'programmeTypes',
        foreignKey: 'programme_id',
        otherKey: 'programme_type_id',
      });

      // Uss this to Save to Programme Study Times Table
      this.programmeStudyTypes = this.hasMany(models.ProgrammeType, {
        as: 'programmeStudyTypes',
        foreignKey: 'programme_id',
        onDelete: 'cascade',
        hooks: true,
      });

      // Get the Programme Study Years
      this.studyYears = this.belongsToMany(models.MetadataValue, {
        through: models.ProgrammeStudyYear,
        as: 'studyYears',
        foreignKey: 'programme_id',
        otherKey: 'programme_study_year_id',
      });

      // Save Programme Study Years
      this.programmeStudyYears = this.hasMany(models.ProgrammeStudyYear, {
        as: 'programmeStudyYears',
        foreignKey: 'programme_id',
        onDelete: 'cascade',
        hooks: true,
      });

      // Get the Programme campuses from Meta Data Value Table.
      this.campuses = this.belongsToMany(models.MetadataValue, {
        through: models.ProgrammeCampus,
        as: 'campuses',
        foreignKey: 'programme_id',
        otherKey: 'campus_id',
      });

      // Use this to save data to ProgrammeCampus table.
      this.programmeCampuses = this.hasMany(models.ProgrammeCampus, {
        as: 'programmeCampuses',
        foreignKey: 'programme_id',
        onDelete: 'cascade',
        hooks: true,
      });

      // Get the Programme Mode of Delivery from Meta Data Value Table.
      this.modesOfDelivery = this.belongsToMany(models.MetadataValue, {
        through: models.ProgrammeModeOfDelivery,
        as: 'modesOfDelivery',
        foreignKey: 'programme_id',
        otherKey: 'mode_of_delivery_id',
      });

      // Use this to save data to ProgrammeModeOfDelivery table.
      this.programModesOfDelivery = this.hasMany(
        models.ProgrammeModeOfDelivery,
        {
          as: 'programModesOfDelivery',
          foreignKey: 'programme_id',
          onDelete: 'cascade',
          hooks: true,
        }
      );

      // Get all Programme versions.
      this.versions = this.hasMany(models.ProgrammeVersion, {
        as: 'versions',
        foreignKey: 'programme_id',
        onDelete: 'cascade',
        hooks: true,
      });

      // Get all Programme versions.
      this.aliases = this.hasMany(models.ProgrammeAlias, {
        as: 'aliases',
        foreignKey: 'programme_id',
        onDelete: 'cascade',
        hooks: true,
      });

      // Programme Duration Measure.
      this.durationMeasure = this.belongsTo(models.MetadataValue, {
        as: 'durationMeasure',
        foreignKey: 'duration_measure_id',
      });

      // Programme Duration Measure.
      this.studyLevel = this.belongsTo(models.MetadataValue, {
        as: 'studyLevel',
        foreignKey: 'programme_study_level_id',
      });

      // The User who Heads this Programme.
      this.headedBy = this.belongsTo(models.User, { as: 'headedBy' });

      // Get the Programme entry Years from Meta Data Value Table.
      this.entryYears = this.belongsToMany(models.MetadataValue, {
        through: models.ProgrammeEntryYear,
        as: 'entryYears',
        foreignKey: 'programme_id',
        otherKey: 'entry_year_id',
      });

      // Use this to save data to ProgrammeVersionEntryYear table.
      this.programmeEntryYears = this.hasMany(models.ProgrammeEntryYear, {
        as: 'programmeEntryYears',
        foreignKey: 'programme_id',
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

  Programme.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      department_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: Department,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      award_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      admission_type_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      programme_study_level_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      headed_by_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      duration_measure_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      programme_code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      programme_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      programme_description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      admission_requirements: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      programme_duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      date_established: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_modular: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      is_classified: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      has_dissertation: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
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
      modelName: 'Programme',
      tableName: 'programmes',
      underscored: true,
      timestamps: true,
      schema: 'programme_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return Programme;
};
