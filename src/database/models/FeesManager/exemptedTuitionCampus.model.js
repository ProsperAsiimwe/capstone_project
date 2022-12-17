'use strict';

const { Model, Deferrable } = require('sequelize');
const User = require('../UserAccess/user.model');
const MetadataValue = require('../App/metadataValue.model');

module.exports = (sequelize, DataTypes) => {
  class ExemptedTuitionCampus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //
      this.campus = this.belongsTo(models.MetadataValue, {
        as: 'campus',
        foreignKey: 'campus_id',
      });
      // The User who Created this Record
      this.createdBy = this.belongsTo(models.User, {
        as: 'createdBy',
        foreignKey: 'created_by_id',
      });
    }
  }

  ExemptedTuitionCampus.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      campus_id: {
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
      created_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
    },

    {
      sequelize,
      modelName: 'ExemptedTuitionCampus',
      tableName: 'exempted_tuition_fees_campuses',
      timestamps: true,
      underscored: true,
      schema: 'fees_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return ExemptedTuitionCampus;
};
