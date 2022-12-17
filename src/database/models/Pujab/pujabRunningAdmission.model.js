'use strict';

const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');
const MetadataValue = require('../App/metadataValue.model');
const { ChartOfAccount } = require('@models/UniversalPayments');

module.exports = (sequelize, DataTypes) => {
  class PujabRunningAdmission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //
      this.academicYear = this.belongsTo(models.MetadataValue, {
        as: 'academicYear',
        foreignKey: 'academic_year_id',
      });

      this.institutions = this.hasMany(models.PujabAdmissionInstitution, {
        as: 'institutions',
        foreignKey: 'pujab_running_admission_id',
        onDelete: 'cascade',
        hooks: true,
      });

      this.pujabApplication = this.hasOne(models.PujabApplication, {
        as: 'pujabApplication',
        foreignKey: 'pujab_running_admission_id',
      });

      // The User who Created this Record
      this.createdBy = this.belongsTo(models.User, {
        as: 'createdBy',
        foreignKey: 'created_by_id',
      });

      // The billingCurrency
      this.billingCurrency = this.belongsTo(models.MetadataValue, {
        as: 'billingCurrency',
        foreignKey: 'currency_id',
      });

      // The chartOfAccount
      this.chartOfAccount = this.belongsTo(models.ChartOfAccount, {
        as: 'chartOfAccount',
        foreignKey: 'chart_of_account_id',
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

  PujabRunningAdmission.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      academic_year_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      currency_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      chart_of_account_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ChartOfAccount,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      currency: {
        type: DataTypes.STRING,
        defaultValue: 'UGX',
      },
      application_fee: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      service_fee: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      admission_start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      admission_end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      instructions: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
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
      modelName: 'PujabRunningAdmission',
      tableName: 'pujab_running_admissions',
      underscored: true,
      timestamps: true,
      schema: 'pujab_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return PujabRunningAdmission;
};
