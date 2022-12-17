'use strict';

const { Model, Deferrable } = require('sequelize');

const MetadataValue = require('../App/metadataValue.model');
const User = require('../UserAccess/user.model');

module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      // programmes of a student
      this.programmes = this.hasMany(models.StudentProgramme, {
        as: 'programmes',
        foreignKey: 'student_id',
      });
      //
      this.admittedApplicants = this.hasMany(models.StudentApplication, {
        as: 'admittedApplicants',
        foreignKey: 'student_id',
      });
      //
      this.accountStatuses = this.hasMany(models.StudentAccountStatus, {
        as: 'accountStatuses',
        foreignKey: 'student_id',
      });

      // Get from model.
      this.studentAccountStatus = this.belongsTo(models.MetadataValue, {
        as: 'studentAccountStatus',
        foreignKey: 'student_account_status_id',
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

      // The User who Deleted this Record
      this.deletedBy = this.belongsTo(models.User, { as: 'deletedBy' });

      // The User who approved the Deletion to this Record
      this.deleteApprovedBy = this.belongsTo(models.User, {
        as: 'deleteApprovedBy',
      });
    }
  }

  Student.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      student_account_status_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: MetadataValue,
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
      emis_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      date_of_birth: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      home_district: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nationality: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      national_id_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      passport_id_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      religion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      guardian_name: {
        type: DataTypes.STRING,
        defaultValue: 'NO RECORD AVAILABLE',
        allowNull: false,
      },
      guardian_email: {
        type: DataTypes.STRING,
        defaultValue: 'NO RECORD AVAILABLE',
        allowNull: true,
      },
      guardian_phone: {
        type: DataTypes.STRING,
        defaultValue: 'NO RECORD AVAILABLE',
        allowNull: true,
      },
      guardian_relationship: {
        type: DataTypes.STRING,
        defaultValue: 'NO RECORD AVAILABLE',
        allowNull: true,
      },
      guardian_address: {
        type: DataTypes.STRING,
        defaultValue: 'NO RECORD AVAILABLE',
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_default_password: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      password_changed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      signature: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fingerprint_scan: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      iris_scan: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      email_verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      remember_token: {
        type: DataTypes.TEXT,
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
      modelName: 'Student',
      tableName: 'students',
      underscored: true,
      timestamps: true,
      schema: 'students_mgt',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return Student;
};
