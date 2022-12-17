'use strict';

const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');
const Programme = require('./programme.model');
const MetadataValue = require('../App/metadataValue.model');

module.exports = (sequelize, DataTypes) => {
  class ProgrammeVersion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // The Program this version belongs too.
      this.programme = this.belongsTo(models.Programme, { as: 'programme' });

      this.specializationSemester = this.belongsTo(models.MetadataValue, {
        as: 'specializationSemester',
        foreignKey: 'specialization_semester_id',
      });

      this.specializationYear = this.belongsTo(models.MetadataValue, {
        as: 'specializationYear',
        foreignKey: 'specialization_year_id',
      });

      this.subjectCombSemester = this.belongsTo(models.MetadataValue, {
        as: 'subjectCombSemester',
        foreignKey: 'subject_combination_semester_id',
      });

      this.subjectCombYear = this.belongsTo(models.MetadataValue, {
        as: 'subjectCombYear',
        foreignKey: 'subject_combination_year_id',
      });

      // Get the program version specializations Table.
      this.specializations = this.belongsToMany(models.Specialization, {
        through: models.ProgrammeVersionSpecialization,
        as: 'specializations',
        foreignKey: 'programme_version_id',
        otherKey: 'specialization_id',
      });

      // Use this to save data to ProgrammeVersionSpecialization table.
      this.versionSpecializations = this.hasMany(
        models.ProgrammeVersionSpecialization,
        {
          as: 'versionSpecializations',
          foreignKey: 'programme_version_id',
          onDelete: 'cascade',
          hooks: true,
        }
      );

      // Get the programme version subjectCombCategories.
      this.subjectCombCategories = this.belongsToMany(models.MetadataValue, {
        through: models.SubjectCombinationCategory,
        as: 'subjectCombCategories',
        foreignKey: 'programme_version_id',
        otherKey: 'subject_combination_category_id',
      });
      // Use this to save data to SubjectCombinationCategory table.
      this.versionSubjCombCat = this.hasMany(
        models.SubjectCombinationCategory,
        {
          as: 'versionSubjCombCat',
          foreignKey: 'programme_version_id',
          onDelete: 'cascade',
          hooks: true,
        }
      );

      // Get the programme version plan.
      this.plans = this.belongsToMany(models.MetadataValue, {
        through: models.ProgrammeVersionPlan,
        as: 'plans',
        foreignKey: 'programme_version_id',
        otherKey: 'programme_version_plan_id',
      });
      // Use this to save data to ProgrammeVersionPlan table.
      this.versionPlans = this.hasMany(models.ProgrammeVersionPlan, {
        as: 'versionPlans',
        foreignKey: 'programme_version_id',
        onDelete: 'cascade',
        hooks: true,
      });

      // Get the programme version module.
      this.modules = this.belongsToMany(models.MetadataValue, {
        through: models.ProgrammeVersionModule,
        as: 'modules',
        foreignKey: 'programme_version_id',
        otherKey: 'module_id',
      });
      // Use this to save data to ProgrammeVersionModule table.
      this.versionModules = this.hasMany(models.ProgrammeVersionModule, {
        as: 'versionModules',
        foreignKey: 'programme_version_id',
        onDelete: 'cascade',
        hooks: true,
      });

      // Save course units
      this.courseUnits = this.hasMany(models.ProgrammeVersionCourseUnit, {
        as: 'courseUnits',
        foreignKey: 'programme_version_id',
        onDelete: 'cascade',
        hooks: true,
      });

      // Get the Programme entry Years from Meta Data Value Table.
      this.entryYears = this.belongsToMany(models.MetadataValue, {
        through: models.ProgrammeVersionEntryYear,
        as: 'entryYears',
        foreignKey: 'programme_version_id',
        otherKey: 'entry_year_id',
      });

      // Use this to save data to ProgrammeVersionEntryYear table.
      this.versionEntryYears = this.hasMany(models.ProgrammeVersionEntryYear, {
        as: 'versionEntryYears',
        foreignKey: 'programme_version_id',
        onDelete: 'cascade',
        hooks: true,
      });

      //
      this.exemptRegs = this.hasMany(models.ProgrammeExemptReg, {
        as: 'exemptRegs',
        foreignKey: 'programme_version_id',
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

  ProgrammeVersion.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      programme_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          key: 'id',
          model: Programme,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      specialization_semester_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      specialization_year_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      subject_combination_semester_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      subject_combination_year_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      version_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      has_plan: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      is_current_version: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      has_subject_combination_categories: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      has_specializations: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      has_exempt_registration: {
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
      modelName: 'ProgrammeVersion',
      tableName: 'programme_versions',
      underscored: true,
      timestamps: true,
      schema: 'programme_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return ProgrammeVersion;
};
