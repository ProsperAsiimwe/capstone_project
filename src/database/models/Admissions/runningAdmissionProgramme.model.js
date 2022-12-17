'use strict';

const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');
const RunningAdmission = require('../Admissions/runningAdmission.model');
const Programme = require('../ProgrammeManager/programme.model');
const ProgrammeVersion = require('../ProgrammeManager/programmeVersion.model');
const ProgrammeVersionWeightingCriteria = require('./programmeVersionWeightingCriteria.model');
const ProgrammeVersionSelectionCriteria = require('./programmeVersionSelectionCriteria.model');

module.exports = (sequelize, DataTypes) => {
  class RunningAdmissionProgramme extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get the running admission from running admission Table.
      this.runningAdmission = this.belongsTo(models.RunningAdmission, {
        as: 'runningAdmission',
        foreignKey: 'running_admission_id',
      });

      // Get the programme from Programmes table
      this.programme = this.belongsTo(models.Programme, {
        as: 'programme',
        foreignKey: 'programme_id',
      });

      // Get the programme versions from Programmes Versions table
      this.version = this.belongsTo(models.Programme, {
        as: 'version',
        foreignKey: 'version_id',
      });
      //
      this.weightingCriteria = this.belongsTo(
        models.ProgrammeVersionWeightingCriteria,
        {
          as: 'weightingCriteria',
          foreignKey: 'weighting_criteria_id',
        }
      );
      //
      this.selectionCriteria = this.belongsTo(
        models.ProgrammeVersionSelectionCriteria,
        {
          as: 'selectionCriteria',
          foreignKey: 'selection_criteria_id',
        }
      );

      //
      this.capacities = this.hasMany(models.RunningAdmissionProgrammeCampus, {
        as: 'capacities',
        foreignKey: 'running_admission_programme_id',
        onDelete: 'cascade',
        hooks: true,
      });

      //
      this.specialFees = this.hasMany(
        models.RunningAdmissionProgrammeSpecialFee,
        {
          as: 'specialFees',
          foreignKey: 'running_admission_programme_id',
          onDelete: 'cascade',
          hooks: true,
        }
      );

      // The User who Created this Record
      this.createdBy = this.belongsTo(models.User, { as: 'createdBy' });

      // The User who approved the newly created Record
      this.createApprovedBy = this.belongsTo(models.User, {
        as: 'createApprovedBy',
      });

      // The User who Last Updated this Record
      this.lastUpdatedBy = this.belongsTo(models.User, { as: 'lastUpdatedBy' });

      // The User who approved the last Update to this Record
      this.lastUpdateApprovedBy = this.belongsTo(models.User, {
        as: 'lastUpdateApprovedBy',
      });

      // The User who Deleted this Record
      this.deletedBy = this.belongsTo(models.User, { as: 'deletedBy' });

      // The User who approved the Deletion to this Record
      this.deleteApprovedBy = this.belongsTo(models.User, {
        as: 'deleteApprovedBy',
      });
    }
  }

  RunningAdmissionProgramme.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      running_admission_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: RunningAdmission,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      programme_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: Programme,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      version_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ProgrammeVersion,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      weighting_criteria_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: ProgrammeVersionWeightingCriteria,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      selection_criteria_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: ProgrammeVersionSelectionCriteria,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      is_managed: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      activate_special_fees: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      special_remarks_and_requirements: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_weighted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
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
      deleted_at: {
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
      deleted_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      delete_approved_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      delete_approval_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      delete_approval_status: {
        type: DataTypes.STRING,
        defaultValue: 'PENDING',
      },
    },
    {
      sequelize,
      modelName: 'RunningAdmissionProgramme',
      tableName: 'running_admission_programmes',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return RunningAdmissionProgramme;
};
