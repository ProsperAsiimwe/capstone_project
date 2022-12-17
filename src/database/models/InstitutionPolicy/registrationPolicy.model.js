'use strict';

const { Model, Deferrable } = require('sequelize');

const User = require('../UserAccess/user.model');
const MetadataValue = require('../App/metadataValue.model');

module.exports = (sequelize, DataTypes) => {
  class RegistrationPolicy extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.enrollmentStatus = this.belongsTo(models.MetadataValue, {
        as: 'enrollmentStatus',
        foreignKey: 'enrollment_status_id',
      });

      this.registrationType = this.belongsTo(models.MetadataValue, {
        as: 'registrationType',
        foreignKey: 'registration_type_id',
      });

      // // save to RegistrationPolicyCampus table
      // this.campuses = this.hasMany(models.RegistrationPolicyCampus, {
      //   as: 'campuses',
      //   foreignKey: 'registration_policy_id',
      //   onDelete: 'cascade',
      //   hooks: true,
      // });
      // // save to RegistrationPolicyIntake table
      // this.intakes = this.hasMany(models.RegistrationPolicyIntake, {
      //   as: 'intakes',
      //   foreignKey: 'registration_policy_id',
      //   onDelete: 'cascade',
      //   hooks: true,
      // });
      // // save to RegistrationPolicySemester table
      // this.semesters = this.hasMany(models.RegistrationPolicySemester, {
      //   as: 'semesters',
      //   foreignKey: 'registration_policy_id',
      //   onDelete: 'cascade',
      //   hooks: true,
      // });
      // // save to RegistrationPolicyEntryAcademicYear table
      // this.entryAcadYrs = this.hasMany(models.RegPolicyEntryAcademicYear, {
      //   as: 'entryAcadYrs',
      //   foreignKey: 'registration_policy_id',
      //   onDelete: 'cascade',
      //   hooks: true,
      // });
      // // save to RegistrationPolicyEnrollmentStatus table
      // this.enrollmentStatuses = this.hasMany(
      //   models.RegistrationPolicyEnrollmentStatus,
      //   {
      //     as: 'enrollmentStatuses',
      //     foreignKey: 'registration_policy_id',
      //     onDelete: 'cascade',
      //     hooks: true,
      //   }
      // );

      // /**
      //  * Pick values directly from the pivot tables.
      //  */
      // this.pol_campuses = this.belongsToMany(models.MetadataValue, {
      //   through: models.RegistrationPolicyCampus,
      //   as: 'pol_campuses',
      //   foreignKey: 'registration_policy_id',
      //   otherKey: 'campus_id',
      // });
      // this.pol_intakes = this.belongsToMany(models.MetadataValue, {
      //   through: models.RegistrationPolicyIntake,
      //   as: 'pol_intakes',
      //   foreignKey: 'registration_policy_id',
      //   otherKey: 'intake_id',
      // });
      // this.pol_semesters = this.belongsToMany(models.MetadataValue, {
      //   through: models.RegistrationPolicySemester,
      //   as: 'pol_semesters',
      //   foreignKey: 'registration_policy_id',
      //   otherKey: 'semester_id',
      // });
      // this.pol_entryAcadYrs = this.belongsToMany(models.MetadataValue, {
      //   through: models.RegPolicyEntryAcademicYear,
      //   as: 'pol_entryAcadYrs',
      //   foreignKey: 'registration_policy_id',
      //   otherKey: 'entry_academic_year_id',
      // });
      // this.pol_enrollmentStatuses = this.belongsToMany(models.MetadataValue, {
      //   through: models.RegistrationPolicyEnrollmentStatus,
      //   as: 'pol_enrollmentStatuses',
      //   foreignKey: 'registration_policy_id',
      //   otherKey: 'enrollment_status_id',
      // });

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

      // The User who Deleted this Record
      this.deletedBy = this.belongsTo(models.User, { as: 'deletedBy' });

      // The User who approved the Deletion to this Record
      this.deleteApprovedBy = this.belongsTo(models.User, {
        as: 'deleteApprovedBy',
      });
    }
  }

  RegistrationPolicy.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      enrollment_status_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      registration_type_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      is_combined: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      tuition_fee_percentage: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      functional_fee_percentage: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      combined_fee_percentage: {
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
      modelName: 'RegistrationPolicy',
      tableName: 'registration_policies',
      underscored: true,
      timestamps: true,
      schema: 'enrollment_and_registration_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return RegistrationPolicy;
};
