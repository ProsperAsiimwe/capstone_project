'use strict';

const { Model, Deferrable } = require('sequelize');

const MigratedApplicant = require('./migratedApplicantBiodata.model');
const Programme = require('../ProgrammeManager/programme.model');
const ProgrammeVersion = require('../ProgrammeManager/programmeVersion.model');
const ProgrammeAlias = require('../ProgrammeManager/programmeAlias.model');
const MetadataValue = require('../App/metadataValue.model');
const AdmissionScheme = require('./admissionScheme.model');

module.exports = (sequelize, DataTypes) => {
  class MigratedApplicantProgrammeChoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get from model.
      this.programme = this.belongsTo(models.Programme, {
        as: 'programme',
        foreignKey: 'programme_id',
      });

      // Get from model.
      this.programmeType = this.belongsTo(models.ProgrammeType, {
        as: 'programmeType',
        foreignKey: 'programme_type_id',
      });

      // Get from model.
      this.programmeVersion = this.belongsTo(models.ProgrammeVersion, {
        as: 'programmeVersion',
        foreignKey: 'programme_version_id',
      });

      // Get from model.
      this.entryStudyYear = this.belongsTo(models.MetadataValue, {
        as: 'entryStudyYear',
        foreignKey: 'entry_study_year_id',
      });

      // Get from model.
      this.campus = this.belongsTo(models.MetadataValue, {
        as: 'campus',
        foreignKey: 'campus_id',
      });

      // Get from model.
      this.intake = this.belongsTo(models.MetadataValue, {
        as: 'intake',
        foreignKey: 'intake_id',
      });
    }
  }

  MigratedApplicantProgrammeChoice.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      migrated_applicant_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MigratedApplicant,
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
      programme_version_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ProgrammeVersion,
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
      programme_type_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      entry_study_year_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
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
      intake_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      entry_academic_year_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      sponsorship_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      degree_category_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      admission_scheme_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: AdmissionScheme,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      choice_number_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      choice_number: {
        type: DataTypes.INTEGER,
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
    },
    {
      sequelize,
      modelName: 'MigratedApplicantProgrammeChoice',
      tableName: 'migrated_applicant_programme_choices',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return MigratedApplicantProgrammeChoice;
};
