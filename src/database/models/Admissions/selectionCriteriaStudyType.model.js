'use strict';

const { Model, Deferrable } = require('sequelize');

const MetadataValue = require('../App/metadataValue.model');
const ProgrammeVersionSelectionCriteria = require('./programmeVersionSelectionCriteria.model');
const User = require('../UserAccess/user.model');

module.exports = (sequelize, DataTypes) => {
  class SelectionCriteriaStudyType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //
      this.criteria = this.belongsTo(models.ProgrammeVersionSelectionCriteria, {
        as: 'criteria',
        foreignKey: 'criteria_id',
      });
      //
      this.studyType = this.belongsTo(models.MetadataValue, {
        as: 'studyType',
        foreignKey: 'programme_study_type_id',
      });
      //
      this.entryYear = this.belongsTo(models.MetadataValue, {
        as: 'entryYear',
        foreignKey: 'entry_year_id',
      });

      // The User who Created this Record
      this.createdBy = this.belongsTo(models.User, {
        as: 'createdBy',
        foreignKey: 'created_by_id',
      });
    }
  }

  SelectionCriteriaStudyType.init(
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
          model: ProgrammeVersionSelectionCriteria,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      programme_study_type_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      entry_year_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      minimum_qualification_weights: {
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
      modelName: 'SelectionCriteriaStudyType',
      tableName: 'selection_criteria_programme_study_types',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return SelectionCriteriaStudyType;
};
