'use strict';

const { Model, Deferrable } = require('sequelize');
const { Metadata } = require('./metadata.model');

module.exports = (sequelize, DataTypes) => {
  class MetadataValue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // The Meta Data this value belongs to.
      this.metadata = this.belongsTo(models.Metadata, {
        as: 'metadata',
        foreignKey: 'metadata_id',
      });

      // The User who Created this Meta Data Value
      this.createdBy = this.belongsTo(models.User, { as: 'createdBy' });
    }
  }

  MetadataValue.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      metadata_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          key: 'id',
          model: Metadata,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      metadata_value: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      metadata_value_description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      create_approval_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      create_approval_status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'PENDING',
      },
      created_by_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      create_approved_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
      modelName: 'MetadataValue',
      tableName: 'metadata_values',
      underscored: true,
      timestamps: true,
      schema: 'app_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return MetadataValue;
};
