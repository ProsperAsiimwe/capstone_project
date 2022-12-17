'use strict';

const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');
const MetadataValue = require('../App/metadataValue.model');
const ProgrammeVersionPlan = require('../ProgrammeManager/ProgrammeVersionPlan.model');

module.exports = (sequelize, DataTypes) => {
  class ProgrammeVersionPlanAdmissionCriteria extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get the programme version plan from programme version plans Table.
      this.programmeVersionPlan = this.belongsTo(models.ProgrammeVersionPlan, {
        as: 'programmeVersionPlan',
        foreignKey: 'programme_version_plan_id',
      });

      // Get the study level from Meta Data Value Table.
      this.studyLevel = this.belongsTo(models.MetadataValue, {
        as: 'studyLevel',
        foreignKey: 'study_level_id',
      });

      // Get the admission criteria category from Meta Data Value Table.
      this.weightingCategory = this.belongsTo(models.MetadataValue, {
        as: 'weightingCategory',
        foreignKey: 'criteria_category_id',
      });

      // Get the admission criteria condition from Meta Data Value Table.
      this.weightingCondition = this.belongsTo(models.MetadataValue, {
        as: 'weightingCondition',
        foreignKey: 'criteria_condition_id',
      });

      // Get all programme version plan admission criteria subjects
      this.subjects = this.belongsToMany(models.UnebSubject, {
        through: models.ProgrammeVersionPlanAdmissionCriteriaSubjects,
        as: 'subjects',
        foreignKey: 'programme_version_plan_admission_criteria_id',
        otherKey: 'uneb_subject_id',
      });
      // Use this to Save to ProgrammeVersionPlanAdmissionCriteriaSubjects Table
      this.unebSubjects = this.hasMany(
        models.ProgrammeVersionPlanAdmissionCriteriaSubjects,
        {
          as: 'unebSubjects',
          foreignKey: 'programme_version_plan_admission_criteria_id',
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

  ProgrammeVersionPlanAdmissionCriteria.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      programme_version_plan_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ProgrammeVersionPlan,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      study_level_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      criteria_category_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      criteria_condition_id: {
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
      modelName: 'ProgrammeVersionPlanAdmissionCriteria',
      tableName: 'programme_version_plan_admission_criterias',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return ProgrammeVersionPlanAdmissionCriteria;
};
