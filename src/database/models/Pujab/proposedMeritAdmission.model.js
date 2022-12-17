'use strict';

const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');

module.exports = (sequelize, DataTypes) => {
  class ProposedMeritAdmission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //
      this.uaceGrades = this.hasMany(models.ProposedMeritAdmissionUaceGrade, {
        as: 'uaceGrades',
        foreignKey: 'proposed_merit_id',
        onDelete: 'cascade',
        hooks: true,
      });

      //
      this.choices = this.hasMany(models.ProposedMeritAdmissionChoice, {
        as: 'choices',
        foreignKey: 'proposed_merit_id',
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
    }
  }

  ProposedMeritAdmission.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      index_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      uace_year: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      district_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      district: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      admitted_programme_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      admitted_programme_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      admitted_institution: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      uce_weight: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      final_weight: {
        type: DataTypes.DOUBLE,
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
    },
    {
      sequelize,
      modelName: 'ProposedMeritAdmission',
      tableName: 'proposed_merit_admissions',
      underscored: true,
      timestamps: true,
      schema: 'pujab_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return ProposedMeritAdmission;
};
