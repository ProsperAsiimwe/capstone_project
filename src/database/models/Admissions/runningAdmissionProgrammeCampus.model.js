'use strict';

const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');
const ProgrammeAlias = require('../ProgrammeManager/programmeAlias.model');
const MetadataValue = require('../App/metadataValue.model');
const RunningAdmissionProgramme = require('../Admissions/runningAdmissionProgramme.model');

module.exports = (sequelize, DataTypes) => {
  class RunningAdmissionProgrammeCampus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //
      this.entryStudyYears = this.hasMany(
        models.RunningAdmissionProgrammeCampusEntryYear,
        {
          as: 'entryStudyYears',
          foreignKey: 'running_admission_programme_campus_id',
          onDelete: 'cascade',
          hooks: true,
        }
      );
      //
      this.sponsorships = this.hasMany(
        models.RunningAdmissionProgrammeCampusSponsorship,
        {
          as: 'sponsorships',
          foreignKey: 'running_admission_programme_campus_id',
          onDelete: 'cascade',
          hooks: true,
        }
      );
      //
      this.combinations = this.hasMany(
        models.RunningAdmissionProgrammeCampusCombination,
        {
          as: 'combinations',
          foreignKey: 'running_admission_programme_campus_id',
          onDelete: 'cascade',
          hooks: true,
        }
      );

      // Get the programme from metadata_values Table.
      this.runningAdmissionProgramme = this.belongsTo(
        models.RunningAdmissionProgramme,
        {
          as: 'runningAdmissionProgramme',
          foreignKey: 'running_admission_programme_id',
        }
      );

      // Get the alias from aliases Table.
      this.alias = this.belongsTo(models.ProgrammeAlias, {
        as: 'alias',
        foreignKey: 'programme_alias_id',
      });

      // Get the campus from metadata_values Table.
      this.campus = this.belongsTo(models.MetadataValue, {
        as: 'campus',
        foreignKey: 'campus_id',
      });

      // Get the international currency from Meta Data Value Table.
      this.internationalCurrency = this.belongsTo(models.MetadataValue, {
        as: 'internationalCurrency',
        foreignKey: 'international_currency_id',
      });

      // Get the programmeType from metadata_values Table.
      this.programmeType = this.belongsTo(models.MetadataValue, {
        as: 'programmeType',
        foreignKey: 'programme_type_id',
      });

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

  RunningAdmissionProgrammeCampus.init(
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
      programme_alias_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: ProgrammeAlias,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
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
      programme_type_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      special_remarks_and_requirements: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      activate_special_fees: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      international_currency_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      national_application_fees: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      east_african_application_fees: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      international_application_fees: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      national_admission_fees: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      east_african_admission_fees: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      international_admission_fees: {
        type: DataTypes.DOUBLE,
        allowNull: true,
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
      modelName: 'RunningAdmissionProgrammeCampus',
      tableName: 'running_admission_programme_campuses',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return RunningAdmissionProgrammeCampus;
};
