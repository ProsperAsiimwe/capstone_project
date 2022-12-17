'use strict';

const { Model, Deferrable } = require('sequelize');

const MetadataValue = require('../App/metadataValue.model');
const ProgrammeVersionWeightingCriteria = require('./programmeVersionWeightingCriteria.model');
const User = require('../UserAccess/user.model');

module.exports = (sequelize, DataTypes) => {
  class WeightingCriteriaCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //
      this.criteria = this.belongsTo(models.ProgrammeVersionWeightingCriteria, {
        as: 'criteria',
        foreignKey: 'criteria_id',
      });
      // Get the study level from Meta Data Value Table.
      this.unebStudyLevel = this.belongsTo(models.MetadataValue, {
        as: 'unebStudyLevel',
        foreignKey: 'uneb_study_level_id',
      });

      // Get the admission criteria category from Meta Data Value Table.
      this.weightingCategory = this.belongsTo(models.MetadataValue, {
        as: 'weightingCategory',
        foreignKey: 'weighting_category_id',
      });

      // Get the admission criteria condition from Meta Data Value Table.
      this.weightingCondition = this.belongsTo(models.MetadataValue, {
        as: 'weightingCondition',
        foreignKey: 'weighting_condition_id',
      });

      // Get all programme version admission criteria subjects
      this.subjects = this.belongsToMany(models.UnebSubject, {
        through: models.WeightingCriteriaCategorySubject,
        as: 'subjects',
        foreignKey: 'criteria_category_id',
        otherKey: 'uneb_subject_id',
      });

      // Use this to Save to
      this.unebSubjects = this.hasMany(
        models.WeightingCriteriaCategorySubject,
        {
          as: 'unebSubjects',
          foreignKey: 'criteria_category_id',
        }
      );

      // The User who Created this Record
      this.createdBy = this.belongsTo(models.User, {
        as: 'createdBy',
        foreignKey: 'created_by_id',
      });
    }
  }

  WeightingCriteriaCategory.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      criteria_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ProgrammeVersionWeightingCriteria,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      uneb_study_level_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      weighting_category_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      weighting_condition_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      weight: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },

      // Record Details
      created_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'WeightingCriteriaCategory',
      tableName: 'weighting_criteria_categories',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return WeightingCriteriaCategory;
};
