'use strict';

const { Model, Deferrable } = require('sequelize');

const MetadataValue = require('../App/metadataValue.model');

module.exports = (sequelize, DataTypes) => {
  class AcademicYearFeesPolicy extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Model
      this.feesCategory = this.belongsTo(models.MetadataValue, {
        as: 'feesCategory',
        foreignKey: 'fees_category_id',
      });
      // Model
      this.enrollmentStatus = this.belongsTo(models.MetadataValue, {
        as: 'enrollmentStatus',
        foreignKey: 'enrollment_status_id',
      });
    }
  }

  AcademicYearFeesPolicy.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fees_category_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      enrollment_status_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      bill_by_entry_academic_year: {
        type: DataTypes.BOOLEAN,
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
    },
    {
      sequelize,
      modelName: 'AcademicYearFeesPolicy',
      tableName: 'academic_year_fees_policies',
      underscored: true,
      timestamps: true,
      schema: 'institution_policy_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return AcademicYearFeesPolicy;
};
