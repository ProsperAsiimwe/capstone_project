'use strict';

const { Model, Deferrable } = require('sequelize');
const User = require('../UserAccess/user.model');

const MetadataValue = require('../App/metadataValue.model');
const ProgrammeVersion = require('./programmeVersion.model');

module.exports = (sequelize, DataTypes) => {
  class ProgrammeExemptReg extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //
      this.studyYear = this.belongsTo(models.MetadataValue, {
        as: 'studyYear',
        foreignKey: 'study_year_id',
      });
      //
      this.semester = this.belongsTo(models.MetadataValue, {
        as: 'semester',
        foreignKey: 'semester_id',
      });

      // The User who Created this Record
      this.createdBy = this.belongsTo(models.User, {
        as: 'createdBy',
        foreignKey: 'created_by_id',
      });
    }
  }

  ProgrammeExemptReg.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      programme_version_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ProgrammeVersion,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      study_year_id: {
        type: DataTypes.BIGINT,
        unique: true,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      semester_id: {
        type: DataTypes.BIGINT,
        unique: true,
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
      modelName: 'ProgrammeExemptReg',
      tableName: 'programme_exempted_registrations',
      underscored: true,
      timestamps: true,
      schema: 'programme_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return ProgrammeExemptReg;
};
