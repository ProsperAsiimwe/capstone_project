'use strict';

const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');
const MetadataValue = require('../App/metadataValue.model');
const RunningAdmissionApplicant = require('./runningAdmissionApplicant.model');
const MigratedApplicant = require('./migratedApplicantBiodata.model');
const Programme = require('../ProgrammeManager/programme.model');
const ProgrammeAlias = require('../ProgrammeManager/programmeAlias.model');
const ProgrammeVersion = require('../ProgrammeManager/programmeVersion.model');
const ProgrammeStudyYear = require('../ProgrammeManager/programmeStudyYear.model');
const SubjectCombination = require('../ProgrammeManager/SubjectCombination.model');
const FeesWaiver = require('../FeesManager/feesWaiver.model');
const AdmissionScheme = require('./admissionScheme.model');
const Sponsor = require('../UniversalPayments/sponsor.model');

module.exports = (sequelize, DataTypes) => {
  class DeletedAdmittedApplicant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Get the academic year from academic_years Table.
      this.entryAcademicYear = this.belongsTo(models.MetadataValue, {
        as: 'entryAcademicYear',
        foreignKey: 'entry_academic_year_id',
      });

      // Get the intake from Meta Data Value Table.
      this.intake = this.belongsTo(models.MetadataValue, {
        as: 'intake',
        foreignKey: 'intake_id',
      });

      // Get the Campus from Meta Data Value Table.
      this.campus = this.belongsTo(models.MetadataValue, {
        as: 'campus',
        foreignKey: 'campus_id',
      });

      //
      this.sponsorship = this.belongsTo(models.MetadataValue, {
        as: 'sponsorship',
        foreignKey: 'sponsorship_id',
      });
      //
      this.degree = this.belongsTo(models.MetadataValue, {
        as: 'degree',
        foreignKey: 'degree_category_id',
      });

      this.admissionScheme = this.belongsTo(models.AdmissionScheme, {
        as: 'admissionScheme',
        foreignKey: 'admission_scheme_id',
      });

      this.programme = this.belongsTo(models.Programme, {
        as: 'programme',
        foreignKey: 'programme_id',
      });

      this.programmeAlias = this.belongsTo(models.ProgrammeAlias, {
        as: 'programmeAlias',
        foreignKey: 'programme_alias_id',
      });

      //
      this.sponsor = this.belongsTo(models.Sponsor, {
        as: 'sponsor',
        foreignKey: 'sponsor_id',
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

  DeletedAdmittedApplicant.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      running_admission_applicant_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: RunningAdmissionApplicant,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      migrated_applicant_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MigratedApplicant,
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
      programme_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: Programme,
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
      programme_version_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ProgrammeVersion,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      entry_study_year_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: ProgrammeStudyYear,
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
      registration_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      student_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      residence_status_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      subject_combination_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: SubjectCombination,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      fees_waiver_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: FeesWaiver,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      billing_category_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      hall_of_attachment_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      hall_of_residence_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      mode_of_entry_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: MetadataValue,
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
      sponsor_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: Sponsor,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },

      surname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      other_names: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nationality: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      a_level_index: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      a_level_year: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_administratively_admitted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      student_account_created: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      batch_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      reg_no_prefix: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reg_no_counter: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      reg_no_postfix: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      std_no_prefix: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      std_no_counter: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      std_no_postfix: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      district_of_origin: {
        type: DataTypes.STRING,
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
      admission_letter: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      admission_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      admission_letter_printed_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      print_admission_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      admission_letter_sent: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      provisional_admission_letter: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      provisional_admission_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      provisional_letter_printed_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
          model: User,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      print_provisional_letter_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      provisional_letter_sent: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'DeletedAdmittedApplicant',
      tableName: 'deleted_admitted_applicants',
      underscored: true,
      timestamps: true,
      schema: 'admissions_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return DeletedAdmittedApplicant;
};
