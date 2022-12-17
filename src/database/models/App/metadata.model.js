'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Metadata extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // GET All meta Data Values
      this.metadataValues = this.hasMany(models.MetadataValue, {
        as: 'metadataValues',
        foreignKey: 'metadata_id',
      });

      // GET User who created this Meta Data
      this.createdBy = this.belongsTo(models.User, { as: 'createdBy' });
    }
  }

  Metadata.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      metadata_name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      metadata_description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      metadata_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_editable: {
        type: DataTypes.BOOLEAN,
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
      modelName: 'Metadata',
      tableName: 'metadata',
      underscored: true,
      timestamps: true,
      schema: 'app_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Metadata;
};
