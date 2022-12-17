'use strict';

const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');
const RunningAdmissionProgramme = require('./runningAdmissionProgramme.model');
const ChartOfAccount = require('../UniversalPayments/chartOfAccount.model');

module.exports = (sequelize, DataTypes) => {
  class RunningAdmissionProgrammeSpecialFee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //
      this.runningAdmissionProg = this.belongsTo(
        models.RunningAdmissionProgramme,
        {
          as: 'runningAdmissionProg',
          foreignKey: 'running_admission_programme_id',
        }
      );
      // Model
      this.account = this.belongsTo(models.ChartOfAccount, {
        as: 'account',
        foreignKey: 'account_id',
      });

      // Model
      this.amounts = this.hasMany(models.SpecialFeeAmount, {
        as: 'amounts',
        foreignKey: 'programme_special_fees_id',
      });
    }
  }

  RunningAdmissionProgrammeSpecialFee.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      running_admission_programme_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: RunningAdmissionProgramme,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      account_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ChartOfAccount,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      special_fee_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      // Extra Record Details
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
    },
    {
      sequelize,
      modelName: 'RunningAdmissionProgrammeSpecialFee',
      tableName: 'running_admission_programme_special_fees',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return RunningAdmissionProgrammeSpecialFee;
};
